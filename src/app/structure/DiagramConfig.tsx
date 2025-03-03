import { lazy } from "react";
import { authRoles } from "src/app/auth";
import { Organization } from "./DiagramApp";

const DiagramApp = lazy(() => import("./DiagramApp"));

/**
 * The finance dashboard app config.
 */
const DiagramConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.onlyGuest,
  routes: [
    {
      path: "dashboards/diagram-isp",
      element: <DiagramApp organization={Organization.ISP} />,
    },
    {
      path: "dashboards/diagram-sites",
      element: <DiagramApp organization={Organization.SITES} />,
    },
    {
      path: "dashboards/diagram-609",
      element: <DiagramApp organization={Organization.ORG_609} />,
    },
    {
      path: "dashboards/diagram-626",
      element: <DiagramApp organization={Organization.ORG_626} />,
    },
  ],
};

export default DiagramConfig;
