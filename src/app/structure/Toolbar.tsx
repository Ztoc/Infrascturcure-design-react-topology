import { TableIcon, CloseIcon } from "@patternfly/react-icons";
import { EditIcon, TrashIcon } from "lucide-react";
import { SaveIcon } from "@patternfly/react-icons";
import Image from "next/image";

import DepartmentIcon from "@/components/icons/DepartmentIcon";
import ServerIcon from "@/components/icons/ServerIcon";
import BranchIcon from "@/components/icons/BranchIcon";
import { Button } from "@/components/ui/button";
import Netline from "@/assets/netline.png";
import SplitButton from "./SplitButton";
import Fiber from "@/assets/fiber.png";
import { DrawItemType } from "@/type";

import {
  CHANGE_CONFIGURE,
  DELETE,
  DEPARTMENT,
  DISCONNECT,
  FIBER_OPTIC_CABLE,
  GROUP,
  SERVER,
  BRANCH,
  SAVE,
  TWISTED_PAIR_CABLE,
} from "@/consts";

const optionsNodes = {
  title: "Add",
  items: [
    {
      title: BRANCH,
      icon: <BranchIcon />,
      item: DrawItemType.ADD_BRANCH,
    },
    {
      title: DEPARTMENT,
      icon: <DepartmentIcon />,
      item: DrawItemType.ADD_DEPARTMENT,
    },
    {
      title: SERVER,
      icon: <ServerIcon />,
      item: DrawItemType.ADD_SERVER,
    },
  ],
};

const optionsConnect = {
  title: "Connection",
  items: [
    {
      title: TWISTED_PAIR_CABLE,
      icon: <Image src={Netline} alt="Netline" width={60} height={60} />,
      item: DrawItemType.CONNECT,
    },
    {
      title: FIBER_OPTIC_CABLE,
      icon: <Image src={Fiber} alt="Fiber" width={60} height={60} />,
      item: DrawItemType.CONNECT_BY_ISOLATOR,
    },
    {
      title: DISCONNECT,
      icon: <CloseIcon className="mr-2" />,
      item: DrawItemType.DISCONNECT,
    },
  ],
};

type ToolbarProps = {
  org: string;
  onAdd: (item: DrawItemType) => void;
  count: number;
};

const Toolbar = ({ org, count, onAdd }: ToolbarProps) => {
  const handleClick = (item: DrawItemType) => {
    onAdd(item);
  };
  return (
    <div className="flex flex-wrap gap-2 items-center mt-4 w-full justify-center">
      <div className="flex gap-2 px-4">
        <SplitButton options={optionsNodes} onAdd={onAdd} />
        <SplitButton options={optionsConnect} onAdd={onAdd} />
      </div>

      <Button
        variant="outline"
        onClick={() => handleClick(DrawItemType.RENAME)}
      >
        <EditIcon className="mr-2 h-4 w-4" />
        {CHANGE_CONFIGURE}
      </Button>

      <Button
        variant="outline"
        onClick={() => handleClick(DrawItemType.DELETE)}
        disabled={count < 1}
      >
        <TrashIcon className="mr-2 h-4 w-4" />
        {DELETE}
      </Button>

      <Button
        variant="outline"
        disabled={count < 2}
        onClick={() => handleClick(DrawItemType.GROUP)}
      >
        <TableIcon className="mr-2" />
        {GROUP}
      </Button>

      <Button
        variant="secondary"
        onClick={() => handleClick(DrawItemType.SAVE_DIAGRAM)}
      >
        <SaveIcon className="mr-2" />
        {SAVE}
      </Button>
    </div>
  );
};

export default Toolbar;
