# EIP-7702 transaction sponsoring
- EOA account transacts with 0 ETH
- Sponsor EOA account funds transactions
- includes basic Smart EOA delegated contract
- includes ERC20 token contract bytecode which is deployed by Smart EOA

```mermaid
sequenceDiagram
    autonumber
    participant TransactionManager as Transaction<br>Crafter
    participant EOA as EOA<br>wallet
    participant Sponsor as Sponsor Wallet
    box rgb(251,251,251) Blockchain
        participant ContractAddress as Smart EOA<br>delegated contract
        participant Token as Token<br>contract
    end

    critical Set one time smart account delegation
        TransactionManager->>EOA: Construct and sign EIP-7702 txn Authorization tuple<br>(chainId, delegated contract address, nonce)
        EOA-->>TransactionManager: Authorization signature
        TransactionManager->>TransactionManager: Construct unsigned txn type=4<br>(to=self, authorization_list=authorization, calldata=0x)
        TransactionManager->>Sponsor: Post unsigned txn to Sponsor RPC API<br>eth_sendTransaction(unsigned txn)
        Sponsor->>ContractAddress: Sign and broadcast txn on-chain<br>eth_sendRawTransaction(signed txn)
        ContractAddress-->>Sponsor: Gas deducted from balance
        ContractAddress->>ContractAddress: Set EOA delegation addres
    end

    TransactionManager->>TransactionManager: Craft inner contract call<br>(to=token contract, calldata=transfer(to=recipient,value=10))
    TransactionManager->>TransactionManager: Craft outer contract call<br>(calldata=execute(inner contract call))
    TransactionManager->>TransactionManager: Construct unsigned txn<br>(to=self, calldata=outer contract call)

    TransactionManager->>Sponsor: Post unsigned txn to Sponsor RPC API<br>eth_sendTransaction(unsigned txn)
    Sponsor->>ContractAddress: Sign and broadcast txn on-chain<br>eth_sendRawTransaction(signed txn)
    ContractAddress-->>Sponsor: Gas deducted from balance
    ContractAddress->>ContractAddress: Validate inner calldata
    ContractAddress->>Token: Execute inner calldata<br>execute(to=token contract,<br> calldata=transfer(to=recipient,value=10))
```

## Tooling
The [foundry toolchain](https://github.com/foundry-rs/foundry?tab=readme-ov-file#installation) is used for local Prague node and contract deployment.
```shell
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Launch prague (Pectra) with EIP-7702 support
```shell
anvil --hardfork prague
```

### Deploy Smart EOA implementation contract
```shell
forge create --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --broadcast src/BatchCallDelegation.sol:BatchCallDelegation
```

### Set EOA Wallet (0 ETH) and fund Gas Sponsor EOA (10 ETH)
```shell
cast rpc anvil_setBalance 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720 0
cast rpc anvil_setBalance 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 10000000000000000000
```

### Launch Gas Sponsor RPC node
```shell
npm install --prefix ./sponsor-api
ts-node sponsor-api/sponsor.ts
```

### Execute transaction cases from EOA wallet
```shell
npm install --prefix ./viem-client
NODE_ENV=development ts-node viem-client/src/index.ts
```