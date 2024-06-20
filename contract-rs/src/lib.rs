// Find all our documentation at https://docs.near.org
use near_sdk::store::UnorderedMap;
use near_sdk::{near, AccountId, NearToken, PanicOnDefault};

mod donation;

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract {
    pub beneficiary: AccountId,
    pub donations: UnorderedMap<AccountId, NearToken>,
}

#[near]
impl Contract {
    #[init]
    #[private] // only callable by the contract's account
    pub fn init(beneficiary: AccountId) -> Self {
        Self {
            beneficiary,
            donations: UnorderedMap::new(b"d"),
        }
    }

    pub fn get_beneficiary(&self) -> &AccountId {
        &self.beneficiary
    }

    #[private] // only callable by the contract's account
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
    fn initalizes() {
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
        assert_eq!(
            u128::from(first_donation.total_amount),
            ONE_NEAR.as_yoctonear()
        );

        // Make another donation
        set_context("donor_b", ONE_NEAR.saturating_mul(2));
        contract.donate();
        let second_donation = contract.get_donation_for_account("donor_b".parse().unwrap());

        // Check the donation was recorded correctly
        assert_eq!(
            u128::from(second_donation.total_amount),
            ONE_NEAR.saturating_mul(2).as_yoctonear()
        );

        // User A makes another donation on top of their original
        set_context("donor_a", ONE_NEAR);
        contract.donate();
        let first_donation = contract.get_donation_for_account("donor_a".parse().unwrap());

        // Check the donation was recorded correctly
        assert_eq!(
            u128::from(first_donation.total_amount),
            ONE_NEAR.saturating_mul(2).as_yoctonear()
        );

        assert_eq!(u64::from(contract.number_of_donors()), 2);
    }

    // Auxiliar fn: create a mock context
    fn set_context(predecessor: &str, amount: NearToken) {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(predecessor.parse().unwrap());
        builder.attached_deposit(amount);

        testing_env!(builder.build());
    }
}
