"use client";

import { useState } from "react";
import Diagram from "./Diagram";

function DiagramApp() {
  const [org, setOrg] = useState("all");

  return (
    <div className="min-w-full w-full h-screen justify-center container flex flex-col">
      <Diagram org={org} />
    </div>
  );
}

export default DiagramApp;
