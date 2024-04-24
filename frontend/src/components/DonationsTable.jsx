import { DonationNearContract } from "@/config";
import { useStore } from "@/layout";
import { utils } from "near-api-js";
import { useEffect, useState } from "react";

const DonationsTable = () => {
  const { wallet } = useStore();
  const [donations, setDonations] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const donationsPerPage = 10;

  const getDonations = async (page) => {
    const number_of_donors = await wallet.viewMethod({ contractId: DonationNearContract, method: "number_of_donors" });
    const fromIndex = (page - 1) * donationsPerPage;
    console.log({ fromIndex, donationsPerPage });
    const donations = await wallet.viewMethod({
      contractId: DonationNearContract,
      method: "get_donations",
      args: {
        from_index: fromIndex.toString(),
        limit: (fromIndex + donationsPerPage).toString()
      }
    });
    return donations;
  };

  const loadDonations = async () => {
    if (!wallet) return;
    const loadedDonations = await getDonations(currentPage);
    setDonations(loadedDonations);
  };

  useEffect(() => {
    loadDonations();
  }, [wallet, currentPage]);

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const goToPrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div>


      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">Total Donated Ⓝ</th>
          </tr>
        </thead>
        <tbody>
          {donations.map(donation => <tr key={donation.account_id}><td>{donation.account_id}</td><td>{utils.format.formatNearAmount(donation.total_amount)}</td></tr>)}
        </tbody>
      </table>
      <div>
        <button
          className={`btn btn-primary btn-sm ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={goToPrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="mx-2">Page {currentPage}</span>
        <button
          className={`btn btn-primary btn-sm ${donations.length < donationsPerPage ? 'disabled' : ''}`}
          onClick={goToNextPage}
          disabled={donations.length < donationsPerPage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DonationsTable;