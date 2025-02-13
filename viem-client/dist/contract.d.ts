export declare const SmartEOA: {
    readonly contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    readonly abi: readonly [{
        readonly type: "function";
        readonly name: "deployContract";
        readonly inputs: readonly [{
            readonly name: "bytecode";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "address";
            readonly internalType: "address";
        }];
        readonly stateMutability: "payable";
    }, {
        readonly type: "function";
        readonly name: "execute";
        readonly inputs: readonly [{
            readonly name: "calls";
            readonly type: "tuple[]";
            readonly internalType: "struct BatchCallDelegation.Call[]";
            readonly components: readonly [{
                readonly name: "data";
                readonly type: "bytes";
                readonly internalType: "bytes";
            }, {
                readonly name: "to";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "value";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }];
        }];
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
    }];
};
//# sourceMappingURL=contract.d.ts.map