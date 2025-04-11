import { createWalletClient, createPublicClient, http, parseEther, formatEther, encodeFunctionData } from 'viem'
import { anvil } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { smartEOAcontract } from './smartEOAcontract'
import { BlockdaemonERC1404 } from './BlockdaemonERC1404'

const sponsorWalletPublicKey = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'  // Sponsoring RPC node has private key mounted to sign unsigned txn and broadcast
const tokenRecipientPublicKey = '0xcb98643b8786950F0461f3B0edf99D88F274574D'

async function main() {

  const publicClient = createPublicClient({
    chain: anvil,
    transport: http()
  })

  const EOAwallet = privateKeyToAccount('0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6') // PublicKey: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720

  // Create EOA wallet client to sign Authorization # TODO: Use BuilderVault EIP1193 web3 provider for MPC signing
  const EOAwalletClient = createWalletClient({ 
    account: EOAwallet,
    chain: anvil,
    transport: http(),
  })

  // Create sponsor wallet client to relay through Sponsor RPC API
  const sponsorWalletClient = createWalletClient({ 
    account: sponsorWalletPublicKey,
    chain: anvil,
    transport: http("http://localhost:9999"),
  })

  // Log ETH Balance of EOA wallet
  console.log(`EOA wallet ${EOAwallet.address} ETH balance before txn: ${formatEther(await publicClient.getBalance({
    address: EOAwallet.address,
  }))} ETH`);

  // Log ETH Balance of sponsor wallet
  console.log(`Sponsor ${sponsorWalletPublicKey} ETH balance before txn: ${formatEther(await publicClient.getBalance({
    address: sponsorWalletPublicKey,
  }))} ETH\n`);

// ===================================
// ======== EXECUTE DELEGATION TXN ===
// ======== USING GAS SPONSOR RPC ====
// ===================================

  console.log(`\nEOA Wallet delegating Smart EOA implementation contract through sponsor...`)

  // Sign Authorization with EOA wallet
  let authorization = await EOAwalletClient.signAuthorization({
    account: EOAwallet,
    contractAddress: smartEOAcontract.contractAddress
  })

  // Send unsigned authorization txn to sponsor to sign and broadcast (eth_sendTransaction)
  let hash = await sponsorWalletClient.sendTransaction({
    to: EOAwalletClient.account.address,
    authorizationList: [authorization],
    type: 'eip7702',
  })
  await publicClient.getTransaction({ hash }).then(console.log)


// =============================================
// ======== DEPLOY AND MINT ERC1404 CONTRACT ===
// ======== USING GAS SPONSOR RPC ==============
// =============================================

  console.log(`\nEOA Wallet deploying ERC1404 contract through sponsor...`)

  // Encode deployContract() call using Smart EOA ABI and ERC1404 bytecode
  let data = encodeFunctionData({
    abi: smartEOAcontract.abi,
    functionName: 'deployContract',
    args: [BlockdaemonERC1404.bytecode],
  })

  // Broadcast unsigned deploy contract txn through Sponsor RPC
  hash = await sponsorWalletClient.sendTransaction({
    to: EOAwalletClient.account.address,
    data: data,
  })
  await publicClient.waitForTransactionReceipt({ hash: hash,}).then(console.log)

  // Get deployed contract address
  let deployedContractAddress = (await publicClient.waitForTransactionReceipt({ hash: hash,})).logs[0].address

  // Log ETH Balance of EOA wallet
  console.log(`EOA Wallet ${EOAwallet.address} ETH balance after DeployContract txn: ${formatEther(await publicClient.getBalance({
    address: EOAwallet.address,
  }))} ETH`);

  // Log ERC1404 Balance of Wallet
  console.log(`EOA wallet ${EOAwallet.address} ERC1404 balance after DeployContract txn: ${formatEther(await publicClient.readContract({
    abi: BlockdaemonERC1404.abi,
    functionName: 'balanceOf',
    address: deployedContractAddress,
    args: [EOAwallet.address],
  }))} ERC1404`);

  // Log ETH Balance of sponsor
  console.log(`Sponsor ${sponsorWalletPublicKey} ETH balance after DeployContract txn: ${formatEther(await publicClient.getBalance({
    address: sponsorWalletPublicKey,
  }))} ETH`);


// =========================================
// ======== TRANSFER ERC1404 FROM EOA ======
// ======== WALLET USING GAS SPONSOR RPC ===
// =========================================

  console.log(`\nEOA wallet transfering ERC1404 funds to recipient through sponsor...`)

  // Construct ERC1404 transfer() call to recipient
  let nestedCallData = encodeFunctionData({
    abi: BlockdaemonERC1404.abi,
    functionName: 'transfer',
    args: [tokenRecipientPublicKey, parseEther('100')],
  })

  // Construct execute() contract call containing next transfer() call. [can include multiple contract calls / batches]
  data = encodeFunctionData({
    abi: smartEOAcontract.abi, 
    functionName: 'execute', 
    args: [[ 
      { 
        data: nestedCallData, 
        to: deployedContractAddress,  //ERC1404 token contract
        value: parseEther('0'),
      }
    ]], 
  })

  // Broadcast unsigned execute contract call txn through Sponsor RPC
  hash = await sponsorWalletClient.sendTransaction({
    to: EOAwalletClient.account.address,
    data: data,
  })
  await publicClient.waitForTransactionReceipt({ hash: hash }).then(console.log)


  // Log ETH Balance of EOA Wallet
  console.log(`\nEOA wallet ${EOAwallet.address} ETH balance after Transfer txn: ${formatEther(await publicClient.getBalance({
    address: EOAwallet.address,
  }))} ETH`);

  // Log ERC1404 Balance of EOA Wallet
  console.log(`EOA wallet ${EOAwallet.address} ERC1404 balance after Transfer txn: ${formatEther(await publicClient.readContract({
    abi: BlockdaemonERC1404.abi,
    functionName: 'balanceOf',
    address: deployedContractAddress,
    args: [EOAwallet.address],
  }))} ERC1404`);

  // Log ETH Balance of sponsor
  console.log(`Sponsor ${sponsorWalletPublicKey} ETH balance after Transfer txn: ${formatEther(await publicClient.getBalance({
    address: sponsorWalletPublicKey,
  }))} ETH`);


  // Log ERC20 Balance of recipeint
  console.log(`Recipient wallet ${tokenRecipientPublicKey} ERC1404 balance after Transfer txn: ${formatEther(await publicClient.readContract({
    abi: BlockdaemonERC1404.abi,
    functionName: 'balanceOf',
    address: deployedContractAddress,
    args: [tokenRecipientPublicKey],
  }))} ERC1404`);

}

main();