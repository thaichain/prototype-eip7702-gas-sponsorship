import { createEIP1193Provider } from "@blockdaemon/buildervault-web3-provider";
import { createWalletClient, createPublicClient,http, custom, parseEther, formatEther, encodeFunctionData } from 'viem'
import { anvil } from 'viem/chains'
import { AuthorizationList, eip7702Actions, prepareAuthorization } from 'viem/experimental'
import { privateKeyToAccount } from 'viem/accounts'
import { smartEOAcontract } from './smartEOAcontract'
import { BlockdaemonERC1404 } from './BlockdaemonERC1404'

async function main() {

  const publicClient = createPublicClient({
    chain: anvil,
    transport: http()
  })

  const EOAwallet = privateKeyToAccount('0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6')
  const walletClient = createWalletClient({ 
    account: EOAwallet,
    chain: anvil,
    transport: http(),
  }).extend(eip7702Actions())

  const sponsorWallet = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d') 

  // Get ETH Balance
  console.log(`Wallet ${EOAwallet.address} balance before txn: ${formatEther(await publicClient.getBalance({
    address: EOAwallet.address,
  }))}`);

  // Get ETH Balance of sponsor
  console.log(`Sponsor ${sponsorWallet.address} balance before txn: ${formatEther(await publicClient.getBalance({
    address: sponsorWallet.address,
  }))}\n`);


  // !!! execute delegation transaction with gas sponsor

  console.log(`Wallet EOA delegating Smart EOA contract... through sponsor...`)
  let authorization = await walletClient.signAuthorization({
    account: EOAwallet,
    contractAddress: smartEOAcontract.contractAddress,
    sponsor: sponsorWallet,
  })

  let hash = await walletClient.writeContract({ 
    abi: smartEOAcontract.abi, 
    address: walletClient.account.address, 
    functionName: 'execute', 
    args: [[ 
      { 
        data: "0x", 
        to: "0x0000000000000000000000000000000000000000",  //ERC1404 token contract
        value: parseEther('0'),
      }
    ]], 
    authorizationList: [authorization], 
    account: sponsorWallet
  }) 

  await publicClient.getTransaction({ hash }).then(console.log)


  // !!! deploy and mint ERC20 contract with gas sponsor

  console.log(`Wallet EOA deploying ERC20 contract...through sponsor...`)
  hash = await walletClient.writeContract({ 
    abi: smartEOAcontract.abi,
    address: walletClient.account.address, 
    functionName: 'deployContract',
    args: [BlockdaemonERC1404.bytecode],
    account: sponsorWallet
  })

  await publicClient.waitForTransactionReceipt({ 
    hash: hash
  }).then(console.log)

  // Get ETH Balance of Wallet
  console.log(`Wallet ${EOAwallet.address} balance after DeployContract txn: ${formatEther(await publicClient.getBalance({
    address: EOAwallet.address,
  }))} ETH`);

  // Get ETH Balance of sponsor
  console.log(`Sponsor ${sponsorWallet.address} balance after DeployContract txn: ${formatEther(await publicClient.getBalance({
    address: sponsorWallet.address,
  }))} ETH`);

  // Get ERC20 Balance of Wallet
  console.log(`Wallet ${EOAwallet.address} balance after DeployContract txn: ${formatEther(await publicClient.readContract({
    abi: BlockdaemonERC1404.abi,
    functionName: 'balanceOf',
    address: "0xA15BB66138824a1c7167f5E85b957d04Dd34E468",
    args: [EOAwallet.address],
  }))} ERC1404`);
  

  // !!! transfer ERC20 from wallet with gas sponsor

  console.log(`Wallet EOA transfering ERC20 funds to recipient... through sponsor...`)
  const data = encodeFunctionData({
    abi: BlockdaemonERC1404.abi,
    functionName: 'transfer',
    args: ["0xcb98643b8786950F0461f3B0edf99D88F274574D", parseEther('100')],
  })

  hash = await walletClient.writeContract({ 
    abi: smartEOAcontract.abi, 
    address: walletClient.account.address, 
    functionName: 'execute', 
    args: [[ 
      { 
        data: data, 
        to: "0xA15BB66138824a1c7167f5E85b957d04Dd34E468",  //ERC1404 token contract
        value: parseEther('0'),
      }
    ]], 
    account: sponsorWallet
  }) 

  await publicClient.waitForTransactionReceipt({ 
    hash: hash
  }).then(console.log)


  // Get ETH Balance of Wallet
  console.log(`Wallet ${EOAwallet.address} balance after Transfer txn: ${formatEther(await publicClient.getBalance({
    address: EOAwallet.address,
  }))} ETH`);

  // Get ETH Balance of sponsor
  console.log(`Sponsor ${sponsorWallet.address} balance after Transfer txn: ${formatEther(await publicClient.getBalance({
    address: sponsorWallet.address,
  }))} ETH`);

  // Get ERC20 Balance of Wallet
  console.log(`Wallet ${EOAwallet.address} balance after Transfer txn: ${formatEther(await publicClient.readContract({
    abi: BlockdaemonERC1404.abi,
    functionName: 'balanceOf',
    address: "0xA15BB66138824a1c7167f5E85b957d04Dd34E468",
    args: [EOAwallet.address],
  }))} ERC1404`);

}

main();