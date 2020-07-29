const smartContractAddress = "0x53195d8116b87abef1707f854f4679263bc00d8a";

const smartContractABI = [
	{
		"inputs": [
			{
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			},
			{
				"internalType": "bytes20",
				"name": "_projectHash",
				"type": "bytes20"
			},
			{
				"internalType": "uint256[]",
				"name": "_checkpointRewards",
				"type": "uint256[]"
			}
		],
		"name": "addProject",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			},
			{
				"internalType": "address payable",
				"name": "assigneeAddress",
				"type": "address"
			}
		],
		"name": "assign",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "checkpointCompleted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_checkpointIndex",
				"type": "uint256"
			}
		],
		"name": "CheckpointCompleted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			}
		],
		"name": "deleteProject",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "_clientAddress",
				"type": "address"
			}
		],
		"name": "ProjectAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "_assigneeAddress",
				"type": "address"
			}
		],
		"name": "ProjectAssigned",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			}
		],
		"name": "ProjectDeleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			}
		],
		"name": "ProjectUnassigned",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			}
		],
		"name": "unassign",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_from",
				"type": "uint256"
			}
		],
		"name": "get20Projects",
		"outputs": [
			{
				"internalType": "bytes12[20]",
				"name": "",
				"type": "bytes12[20]"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllProjects",
		"outputs": [
			{
				"internalType": "bytes12[]",
				"name": "",
				"type": "bytes12[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_assigneeAddress",
				"type": "address"
			}
		],
		"name": "getAssigneeProjects",
		"outputs": [
			{
				"internalType": "bytes12[]",
				"name": "",
				"type": "bytes12[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_clientAddress",
				"type": "address"
			}
		],
		"name": "getClientProjects",
		"outputs": [
			{
				"internalType": "bytes12[]",
				"name": "",
				"type": "bytes12[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes12",
				"name": "_id",
				"type": "bytes12"
			}
		],
		"name": "getProject",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "bytes20",
				"name": "",
				"type": "bytes20"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			},
			{
				"internalType": "bool[]",
				"name": "",
				"type": "bool[]"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export {smartContractAddress, smartContractABI};