import { NearBindgen, near, call, view, initialize, UnorderedMap } from 'near-sdk-js'
import { assert, make_private } from './utils'
import { Donation, STORAGE_COST } from './model'

@NearBindgen({})
class DonationContract {
  beneficiary: string = "v1.faucet.nonofficial.testnet";
  donations: UnorderedMap = new UnorderedMap('map-uid-1');

  @initialize
  init({ beneficiary }:{beneficiary: string}) {
    this.beneficiary = beneficiary
  }

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

    // Send the money to the beneficiary
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
  number_of_donors() { return this.donations.length }

  @view
  get_donations({from_index = 0, limit = 50}: {from_index:number, limit:number}): Donation[] {
    let ret:Donation[] = []
    let end = Math.min(limit, this.donations.length)
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
}