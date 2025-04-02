import React from "react";
import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/demonstration">Demonstration</Link>
      <Link to="/timeline">Timeline</Link>
      <Link to="/sources">Sources</Link>
      <Link to="/team">The Team</Link>
    </nav>
  );
}

export default Navigation;
