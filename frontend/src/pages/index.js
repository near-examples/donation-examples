import DonationBox from "@/components/DonationBox";
import DonationsTable from "@/components/DonationsTable";

export default function Home() {
	return (
		<div className="p-4 p-sm-5">
			<div className="row">
				<div className="col-sm-8 pe-2 pe-sm-5">
					<h4>Latest Donations</h4>
					<DonationsTable />
				</div>
				<div className="col-sm-4">
					<DonationBox />
				</div>
			</div>
		</div>
	);
}
