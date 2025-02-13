"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const experimental_1 = require("viem/experimental");
const accounts_1 = require("viem/accounts");
const contract_1 = require("./contract");
const wagmiContract_1 = require("./wagmiContract");
// const chain = {
//   chainName: "Anvil",
//   chainId: "0x7a69",
//   rpcUrls: ["http://localhost:8545"],
// };
async function main() {
    // const eip1193Provider = await createEIP1193Provider({
    //   chains: [chain],
    //   playerCount: 3,
    //   player0Url: "https://tsm-sandbox.prd.wallet.blockdaemon.app:8080",
    //   player1Url: "https://tsm-sandbox.prd.wallet.blockdaemon.app:8081",
    //   player2Url: "https://tsm-sandbox.prd.wallet.blockdaemon.app:8082",
    //   player0MPCpublicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEtDFBfanInAMHNKKDG2RW/DiSnYeI7scVvfHIwUIRdbPH0gBrsilqxlvsKZTakN8om/Psc6igO+224X8T0J9eMg==",
    //   player1MPCpublicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEqvSkhonTeNhlETse8v3X7g4p100EW9xIqg4aRpD8yDXgB0UYjhd+gFtOCsRT2lRhuqNForqqC+YnBsJeZ4ANxg==",
    //   player2MPCpublicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEBaHCIiViexaVaPuER4tE6oJE3IBA0U//GlB51C1kXkT07liVc51uWuYk78wi4e1unxC95QbeIfnDCG2i43fW3g==",
    //   player0mTLSpublicKey: "-----BEGIN CERTIFICATE-----\nMIICMjCCAdegAwIBAgICB+MwCgYIKoZIzj0EAwIwgaAxCzAJBgNVBAYTAlVTMRMw\nEQYDVQQIDApDYWxpZm9ybmlhMRQwEgYDVQQHDAtMb3MgQW5nZWxlczEUMBIGA1UE\nCgwLQmxvY2tkYWVtb24xFDASBgNVBAsMC0Jsb2NrZGFlbW9uMRQwEgYDVQQDDAtC\nbG9ja2RhZW1vbjEkMCIGCSqGSIb3DQEJARYVYWRtaW5AYmxvY2tkYWVtb24uY29t\nMB4XDTI0MTIxMDE0MjQyOVoXDTI5MTIxMDE0MjQyOVowTjELMAkGA1UEBhMCVVMx\nEzARBgNVBAgTCkNhbGlmb3JuaWExFDASBgNVBAcTC0xvcyBBbmdlbGVzMRQwEgYD\nVQQKEwtCbG9ja2RhZW1vbjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABFyD6P8s\n/asEB/7ERpHxye5cpZXXtRYh299ioHemPdKzpmmYqyKqv4G7leXT4bZsAPwqzG3+\nQRg/8HPJA9a8hW2jUjBQMA4GA1UdDwEB/wQEAwIHgDAdBgNVHSUEFjAUBggrBgEF\nBQcDAgYIKwYBBQUHAwEwHwYDVR0jBBgwFoAUW6ouasv5oWo7MZ4ZzlE/mpbDrIMw\nCgYIKoZIzj0EAwIDSQAwRgIhAJZZITPjl9cZNrM1TPRtYo6+TQZw/Q1SO+3xZ5T5\nedeeAiEAlpVDC79W6ym30J6f3gSvOQOJO30+AsJs8gQycf8KK2A=\n-----END CERTIFICATE-----",
    //   player1mTLSpublicKey: "-----BEGIN CERTIFICATE-----\nMIICMDCCAdegAwIBAgICB+MwCgYIKoZIzj0EAwIwgaAxCzAJBgNVBAYTAlVTMRMw\nEQYDVQQIDApDYWxpZm9ybmlhMRQwEgYDVQQHDAtMb3MgQW5nZWxlczEUMBIGA1UE\nCgwLQmxvY2tkYWVtb24xFDASBgNVBAsMC0Jsb2NrZGFlbW9uMRQwEgYDVQQDDAtC\nbG9ja2RhZW1vbjEkMCIGCSqGSIb3DQEJARYVYWRtaW5AYmxvY2tkYWVtb24uY29t\nMB4XDTI0MTIxMDE0MjQ0OVoXDTI5MTIxMDE0MjQ0OVowTjELMAkGA1UEBhMCVVMx\nEzARBgNVBAgTCkNhbGlmb3JuaWExFDASBgNVBAcTC0xvcyBBbmdlbGVzMRQwEgYD\nVQQKEwtCbG9ja2RhZW1vbjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABDm0QCLd\nOUS/P7tR6mmbUD9CL/qTgRTu76U3oIB5QYGj7lDHo8ngnBknVRoz9q+vsk3HvLXK\nAFAcIHsiYQjPJvujUjBQMA4GA1UdDwEB/wQEAwIHgDAdBgNVHSUEFjAUBggrBgEF\nBQcDAgYIKwYBBQUHAwEwHwYDVR0jBBgwFoAUW6ouasv5oWo7MZ4ZzlE/mpbDrIMw\nCgYIKoZIzj0EAwIDRwAwRAIgVjSlH7sjQ1yus/A2J4mUh3gGljPQaip7ud4ctxdv\n5hUCIG4gazgsH8T0MOdUFdpJovjcxv2KoMl+xQZmYy/G9Pyb\n-----END CERTIFICATE-----",
    //   player2mTLSpublicKey: "-----BEGIN CERTIFICATE-----\nMIICMDCCAdegAwIBAgICB+MwCgYIKoZIzj0EAwIwgaAxCzAJBgNVBAYTAlVTMRMw\nEQYDVQQIDApDYWxpZm9ybmlhMRQwEgYDVQQHDAtMb3MgQW5nZWxlczEUMBIGA1UE\nCgwLQmxvY2tkYWVtb24xFDASBgNVBAsMC0Jsb2NrZGFlbW9uMRQwEgYDVQQDDAtC\nbG9ja2RhZW1vbjEkMCIGCSqGSIb3DQEJARYVYWRtaW5AYmxvY2tkYWVtb24uY29t\nMB4XDTI0MTIxMDE0MjUwNloXDTI5MTIxMDE0MjUwNlowTjELMAkGA1UEBhMCVVMx\nEzARBgNVBAgTCkNhbGlmb3JuaWExFDASBgNVBAcTC0xvcyBBbmdlbGVzMRQwEgYD\nVQQKEwtCbG9ja2RhZW1vbjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABLD2iRkr\nqPuPsR2bU6x2IRcyR8EyoIHWQK3eS+D1tGR7zrU/RqTMzehkL4dW2CxD17vb5msG\nTsGwdcITVmWe9sSjUjBQMA4GA1UdDwEB/wQEAwIHgDAdBgNVHSUEFjAUBggrBgEF\nBQcDAgYIKwYBBQUHAwEwHwYDVR0jBBgwFoAUW6ouasv5oWo7MZ4ZzlE/mpbDrIMw\nCgYIKoZIzj0EAwIDRwAwRAIgWrCOwq9pQwq12hutqbGihsYFoRPS7poN89taSRwd\nUlICIB194NmROTm8LeVztooGoQvQ0SLS320xxCcjJvjoLEdV\n-----END CERTIFICATE-----",
    //   player0ClientCert: "./client.crt",
    //   player0ClientKey: "./client.key",
    //   player1ClientCert: "./client.crt",
    //   player1ClientKey: "./client.key",
    //   player2ClientCert: "./client.crt",
    //   player2ClientKey: "./client.key",
    //   masterKeyId: "M8QjP9kcjt1NdJZIaOKczrDjEMtf",
    //   accountId: 0,   // account of BIP44 m/44/60/account/0/address_index
    //   addressIndex: 0, // address_index of BIP44 m/44/60/account/0/address_index
    // })
    const wallet = (0, accounts_1.privateKeyToAccount)('0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6');
    const walletAddress = wallet.address;
    const publicClient = (0, viem_1.createPublicClient)({
        chain: chains_1.anvil,
        transport: (0, viem_1.http)()
    });
    const walletClient = (0, viem_1.createWalletClient)({
        account: wallet,
        chain: chains_1.anvil,
        transport: (0, viem_1.http)(),
        // transport: custom({
        //   async request({ method, params }) {
        //     const response = await eip1193Provider.request({method, params})
        //     return response
        //   }
        // })
    }).extend((0, experimental_1.eip7702Actions)());
    // walletClient.requestAddresses().then(console.log);
    // const [walletAddress] = await walletClient.requestAddresses(); // walletAddress 
    const blockdaemonSponsor = (0, accounts_1.privateKeyToAccount)('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
    // Get ETH Balance
    console.log(`Wallet ${walletAddress} balance before txn: ${(0, viem_1.formatEther)(await publicClient.getBalance({
        address: walletAddress,
    }))}`);
    // Get ETH Balance of sponsor
    console.log(`Sponsor ${blockdaemonSponsor.address} balance before txn: ${(0, viem_1.formatEther)(await publicClient.getBalance({
        address: blockdaemonSponsor.address,
    }))}`);
    // !!! deploy ERC20 contract with Sponsor
    let authorization = await walletClient.signAuthorization({
        account: wallet,
        contractAddress: contract_1.SmartEOA.contractAddress,
        sponsor: blockdaemonSponsor,
    });
    //console.log(`Signed Authorization: ${authorization.chainId} ${authorization.nonce} ${authorization.contractAddress}`);
    let hash = await walletClient.writeContract({
        abi: contract_1.SmartEOA.abi,
        address: walletClient.account.address,
        functionName: 'deployContract',
        args: [wagmiContract_1.wagmiContract.bytecode],
        authorizationList: [authorization],
        account: blockdaemonSponsor
    });
    let txn = await publicClient.getTransaction({ hash });
    console.log(`transaction.type: ${txn.type}`);
    console.log(`transaction.to: ${txn.to}`);
    console.log(`transaction.from: ${txn.from}`);
    console.log(`authorizationList: ${txn.authorizationList}\n`);
    // Object.entries(txn.authorizationList).forEach(([key, value]) => {
    //   console.log(`authorizationList: ${key}: ${value}`);
    // });
    await publicClient.waitForTransactionReceipt({
        hash: hash
    }).then(console.log);
    // Get ETH Balance of Wallet
    console.log(`Wallet ${walletAddress} balance after txn: ${(0, viem_1.formatEther)(await publicClient.getBalance({
        address: walletAddress,
    }))}`);
    // Get ETH Balance of sponsor
    console.log(`Sponsor ${blockdaemonSponsor.address} balance after txn: ${(0, viem_1.formatEther)(await publicClient.getBalance({
        address: blockdaemonSponsor.address,
    }))}`);
    // TODO: add test case to Mint against contract
    // !!! transfer ERC20 contract with Sponsor
    authorization = await walletClient.signAuthorization({
        account: wallet,
        contractAddress: contract_1.SmartEOA.contractAddress,
        sponsor: blockdaemonSponsor,
    });
    //console.log(`Signed Authorization: ${authorization.chainId} ${authorization.nonce} ${authorization.contractAddress}`);
    hash = await walletClient.writeContract({
        abi: contract_1.SmartEOA.abi,
        address: walletClient.account.address,
        functionName: 'execute',
        args: [[
                {
                    data: '0x',
                    to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
                    value: (0, viem_1.parseEther)('0.5'),
                }
            ]],
        authorizationList: [authorization],
        account: blockdaemonSponsor
    });
    await publicClient.waitForTransactionReceipt({
        hash: hash
    }).then(console.log);
    // Get ETH Balance of Wallet
    console.log(`Wallet ${walletAddress} balance after txn: ${(0, viem_1.formatEther)(await publicClient.getBalance({
        address: walletAddress,
    }))}`);
    // Get ETH Balance of sponsor
    console.log(`Sponsor ${blockdaemonSponsor.address} balance after txn: ${(0, viem_1.formatEther)(await publicClient.getBalance({
        address: blockdaemonSponsor.address,
    }))}`);
}
main();
//# sourceMappingURL=viemclient.js.map