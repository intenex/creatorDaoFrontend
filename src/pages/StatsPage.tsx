// src/pages/StatsPage.tsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  VOTING_DAO_ADDRESS,
  VOTING_DAO_ABI,
  ALCHEMY_RPC_URL,
} from "../constants";

const StatsPage: React.FC = () => {
  const [daoContract, setDaoContract] = useState<any>(null);
  const [voteCount, setVoteCount] = useState<number>(0);
  const [votesStats, setVotesStats] = useState<any[]>([]);
  const [queryAddress, setQueryAddress] = useState<string>("");
  const [queryResults, setQueryResults] = useState<any>(null);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
    const dao = new ethers.Contract(
      VOTING_DAO_ADDRESS,
      VOTING_DAO_ABI,
      provider
    );
    setDaoContract(dao);
    loadVotes(dao);
  }, []);

  const loadVotes = async (dao: any) => {
    try {
      const count = await dao.voteCount();
      const numVotes = count.toNumber();
      setVoteCount(numVotes);
      const tempVotes = [];
      for (let i = 1; i <= numVotes; i++) {
        const candidates = await dao.getCandidates(i);
        const results = await dao.getVoteResults(i);
        tempVotes.push({ voteId: i, candidates, results });
      }
      setVotesStats(tempVotes);
    } catch (error) {
      console.error(error);
    }
  };

  const handleQueryAddress = async () => {
    if (!daoContract) return;
    try {
      const results = await daoContract.getAllUserVoteResults(queryAddress);
      setQueryResults(results);
    } catch (error) {
      console.error(error);
      alert("Error fetching user vote history.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Voting Statistics</h1>
      <p>
        <strong>Total Votes:</strong> {voteCount}
      </p>
      {votesStats.map((vote, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3>Vote ID: {vote.voteId}</h3>
          <ul>
            {vote.candidates.map((cand: string, i: number) => (
              <li key={i}>
                {cand}: {vote.results[1][i].toString()} votes
              </li>
            ))}
          </ul>
        </div>
      ))}

      <section style={{ marginTop: "2rem" }}>
        <h2>Query User Vote History</h2>
        <input
          type="text"
          placeholder="User address"
          value={queryAddress}
          onChange={(e) => setQueryAddress(e.target.value)}
        />
        <button onClick={handleQueryAddress}>Query</button>
        {queryResults && (
          <div>
            <h3>User Vote History</h3>
            {queryResults.map((voteRes: any, idx: number) => (
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

export default StatsPage;
