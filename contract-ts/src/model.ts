export const STORAGE_COST: bigint = BigInt("1000000000000000000000")

export class Donation {
  static schema = {
    account_id: "string",
    total_amount: "string"
  }

  account_id: string;
  total_amount: string;
}