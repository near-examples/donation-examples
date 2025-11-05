import { useEffect, useState } from "react";
import { useNear } from "@/hooks/useNear";
import { DonationNearContract } from "@/config";
import { utils } from "near-api-js";

interface MyDonationProps {
  myDonation?: number;
}

interface DonationResponse {
  total_amount: string;
}

const MyDonation = ({ myDonation }: MyDonationProps) => {
  const { signedAccountId, viewFunction } = useNear();
  const [donation, setDonation] = useState<number>(0);

  useEffect(() => {
    if (!myDonation) return;
    setDonation((prev) =>
      Math.round((prev + Number(myDonation)) * 100) / 100
    );
  }, [myDonation]);

  useEffect(() => {
    if (!signedAccountId) return;

    const getMyDonations = async () => {
      if (signedAccountId.trim() === "") return;
      console.log("Getting donations for account: ", signedAccountId);

      const loadedDonation = (await viewFunction({
        contractId: DonationNearContract,
        method: "get_donation_for_account",
        args: { account_id: signedAccountId },
      })) as DonationResponse;

      const formatted = parseFloat(
        utils.format.formatNearAmount(loadedDonation.total_amount)
      );

      setDonation(formatted);
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
