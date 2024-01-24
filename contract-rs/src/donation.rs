use crate::Contract;
use crate::ContractExt;

use near_sdk::serde::Serialize;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, log, near_bindgen, AccountId, Promise, Balance};
use near_sdk::json_types::U128;

pub const STORAGE_COST: u128 = 1_000_000_000_000_000_000_000;

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Donation {
  pub account_id: AccountId, 
  pub total_amount: U128,
}

#[near_bindgen]
impl Contract {
  #[payable] // Public - People can attach money
  pub fn donate(&mut self) -> U128 {
    // Get who is calling the method and how much $NEAR they attached
    let donor: AccountId = env::predecessor_account_id();
    let donation_amount: Balance = env::attached_deposit();

    let mut donated_so_far = self.donations.get(&donor).unwrap_or(0);

    let to_transfer: Balance = if donated_so_far == 0 {
      // This is the user's first donation, lets register it, which increases storage
      assert!(donation_amount > STORAGE_COST, "Attach at least {} yoctoNEAR", STORAGE_COST);

      // Subtract the storage cost to the amount to transfer
      donation_amount - STORAGE_COST
    }else{
      donation_amount
    };

    // Persist in storage the amount donated so far
    donated_so_far += donation_amount;
    self.donations.insert(&donor, &donated_so_far);
    
    log!("Thank you {} for donating {}! You donated a total of {}", donor.clone(), donation_amount, donated_so_far);
    
    // Send the money to the beneficiary
    Promise::new(self.beneficiary.clone()).transfer(to_transfer);

    // Return the total amount donated so far
    U128(donated_so_far)
  }

  // Public - get donation by account ID
  pub fn get_donation_for_account(&self, account_id: AccountId) -> Donation {
    Donation {
      account_id: account_id.clone(),
      total_amount: U128(self.donations.get(&account_id).unwrap_or(0))
    }
  }

  // Public - get total number of donors
  pub fn number_of_donors(&self) -> u64 {
    self.donations.len()
  }

  // Public - paginate through all donations on the contract
  pub fn get_donations(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<Donation> {
    //where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
    let start = u128::from(from_index.unwrap_or(U128(0)));

    //iterate through donation
    self.donations.keys()
      //skip to the index we specified in the start variable
      .skip(start as usize) 
      //take the first "limit" elements in the vector. If we didn't specify a limit, use 50
      .take(limit.unwrap_or(50) as usize) 
      .map(|account| self.get_donation_for_account(account))
      //since we turned map into an iterator, we need to turn it back into a vector to return
      .collect()
  }
}