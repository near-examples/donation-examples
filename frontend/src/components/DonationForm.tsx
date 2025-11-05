import { utils } from "near-api-js";
import { useState } from "react";
import { useNear } from "@/hooks/useNear";
import { DonationNearContract } from "@/config";

interface DonationFormProps {
  setMyDonation: (amount: number) => void;
}

const DonationForm = ({ setMyDonation }: DonationFormProps) => {
  const { callFunction } = useNear();
  const [amount, setAmount] = useState<number>(0);

  const setDonation = async (usdAmount: number) => {
    const data = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd"
    ).then((response) => response.json());

    const near2usd = data["near"]["usd"];
    const amountInNear = usdAmount / near2usd;
    const rounded = Math.round(amountInNear * 100) / 100;
    setAmount(rounded);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

let deposit = utils.format.parseNearAmount(amount.toString()) || "0";

    callFunction({
      contractId: DonationNearContract,
      method: "donate",
      deposit,
    }).catch(() => {
      setMyDonation(-amount);
    });

    setMyDonation(amount);
  };

  return (
    <>
      <div className="row mb-3">
        {[10, 20, 50, 100].map((usdAmount) => (
          <div className="col-3" key={usdAmount}>
            <button
              type="button"
              className="btn btn-outline-primary btn-block"
              onClick={() => setDonation(usdAmount)}
            >
              $ {usdAmount}
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="donation" className="form-label">
            Donation amount (in Ⓝ)
          </label>
          <div className="input-group">
            <input
              id="donation"
              value={amount}
              type="number"
              min={0}
              step={0.01}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="form-control"
            />
            <span className="input-group-text">Ⓝ</span>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Donate
        </button>
      </form>
    </>
  );
};

export default DonationForm;
