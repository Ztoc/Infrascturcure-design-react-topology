"use client";

import Diagram from "./Diagram";

export enum Organization {
  ISP = "isp",
  SITES = "sites",
  ORG_609 = "609",
  ORG_626 = "626",
}

type DiagramAppProps = {
  organization: Organization;
};

function DiagramApp({ organization }: DiagramAppProps) {
  return (
    <div className="min-w-full w-full h-screen justify-center container flex flex-col">
      <Diagram organization={Organization.ISP} />
    </div>
  );
}

export default DiagramApp;
