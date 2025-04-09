// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  VOTING_DAO_ADDRESS,
  VOTING_DAO_ABI,
  ALCHEMY_RPC_URL,
} from "../constants";

const AdminPage: React.FC = () => {
  const [readProvider, setReadProvider] =
    useState<ethers.JsonRpcProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");

  const [daoContractRead, setDaoContractRead] = useState<any>(null);
  const [daoContractWrite, setDaoContractWrite] = useState<any>(null);

  // Admin management fields.
  const [adminAddress, setAdminAddress] = useState<string>("");
  const [removeAdminAddress, setRemoveAdminAddress] = useState<string>("");

  // Vote creation / edit fields.
  const [newVoteCandidates, setNewVoteCandidates] = useState<string>("");
  const [newVoteStart, setNewVoteStart] = useState<string>("");
  const [newVoteEnd, setNewVoteEnd] = useState<string>("");

  const [editVoteId, setEditVoteId] = useState<string>("");
  const [editVoteCandidates, setEditVoteCandidates] = useState<string>("");
  const [editVoteStart, setEditVoteStart] = useState<string>("");
  const [editVoteEnd, setEditVoteEnd] = useState<string>("");

  const [currentVoteStatus, setCurrentVoteStatus] = useState<any>(null);
  const [queryUserAddress, setQueryUserAddress] = useState<string>("");
  const [userVoteDetails, setUserVoteDetails] = useState<any>(null);

  // Initialize the read-only provider.
  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
    setReadProvider(provider);
  }, []);

  // Setup read-only contract.
  useEffect(() => {
    if (readProvider) {
      const dao = new ethers.Contract(
        VOTING_DAO_ADDRESS,
        VOTING_DAO_ABI,
        readProvider
      );
      setDaoContractRead(dao);
    }
  }, [readProvider]);

  // When a wallet is connected (signer), set up write contract.
  useEffect(() => {
    if (signer) {
      const dao = new ethers.Contract(
        VOTING_DAO_ADDRESS,
        VOTING_DAO_ABI,
        signer
      );
      setDaoContractWrite(dao);
      signer.getAddress().then(setAccount);
    }
  }, [signer]);

  // Connect wallet using MetaMask.
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

  const handleAssignAdmin = async () => {
    if (!daoContractWrite) {
      alert("Please connect your wallet.");
      return;
    }
    try {
      const tx = await daoContractWrite.assignAdmin(adminAddress);
      await tx.wait();
      alert("Admin assigned!");
    } catch (error) {
      console.error(error);
      alert("Error assigning admin.");
    }
  };

  const handleRemoveAdmin = async () => {
    if (!daoContractWrite) {
      alert("Please connect your wallet.");
      return;
    }
    try {
      const tx = await daoContractWrite.removeAdmin(removeAdminAddress);
      await tx.wait();
      alert("Admin removed!");
    } catch (error) {
      console.error(error);
      alert("Error removing admin.");
    }
  };

  const handleCreateVote = async () => {
    if (!daoContractWrite) {
      alert("Please connect your wallet.");
      return;
    }
    const candidates = newVoteCandidates
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (!newVoteStart || !newVoteEnd) {
      alert("Please provide valid start and end times (Unix timestamps).");
      return;
    }
    try {
      const tx = await daoContractWrite.createVote(
        candidates,
        newVoteStart,
        newVoteEnd
      );
      await tx.wait();
      alert("Vote created!");
    } catch (error) {
      console.error(error);
      alert("Error creating vote.");
    }
  };

  const handleEditVote = async () => {
    if (!daoContractWrite) {
      alert("Please connect your wallet.");
      return;
    }
    const candidates = editVoteCandidates
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (!editVoteId || !editVoteStart || !editVoteEnd) {
      alert("Please fill in all required fields for editing the vote.");
      return;
    }
    try {
      const tx = await daoContractWrite.editVote(
        editVoteId,
        candidates,
        editVoteStart,
        editVoteEnd
      );
      await tx.wait();
      alert("Vote edited!");
    } catch (error) {
      console.error(error);
      alert("Error editing vote.");
    }
  };

  const handleLoadCurrentVoteStatus = async () => {
    if (!daoContractRead) return;
    try {
      const count = await daoContractRead.voteCount();
      const voteId = count.toNumber();
      if (voteId > 0) {
        const candidates = await daoContractRead.getCandidates(voteId);
        const results = await daoContractRead.getVoteResults(voteId);
        setCurrentVoteStatus({ voteId, candidates, results });
      }
    } catch (error) {
      console.error(error);
      alert("Error loading current vote status.");
    }
  };

  const handleQueryUserVote = async () => {
    if (!daoContractRead) return;
    try {
      const details = await daoContractRead.getAllUserVoteResults(
        queryUserAddress
      );
      setUserVoteDetails(details);
    } catch (error) {
      console.error(error);
      alert("Error querying user vote history.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Admin Dashboard</h1>
      {account ? (
        <p>
          <strong>Your Account:</strong> {account}
        </p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet (MetaMask)</button>
      )}

      <section>
        <h2>Admin Management</h2>
        <div>
          <h3>Assign Admin</h3>
          <input
            type="text"
            placeholder="Admin address"
            value={adminAddress}
            onChange={(e) => setAdminAddress(e.target.value)}
          />
          <button onClick={handleAssignAdmin}>Assign Admin</button>
        </div>
        <div>
          <h3>Remove Admin</h3>
          <input
            type="text"
            placeholder="Admin address"
            value={removeAdminAddress}
            onChange={(e) => setRemoveAdminAddress(e.target.value)}
          />
          <button onClick={handleRemoveAdmin}>Remove Admin</button>
        </div>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Create Vote</h2>
        <p>Enter candidate names (comma-separated; max 20)</p>
        <input
          type="text"
          placeholder="Candidates"
          value={newVoteCandidates}
          onChange={(e) => setNewVoteCandidates(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="Start time (Unix timestamp)"
          value={newVoteStart}
          onChange={(e) => setNewVoteStart(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="End time (Unix timestamp)"
          value={newVoteEnd}
          onChange={(e) => setNewVoteEnd(e.target.value)}
        />
        <br />
        <button onClick={handleCreateVote}>Create Vote</button>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Edit Vote</h2>
        <input
          type="text"
          placeholder="Vote ID"
          value={editVoteId}
          onChange={(e) => setEditVoteId(e.target.value)}
        />
        <br />
        <p>New candidate names (leave empty to keep current):</p>
        <input
          type="text"
          placeholder="Candidates"
          value={editVoteCandidates}
          onChange={(e) => setEditVoteCandidates(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="New start time (Unix timestamp)"
          value={editVoteStart}
          onChange={(e) => setEditVoteStart(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="New end time (Unix timestamp)"
          value={editVoteEnd}
          onChange={(e) => setEditVoteEnd(e.target.value)}
        />
        <br />
        <button onClick={handleEditVote}>Edit Vote</button>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Current Vote Status</h2>
        <button onClick={handleLoadCurrentVoteStatus}>
          Load Current Vote Status
        </button>
        {currentVoteStatus && (
          <div>
            <p>
              <strong>Vote ID:</strong> {currentVoteStatus.voteId}
            </p>
            <h3>Candidates and Votes</h3>
            <ul>
              {currentVoteStatus.candidates.map((cand: string, idx: number) => (
                <li key={idx}>
                  {cand}: {currentVoteStatus.results[1][idx].toString()} votes
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Query User Vote History</h2>
        <input
          type="text"
          placeholder="User address"
          value={queryUserAddress}
          onChange={(e) => setQueryUserAddress(e.target.value)}
        />
        <button onClick={handleQueryUserVote}>Query</button>
        {userVoteDetails && (
          <div>
            <h3>User Vote History</h3>
            {userVoteDetails.map((voteRes: any, idx: number) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <p>
                  <strong>Vote ID:</strong> {voteRes.voteId.toString()}
                </p>
                <ul>
                  {voteRes.candidateNames.map((name: string, i: number) => (
                    <li key={i}>
                      {name}: {voteRes.votesReceived[i].toString()}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPage;
