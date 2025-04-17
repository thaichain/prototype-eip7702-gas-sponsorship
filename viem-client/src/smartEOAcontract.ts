export const smartEOAcontract = { 
  contractAddress: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
   abi: [
    {
      "type": "function",
      "name": "deployContract",
      "inputs": [
        {
          "name": "bytecode",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "execute",
      "inputs": [
        {
          "name": "calls",
          "type": "tuple[]",
          "internalType": "struct BatchCallDelegation.Call[]",
          "components": [
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "to",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "value",
              "type": "uint256",
              "internalType": "uint256"
            }
          ]
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    }
  ]
} as const