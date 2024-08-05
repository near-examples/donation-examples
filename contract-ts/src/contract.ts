import { NearBindgen, near, call, view, initialize, UnorderedMap, assert } from 'near-sdk-js'

import { Donation, STORAGE_COST } from './model'

@NearBindgen({ requireInit: true })
class DonationContract {
  beneficiary: string = "";
  donations = new UnorderedMap<bigint>('uid-1');

  static schema = {
    beneficiary: "string",
    donations: { class: UnorderedMap, value: "bigint" }
  }

  @initialize({ privateFunction: true })
  init({ beneficiary }: { beneficiary: string }) {
    this.beneficiary = beneficiary
  }

  @call({ payableFunction: true })
  donate() {
    // Get who is calling the method and how much $NEAR they attached
    let donor = near.predecessorAccountId();
    let donationAmount: bigint = near.attachedDeposit() as bigint;

    let donatedSoFar = this.donations.get(donor, { defaultValue: BigInt(0) })
    let toTransfer = donationAmount;

    // This is the user's first donation, lets register it, which increases storage
    if (donatedSoFar == BigInt(0)) {
      assert(donationAmount > STORAGE_COST, `Attach at least ${STORAGE_COST} yoctoNEAR`);

      // Subtract the storage cost to the amount to transfer
      toTransfer -= STORAGE_COST
    }

    // Persist in storage the amount donated so far
    donatedSoFar += donationAmount
    this.donations.set(donor, donatedSoFar)
    near.log(`Thank you ${donor} for donating ${donationAmount}! You donated a total of ${donatedSoFar}`);

    // Send the money to the beneficiary
    const promise = near.promiseBatchCreate(this.beneficiary)
    near.promiseBatchActionTransfer(promise, toTransfer)

    // Return the total amount donated so far
    return donatedSoFar.toString()
  }

  @call({ privateFunction: true })
  change_beneficiary(beneficiary) {
    this.beneficiary = beneficiary;
  }

  @view({})
  get_beneficiary(): string { return this.beneficiary }

  @view({})
  number_of_donors(): number { return this.donations.length }

  @view({})
  get_donations({ from_index = 0, limit = 50 }: { from_index: number, limit: number }): Donation[] {
    let ret: Donation[] = []

    for (const account_id of this.donations.keys({ start: from_index, limit })) {
      const donation: Donation = this.get_donation_for_account({ account_id })
      ret.push(donation)
    }

    return ret
  }

  @view({})
  get_donation_for_account({ account_id }: { account_id: string }): Donation {
    return {
      account_id,
      total_amount: this.donations.get(account_id).toString()
    }
  }
}