export const STORAGE_COST: bigint = BigInt("1000000000000000000000")

export class Donation {
    account_id: string;
    total_amount: string;
    
    constructor({account_id, total_amount}:{account_id: string, total_amount: string}) {
        this.account_id = account_id;
        this.total_amount = total_amount;
    }
}