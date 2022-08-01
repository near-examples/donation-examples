import { Worker, NEAR } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // deploy contract
    const root = worker.rootAccount;
    const contract = await root.devDeploy("./build/contract.wasm", { initialBalance: NEAR.parse("30 N").toJSON(), method: "init", args: {} });

    const beneficiary = await root.createSubAccount("beneficiary", {
        initialBalance: NEAR.parse("30 N").toJSON(),
    });

    const alice = await root.createSubAccount("alice", {
        initialBalance: NEAR.parse("30 N").toJSON(),
    });

    const bob = await root.createSubAccount("bob", {
        initialBalance: NEAR.parse("30 N").toJSON(),
    });

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = { root, contract, beneficiary, alice, bob };
});

test.afterEach(async (t) => {
    await t.context.worker.tearDown().catch((error) => {
        console.log("Failed to stop the Sandbox:", error);
    });
});

test("sends donations to the beneficiary", async (t) => {
    const { contract, alice, beneficiary } = t.context.accounts;

    const balance = await beneficiary.balance();
    const available = parseFloat(balance.available.toHuman());

    await alice.call(contract, "donate", {}, { attachedDeposit: NEAR.parse("1 N").toString() });

    const new_balance = await beneficiary.balance();
    const new_available = parseFloat(new_balance.available.toHuman());

    t.is(new_available, available);
});

test("records the donation", async (t) => {
    const { contract, bob } = t.context.accounts;

    await bob.call(contract, "donate", {}, { attachedDeposit: NEAR.parse("2 N").toString() });

    const donation = await contract.view("get_donation_for_account", { account_id: bob.accountId });

    t.is(donation.account_id, bob.accountId);
    t.is(donation.total_amount, NEAR.parse("2 N").toString());
});