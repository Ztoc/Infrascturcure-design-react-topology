import { LOADING } from "@/consts";
import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin"></div>
        <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-6 text-foreground font-medium text-lg animate-pulse">
        {LOADING}
      </p>
    </div>
  );
};

export default Loading;
