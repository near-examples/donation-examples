import anyTest from 'ava';
import { readFileSync } from 'fs';
import { Sandbox, DEFAULT_ACCOUNT_ID, DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { Account, JsonRpcProvider, KeyPair, KeyPairSigner, nearToYocto } from 'near-api-js';

/**
 *  @type {import('ava').TestFn<{sandbox: import('near-sandbox').Sandbox, provider: JsonRpcProvider, contract: Account, beneficiary: Account, alice: Account, bob: Account}>}
 */
const test = anyTest;

test.beforeEach(async (t) => {
  // Start a fresh sandbox for each test
  const sandbox = await Sandbox.start({});
  const provider = new JsonRpcProvider({ url: sandbox.rpcUrl });

  // All accounts share the sandbox genesis key for simplicity
  const keyPair = KeyPair.fromString(DEFAULT_PRIVATE_KEY);
  const signer = new KeyPairSigner(keyPair);

  const root = new Account(DEFAULT_ACCOUNT_ID, provider, signer);

  for (const prefix of ['contract', 'beneficiary', 'alice', 'bob']) {
    await root.createSubAccount({
      accountOrPrefix: prefix,
      publicKey: keyPair.getPublicKey(),
      nearToTransfer: nearToYocto('30'),
    });
  }

  const contract = new Account(`contract.${DEFAULT_ACCOUNT_ID}`, provider, signer);
  const beneficiary = new Account(`beneficiary.${DEFAULT_ACCOUNT_ID}`, provider, signer);
  const alice = new Account(`alice.${DEFAULT_ACCOUNT_ID}`, provider, signer);
  const bob = new Account(`bob.${DEFAULT_ACCOUNT_ID}`, provider, signer);

  // Deploy the wasm file passed by the package.json test script
  await contract.deployContract(readFileSync(process.argv[2]));

  // Initialize beneficiary
  await contract.callFunction({
    contractId: contract.accountId,
    methodName: 'init',
    args: { beneficiary: beneficiary.accountId },
  });

  // Save state for test runs, it is unique for each test
  t.context = { sandbox, provider, contract, beneficiary, alice, bob };
});

test.afterEach.always(async (t) => {
  // Stop the sandbox and clean up temporary files
  await t.context.sandbox.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test('sends donations to the beneficiary', async (t) => {
  const { provider, contract, alice, beneficiary } = t.context;

  const { amount: balance } = await provider.viewAccount({ accountId: beneficiary.accountId });

  await alice.callFunction({
    contractId: contract.accountId,
    methodName: 'donate',
    args: {},
    deposit: nearToYocto('1'),
  });

  const { amount: newBalance } = await provider.viewAccount({ accountId: beneficiary.accountId });

  t.is(newBalance, balance + nearToYocto('1') - nearToYocto('0.001'));
});

test('records the donation', async (t) => {
  const { provider, contract, bob } = t.context;

  await bob.callFunction({
    contractId: contract.accountId,
    methodName: 'donate',
    args: {},
    deposit: nearToYocto('2'),
  });

  /** @type {Donation} */
  const donation = await provider.callFunction({
    contractId: contract.accountId,
    method: 'get_donation_for_account',
    args: { account_id: bob.accountId },
  });

  t.is(donation.account_id, bob.accountId);
  t.is(BigInt(donation.total_amount), nearToYocto('2'));
});

/**
 * @typedef Donation
 * @property {string} account_id
 * @property {string} total_amount
 */
