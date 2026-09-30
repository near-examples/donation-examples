import { parseNearAmount } from "near-api-js";
import { useState } from "react";
import { useNearWallet } from "@/components/near-provider";

import { DonationNearContract } from "@/config";

const DonationForm = ({ setMyDonation }) => {
  const { callFunction } = useNearWallet();

  const [amount, setAmount] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState(null); // "sending" | "sent" | "failed"

  const setDonationFromUsd = async (usd) => {
    let data = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd",
    ).then((response) => response.json());
    const near2usd = data["near"]["usd"];
    const amount_in_near = usd / near2usd;
    const rounded_two_decimals = Math.round(amount_in_near * 100) / 100;
    setAmount(rounded_two_decimals.toString());
    setInvalid(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // accept both "0.01" and "0,01" as decimals; parseNearAmount silently
    // strips commas as thousands separators, turning "0,01" into 1 NEAR
    const donated = Number(String(amount).trim().replace(",", "."));
    if (!Number.isFinite(donated) || donated <= 0) {
      setInvalid(true);
      return;
    }

    // optimistic: apply the donation right away; roll back on failure
    setStatus("sending");
    setMyDonation((delta) => delta + donated);
    setAmount("");
    try {
      await callFunction({
        contractId: DonationNearContract,
        method: "donate",
        deposit: parseNearAmount(donated.toString()),
      });
      setStatus("sent");
    } catch {
      setMyDonation((delta) => delta - donated);
      setStatus("failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label small text-secondary mb-2">
          Quick amounts (USD)
        </label>
        <div
          className="btn-group w-100"
          role="group"
          aria-label="Quick amounts"
        >
          {[10, 20, 50, 100].map((usd) => (
            <button
              type="button"
              key={usd}
              className="btn btn-outline-dark"
              onClick={() => setDonationFromUsd(usd)}
            >
              ${usd}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label
          htmlFor="donation"
          className="form-label small text-secondary mb-2"
        >
          Amount
        </label>
        <div className="input-group">
          <input
            id="donation"
            value={amount}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            onChange={(e) => {
              setAmount(e.target.value);
              setInvalid(false);
            }}
            className={`form-control ${invalid ? "is-invalid" : ""}`}
          />
          <span className="input-group-text">NEAR</span>
          {invalid && (
            <div className="invalid-feedback">
              Enter an amount greater than 0, like 0.01.
            </div>
          )}
        </div>
      </div>
      <button type="submit" className="btn btn-dark w-100">
        Donate
      </button>
      {status === "sending" && (
        <p className="text-secondary small mt-3 mb-0">
          Sending donation, confirm it in your wallet...
        </p>
      )}
      {status === "sent" && (
        <p className="text-success small mt-3 mb-0">
          Donation sent. Thank you!
        </p>
      )}
      {status === "failed" && (
        <p className="text-danger small mt-3 mb-0" role="alert">
          The donation was not completed, so your total was not changed.
        </p>
      )}
    </form>
  );
};

export default DonationForm;
