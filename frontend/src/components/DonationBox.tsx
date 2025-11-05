import React from "react";
import DonationForm from "./DonationForm";
import { useNear } from '@/hooks/useNear';


interface DonationBoxProps {
  setMyDonation: React.Dispatch<React.SetStateAction<number>>;
}

export default function DonationBox({ setMyDonation }: DonationBoxProps) {
  const { signedAccountId } = useNear();

  return (
    <div className="card mt-4">
      <div className="p-3 text-center">
        <h4>
          <strong>Donate to</strong>
        </h4>
      </div>
      <div className="bg-light p-3">
        {signedAccountId ? (
          <DonationForm setMyDonation={setMyDonation} />
        ) : (
          <p className="mb-3">
            Please sign in with your NEAR wallet to make a donation.
          </p>
        )}
      </div>
    </div>
  );
}
