import DonationForm from "./DonationForm";
import { useWalletSelector } from '@near-wallet-selector/react-hook';

const DonationBox = ({ setMyDonation }) => {
  const { signedAccountId } = useWalletSelector();


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
};

export default DonationBox;
