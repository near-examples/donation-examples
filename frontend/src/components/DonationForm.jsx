import { useStore } from "@/layout";
import { utils } from "near-api-js";

const { DonationNearContract } = require("@/config");
const { useState } = require("react");


const DonationForm = () =>{
    const { wallet } = useStore();
    const [amount, setAmount] = useState(0);
    
    const setDonation = async (amount) => {
        let data = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd").then(response => response.json())
        const near2usd = data['near']['usd']
        const amount_in_near = amount / near2usd
        const rounded_two_decimals = Math.round(amount_in_near * 100) / 100
        setAmount(rounded_two_decimals);
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        try {
            let deposit = utils.format.parseNearAmount(amount.toString())
            await wallet.callMethod({ contractId: DonationNearContract, method: "donate", deposit })
        } catch (e) {
            alert(
                'Something went wrong! ' +
                'Maybe you need to sign out and back in? ' +
                'Check your browser console for more info.'
            )
            throw e
        }

    }
    
    return <>
      <div className="row mb-3">
                    <div className="col-3">
                        <button className="btn btn-outline-primary btn-block" onClick={() => setDonation(10)}>
                            $ 10
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="btn btn-outline-primary btn-block" onClick={() => setDonation(20)}>
                            $ 20
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="btn btn-outline-primary btn-block" onClick={() => setDonation(50)}>
                            $ 50
                        </button>
                    </div>
                    <div className="col-3">
                        <button className="btn btn-outline-primary btn-block" onClick={() => setDonation(100)}>
                            $ 100
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="donation" className="form-label">Donation amount (in Ⓝ)</label>
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
                    <button type="submit" className="btn btn-primary">Donate</button>
                </form>
    </>
}

export default DonationForm;