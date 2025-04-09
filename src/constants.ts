// src/constants.ts

export const VOTING_DAO_ADDRESS = "0xc21c879fe4f0d7ee73fc5d9ffb98e98915a795f3";
export const VOTING_TOKEN_ADDRESS =
  "0x4811413D0392D08d52848a550e438D7A8c2e6875";
export const ALCHEMY_RPC_URL = "PLACEHOLDER";

export const VOTING_DAO_ABI = [
  // voteCount
  {
    inputs: [],
    name: "voteCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // getCandidates
  {
    inputs: [{ internalType: "uint256", name: "_voteId", type: "uint256" }],
    name: "getCandidates",
    outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function",
  },
  // getVoteResults
  {
    inputs: [{ internalType: "uint256", name: "_voteId", type: "uint256" }],
    name: "getVoteResults",
    outputs: [
      { internalType: "string[]", name: "candidateNames", type: "string[]" },
      { internalType: "uint256[]", name: "votesReceived", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // getUserVoteResults
  {
    inputs: [{ internalType: "uint256", name: "_voteId", type: "uint256" }],
    name: "getUserVoteResults",
    outputs: [
      { internalType: "string[]", name: "candidateNames", type: "string[]" },
      { internalType: "uint256[]", name: "votesReceived", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // getAllUserVoteResults
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getAllUserVoteResults",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "voteId", type: "uint256" },
          {
            internalType: "string[]",
            name: "candidateNames",
            type: "string[]",
          },
          {
            internalType: "uint256[]",
            name: "votesReceived",
            type: "uint256[]",
          },
        ],
        internalType: "struct VotingDAO.UserVoteResult[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // vote
  {
    inputs: [
      { internalType: "uint256", name: "_voteId", type: "uint256" },
      {
        internalType: "uint256[]",
        name: "_selectedCandidateIndices",
        type: "uint256[]",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // revokeVote
  {
    inputs: [{ internalType: "uint256", name: "_voteId", type: "uint256" }],
    name: "revokeVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // assignAdmin
  {
    inputs: [{ internalType: "address", name: "_admin", type: "address" }],
    name: "assignAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // removeAdmin
  {
    inputs: [{ internalType: "address", name: "_admin", type: "address" }],
    name: "removeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // createVote
  {
    inputs: [
      { internalType: "string[]", name: "_candidates", type: "string[]" },
      { internalType: "uint256", name: "_startTime", type: "uint256" },
      { internalType: "uint256", name: "_endTime", type: "uint256" },
    ],
    name: "createVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // editVote
  {
    inputs: [
      { internalType: "uint256", name: "_voteId", type: "uint256" },
      { internalType: "string[]", name: "_newCandidates", type: "string[]" },
      { internalType: "uint256", name: "_newStartTime", type: "uint256" },
      { internalType: "uint256", name: "_newEndTime", type: "uint256" },
    ],
    name: "editVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // userCurrentlyVoted
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "userCurrentlyVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

export const VOTING_TOKEN_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];
