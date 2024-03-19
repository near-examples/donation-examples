# Donation Contract

The smart contract exposes multiple methods to handle donating NEAR Tokens to a
beneficiary set on initialization.

## How to Build Locally?

Install [`cargo-near`](https://github.com/near/cargo-near) and run:

```bash
cargo near build
```

## How to Test Locally?

```bash
cargo test
```

## How to Interact?

_In this example we will be using [NEAR CLI](https://github.com/near/near-cli)
to intract with the NEAR blockchain and the smart contract_

_If you want full control over of your interactions we recommend using the
[near-cli-rs](https://near.cli.rs)._

### Initialize

The contract will be automatically initialized with a default beneficiary. To
initialize the contract yourself do:

```bash
near call <deployed-to-account> init '{"beneficiary":"<account>"}' --accountId <deployed-to-account>
```

### Get Beneficiary

`get_beneficiary` is a read-only method (view method) that returns the
beneficiary of the donations.

View methods can be called for free by anyone, even people without a NEAR
account!

```bash
near view <deployed-to-account> get_beneficiary
```

### Change Beneficiary

`change_beneficiary` is a read-only method (view method) that returns the
beneficiary of the donations.

View methods can be called for free by anyone, even people without a NEAR
account!

```bash
near call <deployed-to-account> change_beneficiary {"new_beneficiary": "<new-baccount>"} --accountId <deployed-to-account>
```

### Donate

`donate` forwards any attached NEAR tokens to the `beneficiary` while keeping
track of it.

`donate` is a payable method for which can only be invoked using a NEAR account.
The account needs to attach NEAR Tokens and pay GAS for the transaction.

```bash
near call <deployed-to-account> donate --amount 1 --accountId <account>
```

```rust
#[payable]
    pub fn donate(&mut self) -> String {
        // Get who is calling the method and how much NEAR they attached
        let donor: AccountId = env::predecessor_account_id();
        let donation_amount = env::attached_deposit();

        require!(
            donation_amount > STORAGE_COST,
            format!(
                "Attach at least {} yoctoNEAR to cover for the storage cost",
                STORAGE_COST
            )
        );

        let mut donated_so_far: NearToken = self
            .donations
            .get(&donor)
            .unwrap_or(NearToken::from_near(0));

        let to_transfer = if donated_so_far.is_zero() {
            // This is the user's first donation, lets register it, which increases storage
            // Subtract the storage cost to the amount to transfer
            donation_amount.saturating_sub(STORAGE_COST).to_owned()
        } else {
            donation_amount
        };

        // Persist in storage the amount donated so far
        donated_so_far = donated_so_far.saturating_add(donation_amount);

        self.donations.insert(&donor, &donated_so_far);

        log!(
            "Thank you {} for donating {}! You donated a total of {}",
            donor.clone(),
            donation_amount,
            donated_so_far
        );

        // Send the NEAR to the beneficiary
        Promise::new(self.beneficiary.clone()).transfer(to_transfer);

        // Return the total amount donated so far
        donated_so_far.to_string()
    }
```

### Get Number of Donors

```bash
near view <deployed-to-account> number_of_donors
```

### Get Donations for Account

```bash
near view <deployed-to-account> get_donation_for_account '{"account_id":"<account>"}'
```

### Get Total Donations

```bash
near view <deployed-to-account> get_donations
```

## Useful Links

- [cargo-near](https://github.com/near/cargo-near) - NEAR smart contract
  development toolkit for Rust
- [near CLI-RS](https://near.cli.rs) - Iteract with NEAR blockchain from command
  line
- [NEAR Rust SDK Documentation](https://docs.near.org/sdk/rust/introduction)
- [NEAR Documentation](https://docs.near.org)
- [NEAR StackOverflow](https://stackoverflow.com/questions/tagged/nearprotocol)
- [NEAR Discord](https://near.chat)
- [NEAR Telegram Developers Community Group](https://t.me/neardev)
- NEAR DevHub: [Telegram](https://t.me/neardevhub),
  [Twitter](https://twitter.com/neardevhub)
