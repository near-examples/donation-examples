// Find all our documentation at https://docs.near.org
use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::{near_bindgen, AccountId, NearToken};

mod donation;

// Define the contract structure
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
#[borsh(crate = "near_sdk::borsh")]

pub struct Contract {
    pub beneficiary: AccountId,
    pub donations: UnorderedMap<AccountId, NearToken>,
}

// Define the default, which automatically initializes the contract
impl Default for Contract {
    fn default() -> Self {
        Self {
            beneficiary: "v2.faucet.nonofficial.testnet".parse().unwrap(),
            donations: UnorderedMap::new(b"d"),
        }
    }
}

// Implement the contract structure
#[near_bindgen]
impl Contract {
    // Public Method - but only callable by env::current_account_id()
    // initializes the contract with a beneficiary
    #[init]
    #[private]
    pub fn init(beneficiary: AccountId) -> Self {
        Self {
            beneficiary,
            donations: UnorderedMap::new(b"d"),
        }
    }

    // Public Method - get the current beneficiary
    pub fn get_beneficiary(&self) -> &AccountId {
        &self.beneficiary
    }

    // Public Method - but only callable by env::current_account_id()
    // sets the beneficiary
    #[private]
    pub fn change_beneficiary(&mut self, new_beneficiary: AccountId) {
        self.beneficiary = new_beneficiary;
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 */
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;
    use near_sdk::NearToken;

    const BENEFICIARY: &str = "beneficiary";
    const ONE_NEAR: NearToken = NearToken::from_near(1);

    #[test]
    fn initializes() {
        let contract = Contract::init(BENEFICIARY.parse().unwrap());
        assert_eq!(
            contract.beneficiary,
            BENEFICIARY.parse::<AccountId>().unwrap().to_string()
        );
    }

    #[test]
    fn donate() {
        let mut contract = Contract::init(BENEFICIARY.parse().unwrap());

        // Make a donation
        set_context("donor_a", ONE_NEAR);
        contract.donate();
        let first_donation = contract.get_donation_for_account("donor_a".parse().unwrap());

        // Check the donation was recorded correctly
        assert_eq!(first_donation.total_amount, ONE_NEAR);

        // Make another donation
        set_context("donor_b", ONE_NEAR.saturating_mul(2));
        contract.donate();
        let second_donation = contract.get_donation_for_account("donor_b".parse().unwrap());

        // Check the donation was recorded correctly
        assert_eq!(second_donation.total_amount, ONE_NEAR.saturating_mul(2));

        // User A makes another donation on top of their original
        set_context("donor_a", ONE_NEAR);
        contract.donate();
        let first_donation = contract.get_donation_for_account("donor_a".parse().unwrap());

        // Check the donation was recorded correctly
        assert_eq!(first_donation.total_amount, ONE_NEAR.saturating_mul(2));

        assert_eq!(contract.number_of_donors(), 2);
    }

    // Auxiliar fn: create a mock context
    fn set_context(predecessor: &str, amount: NearToken) {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(predecessor.parse().unwrap());
        builder.attached_deposit(amount);

        testing_env!(builder.build());
    }
}
