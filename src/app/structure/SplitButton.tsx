import React from "react";
import { DrawItemType } from "./Toolbar";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SplitButtonProps = {
  onAdd: (item: DrawItemType) => void;
  options: {
    title: string;
    items: { title: string; icon: React.ReactNode; item: DrawItemType }[];
  };
};

const SplitButton = ({ onAdd, options }: SplitButtonProps) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleClick = () => {
    onAdd(options.items[selectedIndex].item);
  };

  const handleMenuItemClick = (index: number) => {
    setSelectedIndex(index);
    onAdd(options.items[index].item);
  };

  return (
    <div className="inline-flex rounded-md shadow-sm" role="group">
      <Button
        variant="outline"
        className="rounded-r-none border-r-0 bg-background hover:bg-accent hover:text-accent-foreground"
        onClick={handleClick}
      >
        {options.items[selectedIndex].icon}
        {options.title}: {options.items[selectedIndex].title}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-l-none px-2 bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border-border">
          {options.items.map((option, index) => (
            <DropdownMenuItem
              key={option.title}
              onClick={() => handleMenuItemClick(index)}
              className="gap-2 hover:bg-accent hover:text-accent-foreground"
            >
              {option.icon} {option.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SplitButton;
