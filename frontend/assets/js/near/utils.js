import { connect, Contract, WalletConnection, utils, providers } from 'near-api-js'
import getConfig from './config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Set a connection to the NEAR network
  window.near = await connect(nearConfig)

  // Initialize a Wallet Object
  window.walletConnection = new WalletConnection(window.near)

  // Initialize a Contract Object (to interact with the contract)
  window.contract = await new Contract(
    window.walletConnection.account(), // user's account
    nearConfig.contractName, // contract's account
    {
      viewMethods: ['get_beneficiary', 'get_donations', 'total_donations'],
      changeMethods: ['donate'],
    }
  )
}

export function logout() {
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
  // Allows to make calls to the contract on the user's behalf.
  // Works by creating a new access key for the user's account
  // and storing the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName)
}

export async function getTransactionResult(txhash) {
  const transaction = await window.near.connection.provider.txStatus(txhash, window.walletConnection.getAccountId())
  let donated_so_far = providers.getTransactionLastResult(transaction)
  return utils.format.formatNearAmount(donated_so_far);
}

export async function getBeneficiary() {
  return await window.contract.get_beneficiary()
}

export async function latestDonations() {
  const total_donations = await window.contract.total_donations()
  const min = total_donations > 10 ? total_donations - 9 : 0

  let donations = await window.contract.get_donations({ from_index: min.toString(), limit: total_donations })
  console.log(donations)
  return donations
}

export async function donate(amount) {
  amount = utils.format.parseNearAmount(amount.toString())
  let response = await window.contract.donate({
    args: {}, amount: amount
  })
  return response
}