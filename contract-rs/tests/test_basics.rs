use near_api::types::{AccountId, NearToken};
use near_sdk::json_types::{U128, U64};
use serde_json::json;

const ONE_NEAR: NearToken = NearToken::from_near(1);
const STORAGE_COST: NearToken = NearToken::from_millinear(1);

#[tokio::test]
async fn test_contract_is_operational() -> testresult::TestResult<()> {
    // Initialize the sandbox
    let sandbox = near_sandbox::Sandbox::start_sandbox().await?;
    let sandbox_network =
        near_api::NetworkConfig::from_rpc_url("sandbox", sandbox.rpc_addr.parse()?);

    // Build the contract
    let contract_wasm_path = cargo_near_build::build_with_cli(Default::default())?;
    let contract_wasm = std::fs::read(contract_wasm_path)?;

    // Create accounts
    let alice = create_subaccount(&sandbox, "alice.sandbox").await?;
    let bob = create_subaccount(&sandbox, "bob.sandbox").await?;
    let beneficiary = create_subaccount(&sandbox, "beneficiary.sandbox").await?;
    let contract = create_subaccount(&sandbox, "donation.sandbox")
        .await?
        .as_contract();

    // Initialize signer for the contract deployment
    let signer = near_api::Signer::from_secret_key(
        near_sandbox::config::DEFAULT_GENESIS_ACCOUNT_PRIVATE_KEY
            .parse()
            .unwrap(),
    )?;

    // Deploy the contract and initialize it with the beneficiary
    near_api::Contract::deploy(contract.account_id().clone())
        .use_code(contract_wasm)
        .with_init_call(
            "init",
            json!({ "beneficiary": beneficiary.account_id() }),
        )?
        .with_signer(signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    let initial_balance = near_api::Account(beneficiary.account_id().clone())
        .view()
        .fetch_from(&sandbox_network)
        .await?
        .data
        .amount;

    // Alice and Bob donate
    for (donor, amount) in [
        (&alice, ONE_NEAR),
        (&bob, ONE_NEAR),
        (&alice, ONE_NEAR.saturating_mul(3)),
    ] {
        contract
            .call_function("donate", json!({}))
            .transaction()
            .deposit(amount)
            .with_signer(donor.account_id().clone(), signer.clone())
            .send_to(&sandbox_network)
            .await?
            .assert_success();
    }

    // There are two donors
    let number_of_donors: U64 = contract
        .call_function("number_of_donors", json!({}))
        .read_only()
        .fetch_from(&sandbox_network)
        .await?
        .data;
    assert_eq!(number_of_donors, U64::from(2));

    #[derive(near_sdk::serde::Serialize, near_sdk::serde::Deserialize, Debug, PartialEq)]
    #[serde(crate = "near_sdk::serde")]
    struct Donation {
        account_id: String,
        total_amount: U128,
    }

    // Alice's donations are accumulated
    let donation: Donation = contract
        .call_function("get_donation_for_account", json!({"account_id": alice.account_id()}))
        .read_only()
        .fetch_from(&sandbox_network)
        .await?
        .data;
    assert_eq!(
        u128::from(donation.total_amount),
        NearToken::from_near(4).as_yoctonear()
    );

    // All donations are recorded
    let donations: Vec<Donation> = contract
        .call_function("get_donations", json!({}))
        .read_only()
        .fetch_from(&sandbox_network)
        .await?
        .data;
    assert_eq!(
        donations,
        vec![
            Donation {
                account_id: alice.account_id().to_string(),
                total_amount: U128::from(NearToken::from_near(4).as_yoctonear()),
            },
            Donation {
                account_id: bob.account_id().to_string(),
                total_amount: U128::from(NearToken::from_near(1).as_yoctonear()),
            },
        ]
    );

    // The beneficiary received the donations, minus the storage costs
    let donation_amount = NearToken::from_near(5).saturating_sub(STORAGE_COST.saturating_mul(2));
    let final_balance = near_api::Account(beneficiary.account_id().clone())
        .view()
        .fetch_from(&sandbox_network)
        .await?
        .data
        .amount;
    assert_eq!(final_balance, initial_balance.saturating_add(donation_amount));

    Ok(())
}

async fn create_subaccount(
    sandbox: &near_sandbox::Sandbox,
    name: &str,
) -> testresult::TestResult<near_api::Account> {
    let account_id: AccountId = name.parse().unwrap();
    sandbox
        .create_account(account_id.clone())
        .initial_balance(NearToken::from_near(10))
        .send()
        .await?;
    Ok(near_api::Account(account_id))
}
