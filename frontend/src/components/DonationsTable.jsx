import { DonationNearContract } from "@/config";
import { useStore } from "@/layout";
import { utils } from "near-api-js";
import { useEffect, useState } from "react";

const DonationsTable = () => {
	const { wallet } = useStore();
	const [donations, setDonations] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [lastPage, setLastPage] = useState(0);
	const donationsPerPage = 1;

	const getDonations = async (page) => {
		const number_of_donors = await wallet.viewMethod({
			contractId: DonationNearContract,
			method: "number_of_donors",
		});
		setLastPage(Math.ceil(number_of_donors / donationsPerPage));
		const fromIndex = (page - 1) * donationsPerPage;
		const donations = await wallet.viewMethod({
			contractId: DonationNearContract,
			method: "get_donations",
			args: {
				from_index: fromIndex.toString(),
				limit: donationsPerPage.toString(),
			},
		});
		return donations;
	};

	const loadDonations = async () => {
		if (!wallet) return;
		const loadedDonations = await getDonations(currentPage);
		setDonations(loadedDonations);
	};

	useEffect(() => {
		loadDonations();
	}, [wallet, currentPage]);

	const goToNextPage = () => {
		setCurrentPage((prevPage) => prevPage + 1);
	};

	const goToPrevPage = () => {
		setCurrentPage((prevPage) => prevPage - 1);
	};

	return (
		<div>
			<table className="table table-striped">
				<thead>
					<tr>
						<th scope="col">User</th>
						<th scope="col">Total Donated Ⓝ</th>
					</tr>
				</thead>
				<tbody>
					{donations.map((donation) => (
						<tr key={donation.account_id}>
							<td>{donation.account_id}</td>
							<td>{utils.format.formatNearAmount(donation.total_amount)}</td>
						</tr>
					))}
				</tbody>
			</table>
			<div>
				<button
					className={`btn btn-primary btn-sm ${
						currentPage === 1 ? "disabled" : ""
					}`}
					onClick={goToPrevPage}
					disabled={currentPage === 1}
				>
					Previous
				</button>
				<span className="mx-2">Page {currentPage}</span>
				<button
					className={`btn btn-primary btn-sm ${
						lastPage <= currentPage ? "disabled" : ""
					}`}
					onClick={goToNextPage}
					disabled={lastPage <= currentPage}
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default DonationsTable;
