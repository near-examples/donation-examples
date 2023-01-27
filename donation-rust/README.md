# Donation 💸 
[![](https://img.shields.io/badge/⋈%20Examples-Basics-green)](https://docs.near.org/tutorials/welcome)
[![](https://img.shields.io/badge/Gitpod-Ready-orange)](https://gitpod.io/#/https://github.com/near-examples/donation-rust)
[![](https://img.shields.io/badge/Contract-rust-red)](https://docs.near.org/develop/contracts/anatomy)
[![](https://img.shields.io/badge/Frontend-JS-yellow)](https://docs.near.org/develop/integrate/frontend)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fnear-examples%2Fdonation-rust%2Fbadge%3Fref%3Dmain&style=flat&label=Tests)](https://actions-badge.atrox.dev/near-examples/donation-rust/goto?ref=main)


Our Donation example enables to forward money to an account while keeping track of it. It is one of the simplest examples on making a contract receive and send money.

![](https://docs.near.org/assets/images/donation-7cf65e5e131274fd1ae9aa34bc465bb8.png)


# What This Example Shows

1. How to receive and transfer $NEAR on a contract.
2. How to divide a project into multiple modules.
3. How to handle the storage costs.
4. How to handle transaction results.
5. How to use a `Map`.

<br />

# Quickstart

Clone this repository locally or [**open it in gitpod**](https://gitpod.io/#/github.com/near-examples/donation-rust). Then follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Test the Contract
Deploy your contract in a sandbox and simulate interactions from users.

```bash
npm test
```

### 3. Deploy the Contract
Build the contract and deploy it in a testnet account
```bash
npm run deploy
```

### 4. Start the Frontend
Start the web application to interact with your smart contract 
```bash
npm start
```

---

# Learn More
1. Learn more about the contract through its [README](./contract/README.md).
2. Check [**our documentation**](https://docs.near.org/develop/welcome).
