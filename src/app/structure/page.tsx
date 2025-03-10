"use client";

import { useSearchParams } from "next/navigation";

import Diagram from "./Diagram";
import DiagramTitle from "../monitor/DiagramTitle";

const StructurePage = () => {
  const searchParams = useSearchParams();

  const org = searchParams.get("org") || "all";

  return (
    <div className="min-w-full w-full h-[calc(100vh-64px)] justify-center container flex flex-col">
      <DiagramTitle org={org} />
      <div className="flex-1 glass-card overflow-hidden animate-scale-in">
        <Diagram org={org} />
      </div>
    </div>
  );
};

export default StructurePage;
