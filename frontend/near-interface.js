import {utils} from 'near-api-js'

export class Contract{
  wallet;

  constructor({wallet}){
    this.wallet = wallet
  }

  async getBeneficiary() {
    return await wallet.viewMethod({ method: "get_beneficiary" })
  }
  
  async latestDonations() {
    const number_of_donors = await wallet.viewMethod({ method: "number_of_donors" })
    const min = number_of_donors > 10 ? number_of_donors - 9 : 0
  
    let donations = await wallet.viewMethod({ method: "get_donations", args: { from_index: min.toString(), limit: number_of_donors } })
  
    donations.forEach(elem => {
      elem.total_amount = utils.format.formatNearAmount(elem.total_amount);
    })
  
    return donations
  }
  
  async getDonationFromTransaction(txhash){
    let donation_amount = await this.wallet.getTransactionResult(txhash);
    return utils.format.formatNearAmount(donation_amount);
  }

  async donate(amount) {
    let deposit = utils.format.parseNearAmount(amount.toString())
    let response = await wallet.callMethod({ method: "donate", deposit })
    return response
  }
}