import { useEffect, useState } from "react";
import { useNearWallet } from "near-connect-hooks";
import { DonationNearContract } from "@/config";
import { formatNearAmount } from "near-api-js";

// myDonation is the optimistic delta of donations made this session,
// applied on top of the on-chain total and rolled back if a donation fails
const MyDonation = ({ myDonation }) => {
  const { signedAccountId, viewFunction } = useNearWallet();
  const [baseDonation, setBaseDonation] = useState(0);

  useEffect(() => {
    if (!signedAccountId) return;
    const getMyDonations = async () => {
      const loadedDonation = await viewFunction({
        contractId: DonationNearContract,
        method: "get_donation_for_account",
        args: {
          account_id: signedAccountId,
        },
      });

      setBaseDonation(formatNearAmount(loadedDonation.total_amount));
    };
    getMyDonations();
  }, [signedAccountId]);

  if (!signedAccountId) return null;

  const total = Math.round((Number(baseDonation) + myDonation) * 100) / 100;

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <p className="text-secondary small mb-1">My donation</p>
        <p className="fs-2 fw-semibold font-monospace mb-0">
          {total} <span className="text-near">NEAR</span>
        </p>
      </div>
    </div>
  );
};

export default MyDonation;
