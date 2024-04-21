
import { useStore } from "@/layout";
import { useEffect } from "react";
import { useState } from "react";
import DonationForm from "./DonationForm";

const DonationBox = () => {
    const {  signedAccountId } = useStore();
  
    const [loggedIn, setLoggedIn] = useState(false);
    
    useEffect(() => {
        setLoggedIn(!!signedAccountId);
    }, [signedAccountId]);

    return (
        <div className="card mt-4">
            <div className="p-3 text-center">
                <h4><strong>Donate to</strong></h4>
            </div>
            <div className="bg-light p-3">
                {loggedIn ? <DonationForm/>: <p className="mb-3">Please sign in with your NEAR wallet to make a donation.</p>}
            </div>
        </div>
    );
};

export default DonationBox;