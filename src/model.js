export const STORAGE_COST = BigInt("1000000000000000000000")

export class Donation {
    constructor({account_id, total_amount}) {
        this.account_id = account_id;
        this.total_amount = total_amount;
    }
}