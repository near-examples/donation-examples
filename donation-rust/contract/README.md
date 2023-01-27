# Donation Contract

The smart contract exposes multiple methods to handle donating money to a `beneficiary` set on initialization.

```rust
#[payable] // Public - People can attach money
pub fn donate(&mut self) -> U128 {
  // Get who is calling the method
  // and how much $NEAR they attached
  let donor: AccountId = env::predecessor_account_id();
  let donation_amount: Balance = env::attached_deposit();

  let mut donated_so_far = self.donations.get(&donor).unwrap_or(0);

  let to_transfer: Balance = if donated_so_far == 0 {
    // Registering the user's first donation increases storage
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
```

<br />

# Quickstart

1. Make sure you have installed [rust](https://rust.org/).
2. Install the [`NEAR CLI`](https://github.com/near/near-cli#setup)

<br />

## 1. Build and Deploy the Contract
You can automatically compile and deploy the contract in the NEAR testnet by running:

```bash
./deploy.sh
```

Once finished, check the `neardev/dev-account` file to find the address in which the contract was deployed:

```bash
cat ./neardev/dev-account
# e.g. dev-1659899566943-21539992274727
```

The contract will be automatically initialized with a default `beneficiary`.

To initialize the contract yourself do:

```bash
# Use near-cli to initialize contract (optional)
near call <dev-account> new '{"beneficiary":"<account>"}' --accountId <dev-account>
```

<br />

## 2. Get Beneficiary
`beneficiary` is a read-only method (`view` method) that returns the beneficiary of the donations.

`View` methods can be called for **free** by anyone, even people **without a NEAR account**!

```bash
near view <dev-account> beneficiary
```

<br />

## 3. Get Number of Donations

`donate` forwards any attached money to the `beneficiary` while keeping track of it.

`donate` is a payable method for which can only be invoked using a NEAR account. The account needs to attach money and pay GAS for the transaction.

```bash
# Use near-cli to donate 1 NEAR
near call <dev-account> donate --amount 1 --accountId <account>
```

**Tip:** If you would like to `donate` using your own account, first login into NEAR using:

```bash
# Use near-cli to login your NEAR account
near login
```

and then use the logged account to sign the transaction: `--accountId <your-account>`.