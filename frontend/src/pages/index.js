import DonationBox from "@/components/DonationBox";
import DonationsTable from "@/components/DonationsTable";
import MyDonation from "@/components/MyDonation";
import { useState } from "react";

export default function Home() {
  const [myDonation, setMyDonation] = useState(0);
  return (
    <main className="container py-4 py-lg-5">
      <div className="row g-4 flex-lg-row-reverse">
        <div className="col-lg-5 col-xl-4">
          <DonationBox setMyDonation={setMyDonation} />
        </div>
        <div className="col-lg-7 col-xl-8">
          <MyDonation myDonation={myDonation} />
          <DonationsTable myDonation={myDonation} />
        </div>
      </div>
    </main>
  );
}
