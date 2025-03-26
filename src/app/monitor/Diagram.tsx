"use client";

import React, { FC, useEffect, useMemo, useState } from "react";

import { useLazyQuery, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import {
  BaseNode,
  ColaLayout,
  ComponentFactory,
  DRAG_NODE_END_EVENT,
  DefaultEdge,
  DefaultGroup,
  DefaultNode,
  DragObjectWithType,
  DragOperationType,
  Edge,
  EdgeAnimationSpeed,
  EdgeTerminalType,
  Graph,
  GraphComponent,
  GraphElement,
  Layout,
  LayoutFactory,
  Model,
  ModelKind,
  Node,
  NodeModel,
  NodeShape,
  NodeStatus,
  SELECTION_EVENT,
  TopologySideBar,
  TopologyView,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  WithDndDropProps,
  WithDragNodeProps,
  WithSelectionProps,
  graphDropTargetSpec,
  groupDropTargetSpec,
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  withDndDrop,
  withDragNode,
  withPanZoom,
  withSelection,
  withTargetDrag,
} from "@patternfly/react-topology";
import _ from "lodash";
import { useContext } from "react";
import useSound from "use-sound";

import DepartmentIcon from "@/components/icons/DepartmentIcon";
import ServerIcon from "@/components/icons/ServerIcon";
import BranchIcon from "@/components/icons/BranchIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DiagramSideBar from "./DiagramSideBar";
import Loading from "@/components/Loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { READ_DIAGRAM, READ_IP } from "@/query";
import { AuthContext } from "@/context/AuthContext";
import {  IconType, CustomNodeProps, DataEdgeProps } from "@/type";

const getIconComponent = (icon: IconType) => {
  switch (icon) {
    case IconType.SERVER_ICON:
      return <ServerIcon />;
    case IconType.BRANCH_ICON:
      return <BranchIcon />;
    case IconType.DEPARTMENT_ICON:
      return <DepartmentIcon />;
    default:
      return <BranchIcon />;
  }
};

const BadgeColors = [
  {
    name: "A",
    badgeColor: "#ace12e",
    badgeTextColor: "#0f280d",
    badgeBorderColor: "#486b00",
  },
  {
    name: "B",
    badgeColor: "#F2F0FC",
    badgeTextColor: "#5752d1",
    badgeBorderColor: "#CBC1FF",
  },
];

const DEFAULT_GRAPH = { id: "graph", type: "graph", layout: "Cola" };

const CustomNode: FC<
  CustomNodeProps & WithSelectionProps & WithDragNodeProps & WithDndDropProps
> = ({ element, selected, onSelect, ...rest }) => {
  const data = element.getData();

  const router = useRouter();

 
  const badgeColors =
    BadgeColors.find((badgeColor) => badgeColor.name === data.badge) ||
    BadgeColors[0];

  const handleDoubleClick = (id: string) => {
    if (data.isRoot || data.icon === "ServerIcon" || data.icon === "DepartmentIcon") {
      return;
    }
    router.push(`/monitor?org=${id}`);
  };

  const nodeStatus = element.getNodeStatus().toString();

  const status = nodeStatus === "Critical"? NodeStatus.danger : nodeStatus==="Danger" ? NodeStatus.warning: NodeStatus.default; 

  return (
    <DefaultNode
      element={element}
      badge={data.badge}
      badgeColor={badgeColors?.badgeColor}
      badgeTextColor={badgeColors?.badgeTextColor}
      badgeBorderColor={badgeColors?.badgeBorderColor}
      showStatusBackground
      onSelect={onSelect}
      selected={selected}
      nodeStatus={status}
      {...rest}
    >
      <g transform={`translate(18, 18)`}>{getIconComponent(data.icon)}</g>
      <g
        className="cursor-pointer"
        onDoubleClick={() => handleDoubleClick(element.getId())}
      >
        <circle cx="37.5" cy="37.5" r="37.5" fill="transparent" />
      </g>
    </DefaultNode>
  );
};

const CustomEdge = ({ element, ...rest }: DataEdgeProps) => {
  element.setEdgeAnimationSpeed(EdgeAnimationSpeed.fast);

  return (
    <DefaultEdge
      element={element}
      startTerminalType={EdgeTerminalType.none}
      endTerminalType={EdgeTerminalType.none}
      className="text-gray-400"
      {...rest}
    />
  );
};
const customLayoutFactory: LayoutFactory = (
  type: string,
  graph: Graph
): Layout | undefined => new ColaLayout(graph, { layoutOnDrag: false });

const CONNECTOR_TARGET_DROP = "connector-target-drop";

const customComponentFactory: ComponentFactory = (
  kind: ModelKind,
  type: string
): any => {
  switch (type) {
    case "group":
      return withDndDrop(groupDropTargetSpec)(
        withDragNode(nodeDragSourceSpec("group"))(withSelection()(DefaultGroup))
      );
    default:
      switch (kind) {
        case ModelKind.graph:
          return withDndDrop(graphDropTargetSpec())(
            withPanZoom()(GraphComponent)
          );
        case ModelKind.node:
          return withSelection({ multiSelect: true, raiseOnSelect: true })(
            withDndDrop(nodeDropTargetSpec([CONNECTOR_TARGET_DROP]))(
              withDragNode(nodeDragSourceSpec("node", true, true))(CustomNode)
            )
          );
        case ModelKind.edge:
          return withTargetDrag<
            DragObjectWithType,
            Node,
            { dragging?: boolean },
            {
              element: GraphElement;
            }
          >({
            item: { type: CONNECTOR_TARGET_DROP },
            begin: (monitor, props) => {
              props.element.raise();
              return props.element;
            },
            drag: (event, monitor, props) => {
              (props.element as Edge).setEndPoint(event.x, event.y);
            },
            end: (dropResult, monitor, props) => {
              if (monitor.didDrop() && dropResult && props) {
                (props.element as Edge).setTarget(dropResult);
              }
              (props.element as Edge).setEndPoint();
            },
            collect: (monitor) => ({
              dragging: monitor.isDragging(),
            }),
          })(CustomEdge);
        default:
          return undefined;
      }
  }
};

const Diagram = ({ org }: { org: string }) => {
  const [play,  { stop }] = useSound("/assets/alarm.wav", {
    soundEnabled: true,
  });

  const { isAdmin, serverLogs, confirmAlarm } = useContext(AuthContext);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [model, setModel] = useState<Model>({
    graph: DEFAULT_GRAPH,
    nodes: [],
    edges: [],
  });



  const [open, setOpen] = useState(false);
  // const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [caption, setCaption] = useState("");

  const {
    error,
    loading,
    data: diagram,
  } = useQuery(READ_DIAGRAM, {
    variables: { org: org, status: true },
    fetchPolicy: "network-only",
  });

  const [getIPTitle] = useLazyQuery(READ_IP);

  const updateCaption = async (caption: string) => {
    if (!model.nodes) return;
    const currentNodes = [...model.nodes];
    const index = currentNodes.findIndex((item) => item.id === selectedIds[0]);

    const result = await getIPTitle({
      variables: { ip: caption },
    });
    const ipTitle = result.data.getIPTitle;

    currentNodes[index].label = ipTitle === "" ? caption : ipTitle;
    currentNodes[index].data.ipAddress = caption;

    setModel({ ...model, nodes: [...currentNodes] });
    setCaption(caption);
  };

  useEffect(()=>{
  setTimeout(() => {
    play();
  }, 400);
  },[])

  const getNode = (nodeId: string) => {
    if (!model.nodes) return null;
    const index = model.nodes.findIndex((item) => item.id === nodeId);
    if (index === -1) return null;

    return model.nodes[index];
  };

  const ServerSideBar = () => {
    const node = getNode(selectedIds[0]) as NodeModel | null;
    if (!node) {
      return null;
    }

    const onClose = () => {
      setSelectedIds([]);
      confirmAlarm(node.data.ipAddress);
    };

    if (node.data?.icon?.displayName === "ClusterIcon")
      return (
        <TopologySideBar
          className="topology-example-sidebar"
          show={selectedIds.length > 0}
          onClose={onClose}
        >
          <DiagramSideBar node={node} />
        </TopologySideBar>
      );
    else return null;
  };

  const controller = useMemo(() => {
    const newController = new Visualization();

    newController.registerLayoutFactory(customLayoutFactory);
    newController.registerComponentFactory(customComponentFactory);

    newController.addEventListener(SELECTION_EVENT, setSelectedIds);


    newController.fromModel(model, true);

    return newController;
  }, []);

  useEffect(() => {
    if (!_.isEmpty(model)) {
      controller.fromModel(model, true);
    }
  }, [JSON.stringify(model.edges), JSON.stringify(model.nodes)]);

  useEffect(() => {
    if (error) {
      setModel({ graph: DEFAULT_GRAPH, nodes: [], edges: [] });
    } else {
      if (!_.isEmpty(diagram)) {
        const { graph, edges } = diagram.readDiagram;

        const refactoredNodes = async () => {
          const { nodes } = diagram.readDiagram;
          let newNodes: NodeModel[] = [];
          for (const item of nodes) {
            const result = await getIPTitle({
              variables: { ip: item.data.ipAddress },
            });
            const ipTitle = result.data.getIPTitle;
            newNodes = [
              ...newNodes,
              {
                ...item,
                label: ipTitle === "" ? item.data.ipAddress : ipTitle,
                data: {
                  ...item.data,
                  icon: item.data.icon,
                  isRoot: item.data.isRoot || false,
                },
              },
            ];
          }
          return newNodes;
        };

        refactoredNodes().then((nodeResult) => {
          const updatedNodes = [...nodeResult];
          serverLogs.forEach((serverLog) => {
            const {
              IP,
              SERVER,
              IPTABLES,
              CPU,
              RAM,
              HARD_HOME,
              HARD_ROOT,
              HARD_LOG,
              FS,
              NIS,
              isAlarm,
              confirmed,
            } = serverLog;

            const index = updatedNodes.findIndex(
              (item) => item.data.ipAddress === IP
            );

            if (index !== -1) {
              updatedNodes[index].data.SERVER = SERVER;
              updatedNodes[index].data.IPTABLES = IPTABLES;
              updatedNodes[index].data.CPU = CPU;
              updatedNodes[index].data.RAM = RAM;
              updatedNodes[index].data.HARD_HOME = HARD_HOME;
              updatedNodes[index].data.HARD_ROOT = HARD_ROOT;
              updatedNodes[index].data.HARD_LOG = HARD_LOG;
              updatedNodes[index].data.FS = FS;
              updatedNodes[index].data.NIS = NIS;

              updatedNodes[index].status =
                isAlarm && confirmed === false
                  ? NodeStatus.warning
                  : NodeStatus.default;
            }
          });

          setModel({ graph, edges, nodes: [...updatedNodes] });
        });
      } else {
        setModel({ graph: DEFAULT_GRAPH, nodes: [], edges: [] });
      }
    }
  }, [diagram, error]);

  useEffect(() => {
    if (!model.nodes) return;

    const updatedNodes = [...model.nodes];
    serverLogs.forEach((serverLog) => {
      const {
        IP,
        SERVER,
        IPTABLES,
        CPU,
        RAM,
        HARD_HOME,
        HARD_ROOT,
        HARD_LOG,
        FS,
        NIS,
        isAlarm,
        confirmed,
      } = serverLog;

      if (!model.nodes) return;
      const index = model.nodes.findIndex(
        (item) => item.data?.ipAddress === IP
      );
      if (index !== -1) {
        updatedNodes[index].data.SERVER = SERVER;
        updatedNodes[index].data.IPTABLES = IPTABLES;
        updatedNodes[index].data.CPU = CPU;
        updatedNodes[index].data.RAM = RAM;
        updatedNodes[index].data.HARD_HOME = HARD_HOME;
        updatedNodes[index].data.HARD_ROOT = HARD_ROOT;
        updatedNodes[index].data.HARD_LOG = HARD_LOG;
        updatedNodes[index].data.FS = FS;
        updatedNodes[index].data.NIS = NIS;

        updatedNodes[index].status =
          isAlarm && confirmed === false
            ? NodeStatus.warning
            : NodeStatus.default;
      }
    });
    setModel({ ...model, nodes: updatedNodes });
  }, [JSON.stringify(serverLogs)]);

  if (loading) return <Loading />;

  return (
    <TopologyView
      className="h-full"
      sideBar={isAdmin ? null : <ServerSideBar />}
    >
      <VisualizationProvider controller={controller}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Address</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="name"
                  placeholder="Add Address"
                  value={caption}
                  onChange={(evt) => updateCaption(evt.target.value)}
                  className="col-span-3"
                />
                <Button onClick={handleClose}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <VisualizationSurface state={{ selectedIds }} />
      </VisualizationProvider>
    </TopologyView>
  );
};

export default Diagram;
