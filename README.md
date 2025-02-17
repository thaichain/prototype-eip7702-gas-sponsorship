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
        TransactionManager->>Sponsor: Serialize and sign txn with Sponsor
        TransactionManager->>ContractAddress: Broadcast txn on-chain<br>eth_sendRawTransaction(signed txn)
        ContractAddress-->>Sponsor: Gas deducted from balance
        ContractAddress->>ContractAddress: Set EOA delegation addres
    end

    TransactionManager->>TransactionManager: Craft inner contract call<br>(to=token contract, calldata=transfer(to=recipient,value=10))

    TransactionManager->>TransactionManager: Craft outer contract call<br>(calldata=execute(inner contract call))

    TransactionManager->>TransactionManager: Construct unsigned txn<br>(to=self, calldata=outer contract call)

    TransactionManager->>Sponsor: Serialize and sign txn with Sponsor

    TransactionManager->>ContractAddress: Broadcast txn on-chain<br>eth_sendRawTransaction(signed txn)
    ContractAddress-->>Sponsor: Gas deducted from balance
    ContractAddress->>ContractAddress: Validate Authorization<br>(chainId, nonce, signature)
    ContractAddress->>ContractAddress: Validate inner calldata
    ContractAddress->>Token: Execute inner calldata<br>execute(to=token contract,<br> calldata=transfer(to=recipient,value=10))
```


### Launch prague (Pectra) with EIP-7702 support
```shell
anvil --hardfork prague
```

### Deploy Smart EOA contract
```shell
forge create --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --broadcast src/BatchCallDelegation.sol:BatchCallDelegation
```

### Fund EOA Wallet (0 ETH) and Gas Sponsor EOA (10 ETH)
```shell
cast rpc anvil_setBalance 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720 0
cast rpc anvil_setBalance 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 10000000000000000000
```

### Execute the transaction cases
```shell
NODE_ENV=development ts-node viem-client/src/index.ts
```