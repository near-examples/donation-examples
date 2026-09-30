import DonationForm from "./DonationForm";
import { useNearWallet } from "@/components/near-provider";

const DonationBox = ({ setMyDonation }) => {
  const { signedAccountId, signIn } = useNearWallet();

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2 className="h5 mb-1">Donate</h2>
        <p className="text-secondary small mb-4">
          Donations are sent to the donation contract on NEAR testnet.
        </p>
        {signedAccountId ? (
          <DonationForm setMyDonation={setMyDonation} />
        ) : (
          <>
            <p className="text-secondary mb-3">
              Connect your wallet to make a donation.
            </p>
            <button className="btn btn-dark w-100" onClick={() => signIn()}>
              Connect wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DonationBox;
