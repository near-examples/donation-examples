import anyTest from 'ava';
import { Worker, NEAR } from 'near-workspaces';
import { setDefaultResultOrder } from 'dns'; setDefaultResultOrder('ipv4first'); // temp fix for node >v17

/**
 *  @typedef {import('near-workspaces').NearAccount} NearAccount
 *  @type {import('ava').TestFn<{worker: Worker, accounts: Record<string, NearAccount>}>}
 */
const test = anyTest;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = t.context.worker = await Worker.init();

  const root = worker.rootAccount;

  // define users
  const beneficiary = await root.createSubAccount("beneficiary", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });

  const alice = await root.createSubAccount("alice", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });

  const bob = await root.createSubAccount("bob", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });

  const contract = await root.createSubAccount("contract", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });

  // Deploy the contract.
  await contract.deploy(process.argv[2]);

  // Initialize beneficiary
  await contract.call(contract, "init", { beneficiary: beneficiary.accountId })

  // Save state for test runs, it is unique for each test
  t.context.accounts = { root, contract, beneficiary, alice, bob };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test("sends donations to the beneficiary", async (t) => {
  const { contract, alice, beneficiary } = t.context.accounts;

  const balance = await beneficiary.balance();
  const available = parseFloat(balance.available.toHuman());

  await alice.call(contract, "donate", {}, { attachedDeposit: NEAR.parse("1 N").toString() });

  const new_balance = await beneficiary.balance();
  const new_available = parseFloat(new_balance.available.toHuman());

  t.is(new_available, available + 1 - 0.001);
});

test("records the donation", async (t) => {
  const { contract, bob } = t.context.accounts;

  await bob.call(contract, "donate", {}, { attachedDeposit: NEAR.parse("2 N").toString() });

  /** @type {Donation} */
  const donation = await contract.view("get_donation_for_account", { account_id: bob.accountId });

  t.is(donation.account_id, bob.accountId);
  t.is(donation.total_amount, NEAR.parse("2 N").toString());
});

/**
 * @typedef Donation
 * @property {string} account_id
 * @property {string} total_amount
 */