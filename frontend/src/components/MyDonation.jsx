import {useEffect, useState } from "react";
import { useWalletSelector } from '@near-wallet-selector/react-hook';
import { DonationNearContract } from "@/config";
import { utils } from "near-api-js";

const MyDonation = ({ myDonation }) => {
  const { signedAccountId, viewFunction } = useWalletSelector();
  const [donation, setDonation] = useState(0);

  useEffect(() => {
    if (!myDonation) return;

    setDonation(
      Math.round((Number(donation) + Number(myDonation)) * 100) / 100,
    );
  }, [myDonation]);

  useEffect(() => {
    if (!signedAccountId) return;
    const getMyDonations = async () => {
      if (signedAccountId.trim() === "") return;
      console.log("Getting donations for account: ", signedAccountId);
      const loadedDonation = await viewFunction({
        contractId: DonationNearContract,
        method: "get_donation_for_account",
        args: {
          account_id: signedAccountId,
        },
      });

      setDonation(utils.format.formatNearAmount(loadedDonation.total_amount));
    };
    getMyDonations();
  }, [signedAccountId]);

  return (
    <>
      {signedAccountId ? (
        <p className="mb-3">
          You have donated <strong>{donation} NEAR</strong> to the cause.
        </p>
      ) : (
        <p className="mb-3">
          Please sign in with your NEAR wallet to make a donation.
        </p>
      )}
    </>
  );
};

export default MyDonation;
