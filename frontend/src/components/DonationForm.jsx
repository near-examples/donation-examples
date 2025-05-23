import { utils } from "near-api-js";
import { useState } from "react";
import { useWalletSelector } from '@near-wallet-selector/react-hook';

import { DonationNearContract } from "@/config";

const DonationForm = ({ setMyDonation }) => {
  const { callFunction } = useWalletSelector();

  const [amount, setAmount] = useState(0);

  const setDonation = async (amount) => {
    let data = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd",
    ).then((response) => response.json());
    const near2usd = data["near"]["usd"];
    const amount_in_near = amount / near2usd;
    const rounded_two_decimals = Math.round(amount_in_near * 100) / 100;
    setAmount(rounded_two_decimals);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let deposit = utils.format.parseNearAmount(amount.toString());

    callFunction({
        contractId: DonationNearContract,
        method: "donate",
        deposit,
      })
      .catch(() => {
        setMyDonation(-Number(amount));
      });
    
    setMyDonation(amount);
  };

  return (
    <>
      <div className="row mb-3">
        {[10, 20, 50, 100].map((amount) => (
          <div className="col-3" key={amount}>
            <button
              className="btn btn-outline-primary btn-block"
              onClick={() => setDonation(amount)}
            >
              $ {amount}
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
              min="0"
              step="0.01"
              onChange={(e) => setAmount(e.target.value)}
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
