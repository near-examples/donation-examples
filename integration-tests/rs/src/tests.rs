use serde_json::json;
use near_units::parse_near;
use workspaces::prelude::*; 
use workspaces::{network::Sandbox, Account, Contract, Worker};

const WASM_FILEPATH: &str = "../../out/main.wasm";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let worker = workspaces::sandbox().await?;
    let wasm = std::fs::read(WASM_FILEPATH)?;
    let contract = worker.dev_deploy(&wasm).await?;

    // create accounts
    let alice = worker.dev_create_account().await?;

    let bob = worker.dev_create_account().await?;

    let beneficiary = worker.dev_create_account().await?;

    // Initialize contract
    contract.call(&worker, "init")
            .args_json(json!({"beneficiary": beneficiary.id()}))?
            .transact()
            .await?;

    // begin tests  
    test_donation(&alice, &bob, &beneficiary, &contract, &worker).await?;
    test_records(&alice, &contract, &worker).await?;
    Ok(())
}   

async fn test_donation(
    alice: &Account,
    bob: &Account,
    beneficiary: &Account,
    contract: &Contract,
    worker: &Worker<Sandbox>,
) -> anyhow::Result<()> {
    let balance = beneficiary
        .view_account(&worker)
        .await?
        .balance;

    alice.call(&worker, contract.id(), "donate")
         .deposit(parse_near!("1 N"))
         .transact()
         .await?;

    bob.call(&worker, contract.id(), "donate")
       .deposit(parse_near!("2 N"))
       .transact()
       .await?;

    let new_balance = beneficiary.view_account(&worker)
    .await?
    .balance;

    const FEES: u128 = parse_near!("0.001 N");
    assert_eq!(new_balance, balance + parse_near!("3 N") - 2*FEES );

    println!("      Passed ✅ sends donation");
    Ok(())
}

async fn test_records(
    alice: &Account,
    contract: &Contract,
    worker: &Worker<Sandbox>,
) -> anyhow::Result<()> {
    let donation_idx: String = alice.call(&worker, contract.id(), "donate")
       .deposit(parse_near!("3 N"))
       .transact()
       .await?
       .json()?;

    assert_eq!(donation_idx, parse_near!("4 N").to_string());

    let donation: serde_json::Value = alice.call(&worker, contract.id(), "get_donation_for_account")
       .args_json(json!({"account_id": alice.id()}))?
       .transact()
       .await?
       .json()?;

    let expected = json!(
        {
            "total_amount": parse_near!("4N").to_string(),
            "account_id": alice.id()
        }
    );    

    assert_eq!(donation, expected);

    println!("      Passed ✅ retrieves donation");
    Ok(())
}