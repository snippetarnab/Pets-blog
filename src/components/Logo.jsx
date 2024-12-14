import React from "react";

function Logo({ width = "100px" }) {
  return (
    <div>
      <img
        src="/public/petsblog.png"
        alt="logo"
        style={{ width: width, height: "auto" }}
      />
    </div>
  );
}

export default Logo;
