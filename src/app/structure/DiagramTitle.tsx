import { Organization } from "./page";

type DiagramTitleProps = {
  org: Organization;
};

export const getDiagramTitle = (org: Organization): string => {
  switch (org) {
    case Organization.ISP:
      return "Internet ";
    case Organization.SITES:
      return "Foreign";
    case Organization.ORG_609:
      return "Internet research";
    case Organization.ORG_626:
      return "KW";
  }
};

export default function DiagramTitle({ org }: DiagramTitleProps) {
  console.log(org);
  return (
    <div className="flex justify-center align-items">
      <div className="font-semibold text-16 bg-blue-500 text-white px-4 py-2 rounded">
        {`${getDiagramTitle(org)} Structure`}
      </div>
    </div>
  );
}
