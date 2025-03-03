import { BanIcon, TableIcon, CloseIcon } from "@patternfly/react-icons";
import { EditIcon, NetworkIcon, TrashIcon } from "lucide-react";
import { SaveIcon } from "@patternfly/react-icons";
import Image from "next/image";

import Department from "../../assets/building.png";
import { getDiagramTitle } from "./DiagramTitle";
import { Button } from "@/components/ui/button";
import Branch from "../../assets/branch.png";
import Server from "../../assets/server.png";
import SplitButton from "./SplitButton";
import { Organization } from "./page";

export enum DrawItemType {
  ADD_BRANCH = "BRANCH",
  ADD_DEPARTMENT = "DEPARTMENT",
  ADD_ROUTER = "ROUTER",
  ADD_SWITCH = "SWITCH",
  ADD_FIREWALL = "FIREWALL",
  ADD_SERVER = "SERVER",
  CONNECT = "CONNECT",
  CONNECT_BY_ISOLATOR = "CONNECT_BY_ISOLATOR",
  DISCONNECT = "DISCONNECT",
  GROUP = "GROUP",
  DELETE = "DELETE",
  RENAME = "RENAME",
  SAVE_DIAGRAM = "SAVE",
}

export enum IconType {
  BRANCH_ICON = "BranchIcon",
  DEPARTMENT_ICON = "DepartmentIcon",
  SERVER_ICON = "ServerIcon",
  CLUSTER_ICON = "ClusterIcon",
  ROUTER_ICON = "RouterIcon",
  SWITCH_ICON = "SwitchIcon",
  FIREWALL_ICON = "FirewallIcon",
}

const optionsNodes = {
  title: "Add",
  items: [
    {
      title: "Branch",
      icon: (
        <Image
          src={Branch}
          alt="Branch"
          className="rounded-[2px]"
          width={20}
          height={20}
        />
      ),
      item: DrawItemType.ADD_BRANCH,
    },
    {
      title: "Department",
      icon: (
        <Image
          src={Department}
          alt="Department"
          className="rounded-[2px]"
          width={20}
          height={20}
        />
      ),
      item: DrawItemType.ADD_DEPARTMENT,
    },
    {
      title: "Server",
      icon: (
        <Image
          src={Server}
          alt="Server"
          className="rounded-[2px]"
          width={20}
          height={20}
        />
      ),
      item: DrawItemType.ADD_SERVER,
    },
  ],
};

const optionsConnect = {
  title: "Connection",
  items: [
    {
      title: "Netline",
      icon: <NetworkIcon className="mr-2" />,
      item: DrawItemType.CONNECT,
    },
    {
      title: "Blocker",
      icon: <BanIcon className="mr-2" />,
      item: DrawItemType.CONNECT_BY_ISOLATOR,
    },
    {
      title: "Cancel",
      icon: <CloseIcon className="mr-2" />,
      item: DrawItemType.DISCONNECT,
    },
  ],
};

type ToolbarProps = {
  org: Organization;
  onAdd: (item: DrawItemType) => void;
  count: number;
};

export default function Toolbar({ org, count, onAdd }: ToolbarProps) {
  const handleClick = (item: DrawItemType) => {
    onAdd(item);
  };
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button variant="secondary" className="font-medium">
        {`${getDiagramTitle(org)} Structure`}
      </Button>

      <div className="flex gap-2">
        <SplitButton options={optionsNodes} onAdd={onAdd} />
        <SplitButton options={optionsConnect} onAdd={onAdd} />
      </div>

      <Button
        variant="outline"
        onClick={() => handleClick(DrawItemType.RENAME)}
      >
        <EditIcon className="mr-2 h-4 w-4" />
        Change Address
      </Button>

      <Button
        variant="outline"
        onClick={() => handleClick(DrawItemType.DELETE)}
        disabled={count < 1}
      >
        <TrashIcon className="mr-2 h-4 w-4" />
        Delete
      </Button>

      <Button
        variant="outline"
        disabled={count < 2}
        onClick={() => handleClick(DrawItemType.GROUP)}
      >
        <TableIcon className="mr-2" />
        Group
      </Button>

      <Button
        variant="secondary"
        onClick={() => handleClick(DrawItemType.SAVE_DIAGRAM)}
      >
        <SaveIcon className="mr-2" />
        Save
      </Button>
    </div>
  );
}
