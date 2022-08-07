import { formatNearAmount } from 'near-api-js/lib/utils/format'
import 'regenerator-runtime/runtime'
import { initContract, login, logout, donate,
         getBeneficiary, latestDonations, getTransactionResult } from './near/utils'

// On submit, get the greeting and send it to the contract
document.querySelector('form').onsubmit = async (event) => {
  event.preventDefault()

  // get elements from the form using their id attribute
  const { fieldset, donation } = event.target.elements

  // disable the form while the value gets updated on-chain
  fieldset.disabled = true

  try {
    await donate(donation.value)
  } catch (e) {
    alert(
      'Something went wrong! ' +
      'Maybe you need to sign out and back in? ' +
      'Check your browser console for more info.'
    )
    throw e
  }

  // re-enable the form, whether the call succeeded or failed
  fieldset.disabled = false
}

document.querySelector('#sign-in-button').onclick = login
document.querySelector('#sign-out-button').onclick = logout

async function fetchBeneficiary() {
  // Get greeting from the contract
  const currentGreeting = await getBeneficiary()

  // Set all elements marked as greeting with the current greeting
  document.querySelectorAll('[data-behavior=beneficiary]').forEach(el => {
    el.innerText = currentGreeting
    el.value = currentGreeting
  })
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
                        .then(flow)
                        .catch(console.error)

function flow(){
  if (window.walletConnection.isSignedIn()){
    signedInFlow()
  }else{
    signedOutFlow()
  }
  fetchBeneficiary()
  getAndShowDonations()
}

// Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector('.signed-out-flow').style.display = 'block'
}

async function signedInFlow() {
  // Displaying the signed in flow container
  document.querySelectorAll('.signed-in-flow').forEach(elem => elem.style.display = 'block')

  // Check if there is a transaction hash in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const txhash = urlParams.get("transactionHashes")

  if(txhash !== null){
    // Get result from the transaction
    let result = await getTransactionResult(txhash)
    document.querySelector('[data-behavior=donation-so-far]').innerText = result

    // show notification
    document.querySelector('[data-behavior=notification]').style.display = 'block'

    // remove notification again after css animation completes
    setTimeout(() => {
      document.querySelector('[data-behavior=notification]').style.display = 'none'
    }, 11000)
  }

}

async function getAndShowDonations(){
  document.getElementById('donations-table').innerHTML = 'Loading ...'

  // Load last 10 donations
  let donations = await latestDonations()

  document.getElementById('donations-table').innerHTML = ''

  donations.forEach(elem => {
    let tr = document.createElement('tr')
    tr.innerHTML = `
      <tr>
        <th scope="row">${elem.account_id}</th>
        <td>${formatNearAmount(elem.total_amount)}</td>
      </tr>
    `
    document.getElementById('donations-table').appendChild(tr)
  })
}

window.set_donation = async function(amount){
  let data = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd").then(response => response.json())
  const near2usd = data['near']['usd']
  const amount_in_near = amount / near2usd
  const rounded_two_decimals = Math.round(amount_in_near * 100) / 100
  document.querySelector('#donation').value = rounded_two_decimals
}