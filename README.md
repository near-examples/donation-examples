# Donation JS NEAR Example

## Overview

Our donation example enables to forward money to an account while keeping track of it. It is one of the simplest examples on making a contract receive and send money, and the perfect gateway to enter the world of decentralized finance.

## Installation & Setup

To clone run:

```bash
git clone https://github.com/near-examples/donation-js.git
```

enter the folder with:

```bash
cd donation-js
```

To download dependencies run:

```bash
cd contract && yarn && cd .. && yarn
```

or

```bash
cd contract && npm i && cd .. && npm i
```

## Building Your Smart Contract

The Smart Contract consists of two methods available for the user to call.

```javascript

    @call
    donate() {
        // Get who is calling the method and how much $NEAR they attached
        let donor = near.predecessorAccountId();
        let donationAmount: bigint = near.attachedDeposit() as bigint;

        let donatedSoFar = this.donations.get(donor) === null? BigInt(0) : BigInt(this.donations.get(donor) as string)
        let toTransfer = donationAmount;

        // This is the user's first donation, lets register it, which increases storage
        if(donatedSoFar == BigInt(0)) {
            assert(donationAmount > STORAGE_COST, `Attach at least ${STORAGE_COST} yoctoNEAR`);

            // Subtract the storage cost to the amount to transfer
            toTransfer -= STORAGE_COST
        }

        // Persist in storage the amount donated so far
        donatedSoFar += donationAmount
        this.donations.set(donor, donatedSoFar.toString())
        near.log(`Thank you ${donor} for donating ${donationAmount}! You donated a total of ${donatedSoFar}`);

        // Send the money to the beneficiary (TODO)
        const promise = near.promiseBatchCreate(this.beneficiary)
        near.promiseBatchActionTransfer(promise, toTransfer)

        // Return the total amount donated so far
        return donatedSoFar.toString()
    }


    @view
    get_beneficiary(){ return this.beneficiary }

    @view
    total_donations() { return this.donations.len() }

    @view
    get_donations({from_index = 0, limit = 50}: {from_index:number, limit:number}): Donation[] {
        let ret:Donation[] = []
        let end = Math.min(limit, this.donations.len())
        for(let i=from_index; i<end; i++){
            const account_id: string = this.donations.keys.get(i) as string
            const donation: Donation = this.get_donation_for_account({account_id})
            ret.push(donation)
        }
        return ret
    }

    @view
    get_donation_for_account({account_id}:{account_id:string}): Donation{
        return new Donation({
            account_id,
            total_amount: this.donations.get(account_id) as string
        })
    }
```

A `call` method stores or modifies information that exists in state on the NEAR blockchain. Call methods do incur a gas fee. `Call` methods return no values

A `view` method retrieves information stored on the blockchain. No fee is charged for a view method. View methods always return a value.

`NearBindgen` is a decorator that exposes the state and methods to the user.

To build your smart contract run

```bash
yarn build
```

or

```bash
npm run build
```

This build script will build and deploy your smart contract onto a dev account. Check the terminal logs to find the name of the dev account it was deployed to.

example:

```
dev-1659899566943-21539992274727
```

To initialize the contract run the following

```bash
near call <dev-account> init --accountId <your-account.testnet>
```

## Calling methods from terminal

To make a donation call the following which will deposit 2 near to the `contract account` in this case the `dev account`

```bash
near call <dev-account> donate '{}' --accountId <your-account.testnet> --deposit 2
```

You can view the total number of donations using the following

```bash
near view <dev-account> total_donations '{}' --accountId <your-account.testnet>

```

## Run Tests

This example repo comes with integration tests written in rust and assembly type script.

To run tests run the following in your terminal:

```bash
yarn test
```

or

```bash
npm run test
```

Integration tests are generally written in javascript. They automatically deploy your contract and execute methods on it. In this way, integration tests simulate interactions from users in a realistic scenario. You will find the integration tests for hello-near in `integration-tests/`.
