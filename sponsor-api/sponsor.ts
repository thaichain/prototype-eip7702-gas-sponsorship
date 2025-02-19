import express from 'express';
import { JSONRPCServer } from 'json-rpc-2.0';
import { privateKeyToAccount } from 'viem/accounts'
import { createWalletClient, http, hexToNumber } from 'viem'
import { anvil } from 'viem/chains'

const app = express();
const jsonRpcServer = new JSONRPCServer();

const sponsorWallet = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')
const sponsorWalletClient = createWalletClient({ 
    account: sponsorWallet,
    chain: anvil,
    transport: http("http://localhost:8545"),
})

app.use(express.json());

jsonRpcServer.addMethod("eth_sendTransaction", async (params) => {

    // Handle inconsistent Viem authorization struct ('address' vs 'contractAddress')
    if (params[0]?.authorizationList?.[0]) {
        params[0].authorizationList[0].contractAddress=params[0].authorizationList[0].address
        params[0].authorizationList[0].chainId=hexToNumber(params[0].authorizationList[0].chainId)
        params[0].authorizationList[0].nonce=hexToNumber(params[0].authorizationList[0].nonce)
    }

    const request = await sponsorWalletClient.prepareTransactionRequest({...params[0]});
    console.log('request:', request);

    const signature = await sponsorWalletClient.signTransaction({...request});
    console.log('signed serialized txn:', signature);

    let response = await fetch('http://localhost:8545', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_sendRawTransaction',
          params: [signature],
        })
      });

    let responseJson: any = await response.json()
    return responseJson.result;
});

jsonRpcServer.addMethod('eth_chainId', async (params) => {
    const response = await fetch('http://localhost:8545', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_chainId',
          params: params,
        })
      });
    let responseJson: any = await response.json()
    return responseJson.result;
});


app.post('/', (req, res) => {
    jsonRpcServer.receive(req.body).then((response) => {
        res.json(response);
    });
});

// start a http json rpc listener on port 9999
const PORT = 9999;
app.listen(PORT, () => {
    console.log(`Gas Sponsor JSON-RPC server is running on port: ${PORT}`);
});
