import { near } from 'near-sdk-js'

export function assert(statement, message) {
  if (!statement) {
    throw Error(`Assertion failed: ${message}`)
  }
}

export function make_private(){
  assert(near.predecessorAccountId() == near.currentAccountId(), "This is a private method")
}