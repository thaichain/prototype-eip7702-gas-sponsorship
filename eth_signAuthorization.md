## `eth_signAuthorization`

Returns a signature over a EIP-7702 authorization tuple `keccak('0x05' || rlp([chain_id, address, nonce]))` which is used in TransactionType=0x04 `authorization_list` to designate the smart contract address code to be executed with a Smart EOA transaction.

### Parameters
1. DATA, 20 Bytes - address of the EOA account that signs the authorization
2. Object - The authorzation object type:
    - chainId: QUANTITY, Integer of a chain id.
    - address: DATA, 20 Bytes - The delegated set code address of the Smart EOA.
    - nonce: QUANTITY - Integer of a nonce.

### Returns:
DATA: Signature. The hex encoded 65 byte array starting with 0x encoding the r, s and v parameters.

### Example:
// Request
```shell
curl -X POST --data '{
  "jsonrpc": "2.0",
  "method": "eth_signAuthorization",
  "params": [
    "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    {
      "chainId": 31337,
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "nonce": 6
    }
  ],
  "id": 1
}'
```

// Result
```shell
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "0xcfa7f23736b14748fbcc8054d3e952e482f024f5c34c4450721567469966fff1405e29a46e2b89bbf09be992fb9516af295ee5e0d7d4370290b775eb40bcd00f1b"
}
```