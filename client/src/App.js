import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import TeamMembers from "./components/TeamMembers";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Demonstration from "./pages/Demonstration";
import Timeline from "./pages/Timeline";
import Sources from "./pages/Sources";
import Team from "./pages/Team";

function App() {
  return (
    <Router>
      <div className="container">
        <Header />
        <Navigation />

        <div className="main-content">
          <div className="side-panel left-panel">
            <h3>Left</h3>
            <p>ABC</p>
          </div>

          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/demonstration" element={<Demonstration />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/team" element={<Team />} />
            </Routes>
          </div>

          <TeamMembers />
        </div>
      </div>
    </Router>
  );
}

export default App;
