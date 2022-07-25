import { NearContract, NearBindgen, near, call, view, UnorderedMap, Vector } from 'near-sdk-js'
import { assert, make_private } from './utils'
import { Donation, STORAGE_COST } from './model'

@NearBindgen
class HelloNear extends NearContract {
    constructor({ beneficiary = "v1.faucet.nonofficial.testnet" }) {
        super()
        this.beneficiary = beneficiary;
        this.donations = new UnorderedMap('map-uid-1');
    }

    deserialize() {
        super.deserialize()
        this.donations.keys = Object.assign(new Vector, this.donations.keys)
        this.donations.values = Object.assign(new Vector, this.donations.values)
        this.donations = Object.assign(new UnorderedMap, this.donations)
    }

    @call
    donate() {
        // Get who is calling the method and how much $NEAR they attached
        let donor = near.predecessorAccountId(); 
        let donationAmount = near.attachedDeposit();

        let donatedSoFar = BigInt(this.donations.get(donor) || 0)
        let toTransfer = donationAmount;
 
        // This is the user's first donation, lets register it, which increases storage
        if(donatedSoFar == 0) {
            assert(donationAmount > STORAGE_COST, `Attach at least ${STORAGE_COST} yoctoNEAR`);

            // Subtract the storage cost to the amount to transfer
            toTransfer -= STORAGE_COST
        }

        // Persist in storage the amount donated so far
        donatedSoFar += donationAmount;
        this.donations.set(donor, donatedSoFar.toString())
        near.log(`Thank you ${donor} for donating ${donationAmount}! You donated a total of ${donatedSoFar}`);

        // Send the money to the beneficiary (TODO)
        const promise = near.promiseBatchCreate(this.beneficiary)
        near.promiseBatchActionTransfer(promise, toTransfer)

        // Return the total amount donated so far
        return donatedSoFar.toString()
    }

    @call
    change_beneficiary(beneficiary) {
        make_private();
        this.beneficiary = beneficiary;
    }

    @view
    get_beneficiary(){ return this.beneficiary }

    @view
    total_donations() { return this.donations.len() }

    @view
    get_donations({from_index = 0, limit}) {
        let start = from_index
    }

    @view
    get_donation_for_account({account_id}){
        return new Donation({
            account_id: account_id,
            total_amount: this.donations.get(account_id)
        })
    }
}