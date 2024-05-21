use near_sdk::{json_types::{U128, U64}, AccountId};
use near_workspaces::types::NearToken;
use serde_json::json;

const ONE_NEAR: NearToken = NearToken::from_near(1);
const STORAGE_COST: NearToken = NearToken::from_millinear(1);

#[tokio::test]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let sandbox = near_workspaces::sandbox().await?;
    let contract_wasm = near_workspaces::compile_project("./").await?;

    let contract = sandbox.dev_deploy(&contract_wasm).await?;
    let alice_account = sandbox.dev_create_account().await?;
    let bob_account = sandbox.dev_create_account().await?;
    let beneficiary_account = sandbox.dev_create_account().await?;

    let initial_balance = beneficiary_account.view_account().await?.balance;

    let outcome_init = contract
        .call("init")
        .args_json(json!({"beneficiary": beneficiary_account.id()}))
        .transact()
        .await?;

    assert!(outcome_init.is_success());

    let alice_first_donation_outcome = alice_account
        .call(contract.id(), "donate")
        .args_json({})
        .deposit(ONE_NEAR)
        .transact()
        .await?;

    assert!(alice_first_donation_outcome.is_success());

    let bob_first_donation_outcome = bob_account
        .call(contract.id(), "donate")
        .args_json({})
        .deposit(ONE_NEAR)
        .transact()
        .await?;

    assert!(bob_first_donation_outcome.is_success());

    let _ = alice_account
        .call(contract.id(), "donate")
        .args_json({})
        .deposit(ONE_NEAR.saturating_mul(3))
        .transact()
        .await?
        .into_result();

    let number_of_donors: U64 = contract
        .view("number_of_donors")
        .args_json({})
        .await?
        .json()?;

    #[derive(near_sdk::serde::Serialize, near_sdk::serde::Deserialize, Debug, PartialEq)]
    #[serde(crate = "near_sdk::serde")]
    struct Donation {
        account_id: AccountId,
        total_amount: U128,
    }

    let donation: Donation = contract
        .view("get_donation_for_account")
        .args_json(json!({"account_id": alice_account.id()}))
        .await?
        .json()?;

    assert_eq!(number_of_donors, U64::from(2));
    assert_eq!(u128::from(donation.total_amount), NearToken::from_near(4).as_yoctonear());

    let donation_vec: Vec<Donation> = contract
        .view("get_donations")
        .args_json(json!({}))
        .await?
        .json()?;

    assert_eq!(
        donation_vec,
        vec![
            Donation {
                account_id: alice_account.id().clone(),
                total_amount: U128::from(NearToken::from_near(4).as_yoctonear()),
            },
            Donation {
                account_id: bob_account.id().clone(),
                total_amount: U128::from(NearToken::from_near(1).as_yoctonear()),
            },
        ]
    );

    // total donation amount excluding the costs necesseary for storage
    let donation_amount = NearToken::from_near(5).saturating_sub(STORAGE_COST.saturating_mul(2));
    let expected_balance = initial_balance.saturating_add(donation_amount);

    assert_eq!(
        beneficiary_account.view_account().await?.balance,
        expected_balance
    );

    Ok(())
}
