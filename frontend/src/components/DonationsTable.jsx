import { DonationNearContract } from "@/config";
import { useStore } from "@/layout";
import { useEffect, useState } from "react";

const DonationsTable = () => {
  const { wallet } = useStore();
  const [donations, setDonations] = useState([])

  useEffect(() => {
    if (!wallet) return;
    const initFunction = async () => {
      setDonations((await getDonations()).reverse());
    }
    initFunction();


  }, [wallet])

  const getDonations = async () => {
    const number_of_donors = await wallet.viewMethod({ contractId: DonationNearContract, method: "number_of_donors" })
    const min = number_of_donors > 10 ? number_of_donors - 9 : 0
    let donations = await wallet.viewMethod({ contractId: DonationNearContract, method: "get_donations", args: { from_index: min.toString(), limit: number_of_donors } })
    return donations
  }

  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th scope="col">User</th>
          <th scope="col">Total Donated Ⓝ</th>
        </tr>
      </thead>
      <tbody>
        {donations.map(donation => <tr key={donation.account_id}><td>{donation.account_id}</td><td>{donation.total_amount}</td></tr>)}
      </tbody>
    </table>
  );
};

export default DonationsTable;