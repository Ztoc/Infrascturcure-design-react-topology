export const getDiagramTitle = (org: string): string => {
  return "ISP";
};

export default function DiagramTitle({ org }: { org: string }) {
  console.log(org);
  return (
    <div className="flex justify-center align-items">
      <div className="font-semibold text-16 bg-blue-500 text-white px-4 py-2 rounded">
        {`${getDiagramTitle(org)} Structure`}
      </div>
    </div>
  );
}
