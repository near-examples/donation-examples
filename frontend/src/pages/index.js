import DonationBox from "@/components/DonationBox";
import DonationsTable from "@/components/DonationsTable";
import MyDonation from "@/components/MyDonation";
import { useState } from "react";

export default function Home() {
  const [myDonation, setMyDonation] = useState(0);
  return (
    <div className="p-4 p-sm-5">
      <div className="row">
        <div className="col-sm-8 pe-2 pe-sm-5">
          <h4>My Donation</h4>
          <MyDonation myDonation={myDonation} />
          <h4>Latest Donations</h4>
          <DonationsTable />
        </div>
        <div className="col-sm-4">
          <DonationBox setMyDonation={setMyDonation} />
        </div>
      </div>
    </div>
  );
}
