import React from "react";

function TeamMembers() {
  const members = [
    "Omar Ayesh",
    "Brian Blood",
    "Jake Galligan",
    "Jacki Liu",
    "Alexander Timmerman",
  ];

  return (
    <div className="side-panel right-panel">
      <h3>Group 1 Members (Last Name):</h3>
      {members.map((member, index) => (
        <p key={index}>{member}</p>
      ))}
    </div>
  );
}

export default TeamMembers;
