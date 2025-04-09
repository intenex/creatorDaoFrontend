// src/components/NavBar.tsx
import React from "react";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => (
  <nav style={{ marginBottom: "1rem" }}>
    <ul style={{ listStyle: "none", display: "flex", gap: "1rem" }}>
      <li>
        <Link to="/">Voter</Link>
      </li>
      <li>
        <Link to="/admin">Admin</Link>
      </li>
      <li>
        <Link to="/stats">Statistics</Link>
      </li>
    </ul>
  </nav>
);

export default NavBar;
