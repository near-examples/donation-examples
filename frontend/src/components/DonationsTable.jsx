import { formatNearAmount } from "near-api-js";
import { useEffect, useState } from "react";
import { useNearWallet } from "near-connect-hooks";
import { DonationNearContract } from "@/config";

// myDonation is the optimistic session delta; it's added to the signed
// user's row so the table matches the "My donation" card immediately.
// ponytail: first-time donors get no synthetic row until the next refetch
const DonationsTable = ({ myDonation = 0 }) => {
  const { loading, signedAccountId, viewFunction } = useNearWallet();
  const [donations, setDonations] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);
  const donationsPerPage = 5;

  const getDonations = async (page) => {
    const number_of_donors = await viewFunction({
      contractId: DonationNearContract,
      method: "number_of_donors",
    });

    setLastPage(Math.ceil(number_of_donors / donationsPerPage));
    const fromIndex = (page - 1) * donationsPerPage;
    const donations = await viewFunction({
      contractId: DonationNearContract,
      method: "get_donations",
      args: {
        from_index: fromIndex.toString(),
        limit: donationsPerPage.toString(),
      },
    });
    return donations;
  };

  useEffect(() => {
    if (loading) return;
    getDonations(currentPage).then((loadedDonations) =>
      setDonations(loadedDonations),
    );
  }, [loading, currentPage]);

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const goToPrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2 className="h5 mb-3">Latest donations</h2>
        {donations !== null && donations.length === 0 ? (
          <p className="text-secondary mb-0">No donations yet.</p>
        ) : (
          <>
            <table className="table align-middle mb-3">
              <thead>
                <tr className="text-secondary small">
                  <th scope="col" className="fw-normal">
                    Account
                  </th>
                  <th scope="col" className="fw-normal text-end">
                    Total (NEAR)
                  </th>
                </tr>
              </thead>
              <tbody>
                {donations === null
                  ? Array.from({ length: donationsPerPage }).map((_, i) => (
                      <tr key={i} className="placeholder-glow" aria-hidden="true">
                        <td>
                          <span className="placeholder col-6" />
                        </td>
                        <td className="text-end">
                          <span className="placeholder col-2" />
                        </td>
                      </tr>
                    ))
                  : donations.map((donation) => (
                      <tr
                        key={donation.account_id}
                        className={
                          donation.account_id === signedAccountId
                            ? "table-success"
                            : undefined
                        }
                      >
                        <td className="font-monospace">
                          {donation.account_id}
                        </td>
                        <td className="font-monospace text-end">
                          {donation.account_id === signedAccountId
                            ? Math.round(
                                (Number(
                                  formatNearAmount(
                                    donation.total_amount,
                                  ).replace(/,/g, ""),
                                ) +
                                  myDonation) *
                                  100,
                              ) / 100
                            : formatNearAmount(donation.total_amount)}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-secondary small">
                Page {currentPage} of {Math.max(lastPage, 1)}
              </span>
              <div className="btn-group">
                <button
                  className="btn btn-outline-dark btn-sm"
                  onClick={goToPrevPage}
                  disabled={donations === null || currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-dark btn-sm"
                  onClick={goToNextPage}
                  disabled={donations === null || lastPage <= currentPage}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonationsTable;
