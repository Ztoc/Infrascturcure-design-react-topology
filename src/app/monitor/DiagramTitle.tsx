import { STRUCTURE_TITLE } from "@/consts";
import { GET_DIAGRAM_TITLE } from "@/query";
import { useQuery } from "@apollo/client";

export const getDiagramTitle = (org: string): string => {
  const {
    error,
    loading,
    data: diagramTitle,
  } = useQuery(GET_DIAGRAM_TITLE, {
    variables: { org: org },
  });

  if (loading) return "Loading...";

  return diagramTitle.getDiagramTitle;
};

export default function DiagramTitle({ org }: { org: string }) {
  return (
    <div className="flex justify-center align-items">
      <div className="font-semibold text-16 text-dark-500 px-4 py-2 rounded text-2xl">
        {`${getDiagramTitle(org)} ${STRUCTURE_TITLE}`}
      </div>
    </div>
  );
}
