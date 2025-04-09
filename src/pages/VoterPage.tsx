// src/pages/VoterPage.tsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  VOTING_DAO_ADDRESS,
  VOTING_DAO_ABI,
  VOTING_TOKEN_ADDRESS,
  VOTING_TOKEN_ABI,
  ALCHEMY_RPC_URL,
} from "../constants";

const VoterPage: React.FC = () => {
  // Read-only provider for public data
  const [readProvider, setReadProvider] =
    useState<ethers.JsonRpcProvider | null>(null);
  // MetaMask signer (for writing)
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  // The connected account (from MetaMask)
  const [account, setAccount] = useState<string>("");

  // Contracts using readProvider (always available)
  const [daoContractRead, setDaoContractRead] = useState<any>(null);
  const [tokenContractRead, setTokenContractRead] = useState<any>(null);
  // Contracts using signer (for write operations), if available.
  const [daoContractWrite, setDaoContractWrite] = useState<any>(null);
  const [tokenContractWrite, setTokenContractWrite] = useState<any>(null);

  // User-specific details
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [pastVotes, setPastVotes] = useState<any[]>([]);

  // Voting data (active vote)
  const [activeVoteId, setActiveVoteId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [selectedCandidateIndices, setSelectedCandidateIndices] = useState<
    number[]
  >([]);
  const [votePreview, setVotePreview] = useState<string>("0");

  // Initialize the read provider from Alchemy on mount
  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
    setReadProvider(provider);
  }, []);

  // Set up read-only contracts once the read provider is available
  useEffect(() => {
    if (readProvider) {
      const dao = new ethers.Contract(
        VOTING_DAO_ADDRESS,
        VOTING_DAO_ABI,
        readProvider
      );
      const token = new ethers.Contract(
        VOTING_TOKEN_ADDRESS,
        VOTING_TOKEN_ABI,
        readProvider
      );
      setDaoContractRead(dao);
      setTokenContractRead(token);
    }
  }, [readProvider]);

  // Load active vote data (public) using the read-only contracts
  useEffect(() => {
    if (daoContractRead) {
      daoContractRead
        .voteCount()
        .then((count: any) => {
          const voteId = count.toNumber();
          if (voteId > 0) {
            daoContractRead
              .getCandidates(voteId)
              .then((cands: string[]) => {
                setActiveVoteId(voteId);
                setCandidates(cands);
              })
              .catch(console.error);
          }
        })
        .catch(console.error);
    }
  }, [daoContractRead]);

  // If account is connected, load user-specific data using the write contracts
  useEffect(() => {
    if (tokenContractWrite && account && daoContractWrite) {
      tokenContractWrite
        .balanceOf(account)
        .then((balance: any) => {
          setTokenBalance(ethers.formatUnits(balance, 18));
        })
        .catch(console.error);
      daoContractWrite
        .getAllUserVoteResults(account)
        .then((results: any[]) => {
          setPastVotes(results);
        })
        .catch(console.error);
    }
  }, [tokenContractWrite, daoContractWrite, account]);

  // When a wallet is connected (signer), set up write contracts using MetaMask
  useEffect(() => {
    if (signer) {
      const dao = new ethers.Contract(
        VOTING_DAO_ADDRESS,
        VOTING_DAO_ABI,
        signer
      );
      const token = new ethers.Contract(
        VOTING_TOKEN_ADDRESS,
        VOTING_TOKEN_ABI,
        signer
      );
      setDaoContractWrite(dao);
      setTokenContractWrite(token);
      signer.getAddress().then(setAccount);
    }
  }, [signer]);

  // Update vote preview (per candidate distribution) when selection changes.
  const handleCandidateToggle = (index: number) => {
    let newSelection = [...selectedCandidateIndices];
    if (newSelection.includes(index)) {
      newSelection = newSelection.filter((i) => i !== index);
    } else {
      if (newSelection.length < 10) {
        newSelection.push(index);
      }
    }
    setSelectedCandidateIndices(newSelection);
    if (tokenContractRead && readProvider && activeVoteId !== null) {
      // Use read-only token balance for preview even if wallet not connected
      // (if no wallet, account will be empty and preview might not update)
      if (account) {
        tokenContractRead.balanceOf(account).then((balance: any) => {
          const fullBalance = ethers.BigNumber.from(balance);
          if (newSelection.length > 0) {
            const perCandidate = fullBalance.div(newSelection.length);
            setVotePreview(ethers.formatUnits(perCandidate, 18));
          } else {
            setVotePreview("0");
          }
        });
      }
    }
  };

  // Connect wallet using MetaMask
  const connectWallet = async () => {
    try {
      if ((window as any).ethereum) {
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
      } else {
        alert("MetaMask not detected.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting wallet.");
    }
  };

  // Cast (or update) vote using the write contract (requires MetaMask connection)
  const handleCastVote = async () => {
    if (!daoContractWrite) {
      alert("Please connect your wallet to cast a vote.");
      return;
    }
    if (activeVoteId && selectedCandidateIndices.length > 0) {
      try {
        const tx = await daoContractWrite.vote(
          activeVoteId,
          selectedCandidateIndices
        );
        await tx.wait();
        alert("Vote cast successfully!");
      } catch (error) {
        console.error(error);
        alert("Error casting vote.");
      }
    } else {
      alert("No active vote or no candidates selected.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Voter Dashboard</h1>
      {account ? (
        <p>
          <strong>Your Account:</strong> {account}
        </p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet (MetaMask)</button>
      )}
      {account && (
        <p>
          <strong>Your Token Balance:</strong> {tokenBalance}
        </p>
      )}

      {activeVoteId ? (
        <div>
          <h2>Active Vote (ID: {activeVoteId})</h2>
          <h3>Candidates</h3>
          {candidates.map((cand, index) => (
            <div key={index}>
              <input
                type="checkbox"
                checked={selectedCandidateIndices.includes(index)}
                onChange={() => handleCandidateToggle(index)}
              />
              <label>{cand}</label>
            </div>
          ))}
          <p>
            <em>
              Each selected candidate will receive approximately {votePreview}{" "}
              votes.
            </em>
          </p>
          <button onClick={handleCastVote}>Cast Vote</button>
        </div>
      ) : (
        <p>No active vote at this time.</p>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h2>Your Past Votes</h2>
        {pastVotes.length > 0 ? (
          pastVotes.map((voteResult, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #ddd",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <p>
                <strong>Vote ID:</strong> {voteResult.voteId.toString()}
              </p>
              <ul>
                {voteResult.candidateNames.map((name: string, i: number) => (
                  <li key={i}>
                    {name}: {voteResult.votesReceived[i].toString()}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>
            {account
              ? "You have no past vote records."
              : "Connect your wallet to view your vote history."}
          </p>
        )}
      </div>
    </div>
  );
};

export default VoterPage;
