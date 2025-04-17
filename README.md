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
    box grey Blockchain
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