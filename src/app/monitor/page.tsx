"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import DiagramTitle from "./DiagramTitle";
import Diagram from "./Diagram";
import { BACK } from "@/consts";

const MonitorPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const org = searchParams.get("org") || "all";

  return (
    <div className="min-w-full w-full h-[calc(100vh-64px)] justify-center container flex flex-col">
      <div className="flex justify-center items-center relative mb-4">
        <DiagramTitle org={org} />
        <Button
          onClick={() => router.back()}
          className="absolute top-2 left-4 flex items-center gap-1 bg-secondary/70 hover:bg-secondary text-foreground"
          variant="outline"
          size="sm"
        >
          <ArrowLeft size={16} className="text-primary" /> {BACK}
        </Button>
      </div>

      <div className="flex-1 glass-card overflow-hidden">
        <Diagram org={org} />
      </div>
    </div>
  );
};

export default MonitorPage;
