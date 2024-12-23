import { Session, SessionKit } from '@wharfkit/session';
import {input} from '@inquirer/prompts';
import dotenv from 'dotenv';
import { decryptAccountInfo, getAccountInfo } from "./keystore";
import { WalletPluginPrivateKey } from "@wharfkit/wallet-plugin-privatekey";

// Load environment variables
dotenv.config();
let accountInfo;

// Create session
async function createSession(accountName, privateKey) {

  const session = new Session(
    {
      chain: {
        id: process.env.CHAIN_ID,
        url: process.env.CHAIN_URL,
      },
      actor: accountName,
      permission: 'active',
      walletPlugin: new WalletPluginPrivateKey(privateKey) ,
    },
    {
      fetch,
    }
  );


  return session;
}

// Get user input
async function getTransferAmount() {
  const amount = await input({
    message: 'Enter the transfer amount:',
    validate: (value) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return 'Please enter a number';
      }
      return true;
    },
  });
  return amount ;
}

// transfer function
async function transfer() {
  try {
    const session = await createSession(accountInfo.accountName, accountInfo.privateKey);
    let amount = await getTransferAmount();
    amount = parseFloat(amount).toFixed(8);
    const result = await session.transact({
      actions: [
        {
          account: 'btc.xsat',
          name: 'transfer',
          authorization: [
            {
              actor: accountInfo.accountName,
              permission: 'active',
            },
          ],
          data: {
            from: accountInfo.accountName,
            to: 'rescmng.xsat',
            quantity: `${amount} BTC`,
            memo: accountInfo.accountName
          },
        },
      ],
    });

    console.log('Transaction successful:', result.response.transaction_id);
  } catch (error) {
    console.error('Transaction failed:', error);
  }

}
async function main(){
  accountInfo = await decryptAccountInfo();
  await transfer();
}

main().catch((err) => {console.error(err)});




