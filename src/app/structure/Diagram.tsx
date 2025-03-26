"use client";

import React, { FC, useEffect, useMemo, useState } from "react";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
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
  EdgeModel,
  EdgeStyle,
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
import _, { uniqueId } from "lodash";
import { useContext } from "react";
// import useSound from "use-sound";

import { AuthContext } from "@/context/AuthContext";
import DiagramTitle from "../monitor/DiagramTitle";
import DiagramSideBar from "./DiagramSideBar";
import Toolbar from "./Toolbar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ServerIcon from "@/components/icons/ServerIcon";
import DepartmentIcon from "@/components/icons/DepartmentIcon";
import BranchIcon from "@/components/icons/BranchIcon";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { READ_DIAGRAM, READ_IP, SAVE_DIAGRAM } from "@/query";
import { DrawItemType, IconType, CustomNodeProps, DataEdgeProps } from "@/type";

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

const getShape = (item: DrawItemType) => {
  switch (item) {
    case DrawItemType.ADD_SERVER:
      return NodeShape.circle;
    case DrawItemType.ADD_BRANCH:
      return NodeShape.rhombus;
    case DrawItemType.ADD_DEPARTMENT:
      return NodeShape.rect;
    default:
      return NodeShape.hexagon;
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

const NODE_DIAMETER = 75;
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
    console.log("data", data);
    if (data.isRoot || data.icon === "ServerIcon" || data.icon==="DepartmentIcon") {
      return;
    }
    router.push(`/structure?org=${id}`);
  };

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

const CustomEdge: FC<DataEdgeProps> = ({ element, ...rest }) => {
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
  // const [play, { stop }] = useSound("assets/alarm.wav", {
  //   soundEnabled: true,
  // });

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
    variables: { org: org },
    fetchPolicy: "network-only",
  });

  const [getIPTitle] = useLazyQuery(READ_IP);
  const [saveDiagram] = useMutation(SAVE_DIAGRAM);

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

  const dragFunc = (
    dragModel: BaseNode,
    dragEvent: DragEvent,
    operation: DragOperationType
  ) => {
    console.log("dragFunc", dragModel, dragEvent, operation);
    setModel(controller.toModel());
  };

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
    newController.addEventListener(DRAG_NODE_END_EVENT, dragFunc);

    newController.fromModel(model, true);

    return newController;
  }, []);

  const isInNodes = (id: string) => {
    return model.nodes ? model.nodes.some((item) => item.id === id) : false;
  };

  const getNewId = () => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${timestamp}-${randomSuffix}`;
  };

  const getIcon = (item: DrawItemType) => {
    switch (item) {
      case DrawItemType.ADD_BRANCH:
        return { title: "Branch", icon: "BranchIcon" };
      case DrawItemType.ADD_DEPARTMENT:
        return { title: "Department", icon: "DepartmentIcon" };
      case DrawItemType.ADD_SERVER:
        return { title: "Server", icon: "ServerIcon" };
      default:
        return undefined;
    }
  };

  const handleAdd = (item: DrawItemType) => {
    const selectedItems = selectedIds.filter((item) => isInNodes(item));

    switch (item) {
      case DrawItemType.ADD_SERVER:
      case DrawItemType.ADD_ROUTER:
      case DrawItemType.ADD_SWITCH:
      case DrawItemType.ADD_FIREWALL:
      case DrawItemType.ADD_BRANCH:
      case DrawItemType.ADD_DEPARTMENT:
        const nodeId = getNewId();
        const iconData = getIcon(item);
        if (!iconData) return;

        const { title, icon } = iconData;
        const shortId = nodeId.split("-")[0].slice(-4);
        const label = `${title}-${shortId}`;

        const newNode: NodeModel = {
          id: `node-${nodeId}`,
          label,
          shape: getShape(item),
          children: [],
          type: "node",
          width: NODE_DIAMETER,
          height: NODE_DIAMETER,
          data: {
            icon,
            ipAddress: label,
            isRoot: false,
          },
          x: 100,
          y: 100,
        };

        setModel({
          edges: model.edges || [],
          graph: model.graph || DEFAULT_GRAPH,
          nodes: [...(model.nodes || []), newNode],
        });

        break;
      case DrawItemType.RENAME:
        if (selectedIds.length === 0 || !model.nodes) return;

        const selectedNode = model.nodes.find(
          (item) => item.id === selectedIds[0]
        );
        if (!selectedNode || !selectedNode.data) return;

        setOpen(true);
        setCaption(selectedNode.data.ipAddress);
        break;
      case DrawItemType.CONNECT:
      case DrawItemType.CONNECT_BY_ISOLATOR:
        if (
          selectedItems.length < 2 ||
          !isInNodes(selectedItems[0]) ||
          !isInNodes(selectedItems[1])
        )
          return;

        const edgeId = `edge-${selectedItems[0]}-${selectedItems[1]}`;
        const edgeId1 = `edge-${selectedItems[0]}-${selectedItems[1]}`;
        const edgeId2 = `edge-${selectedItems[1]}-${selectedItems[0]}`;

        const edge: EdgeModel = {
          id: edgeId,
          type: "edge",
          source: selectedItems[0],
          target: selectedItems[1],
          edgeStyle:
            item === DrawItemType.CONNECT
              ? EdgeStyle.default
              : EdgeStyle.dashed,
          animationSpeed:
            item === DrawItemType.CONNECT
              ? EdgeAnimationSpeed.none
              : EdgeAnimationSpeed.slow,
          style: {
            strokeWidth: "2px",
          },
        };

        setModel({
          ...model,
          edges: [
            ...(model.edges || []).filter(
              (item) => item.id !== edgeId1 && item.id !== edgeId2
            ),
            edge,
          ],
          graph: DEFAULT_GRAPH,
        });
        break;

      case DrawItemType.DISCONNECT:
        if (selectedItems.length < 2 || !model.edges) return;

        const disconnectEdgeId1 = `edge-${selectedItems[0]}-${selectedItems[1]}`;
        const disconnectEdgeId2 = `edge-${selectedItems[1]}-${selectedItems[0]}`;

        const indexToRemove = model.edges.findIndex(
          (item) =>
            item.id === disconnectEdgeId1 || item.id === disconnectEdgeId2
        );

        if (indexToRemove !== -1) {
          const newEdges = [...model.edges];
          newEdges.splice(indexToRemove, 1);
          setModel({
            ...model,
            graph: DEFAULT_GRAPH,
            edges: [...newEdges],
          });
        }

        break;

      case DrawItemType.DELETE:
        if (!model.nodes || selectedItems.length === 0) return;

        const newNodes = model.nodes
          .map((item) => {
            if (item.type === "node") {
              return item;
            } else if (item.type === "group" && item.children) {
              const newChildren = item.children.filter(
                (el) => !selectedItems.includes(el)
              );

              return { ...item, children: [...newChildren] };
            }
            return item;
          })
          .filter((item) => item && !selectedItems.includes(item.id));

        const newEdges = (model.edges || []).filter(
          (item) =>
            !(
              (item.source && selectedItems.includes(item.source)) ||
              (item.target && selectedItems.includes(item.target))
            )
        );

        setModel({
          edges: newEdges,
          graph: DEFAULT_GRAPH,
          nodes: newNodes,
        });
        break;

      case DrawItemType.GROUP:
        if (selectedItems.length < 2) return;

        const id = selectedItems.reduce(
          (prev, cur, index) => (index > 0 ? prev + "-" + cur : cur),
          selectedItems[0]
        );
        const group: NodeModel = {
          id: id + "-" + uniqueId(),
          children: [...selectedItems],
          type: "group",
          group: true,
          label: id,
          style: {
            padding: 40,
          },
        };

        const currentNodes = [...(model.nodes || [])];
        currentNodes.push(group);

        setModel({
          ...model,
          nodes: currentNodes.filter(
            (item) => !(item.type === "group" && item.children?.length === 0)
          ),
        });
        break;
      case DrawItemType.SAVE_DIAGRAM:
        if (!model.graph || !model.nodes || !model.edges) return;



        saveDiagram({
          variables: {
            diagram: {
              organization: org,
              graph: {
                id: model.graph.id,
                layout: model.graph.layout,
                type: model.graph.layout,
              },
              nodes: model.nodes.map((item) => {
                const {
                  id,
                  label,
                  shape,
                  status,
                  width,
                  height,
                  x,
                  y,
                  data,
                  children,
                  group,
                  type,
                  style,
                } = item;

                return {
                  id,
                  label,
                  shape,
                  status,
                  width,
                  height,
                  x,
                  y,
                  data: {
                    badge: data?.badge,
                    icon:
                      data?.icon?.displayName ||
                      (typeof data?.icon === "string" ? data?.icon : ""),
                    ipAddress: data?.ipAddress,
                    isRoot: data?.isRoot || false,
                  },
                  children,
                  group,
                  type,
                  style,
                };
              }),
              edges: model.edges.map((item) => {
                const { id, source, target, type, edgeStyle } = item;

                return { id, source, target, type, edgeStyle };
              }),
            },
          },
        })
          .then(() => {
            toast.success("Diagram saved successfully", {
              position: "top-right",
              style: {
                background: "green",
                color: "white",
              },
            });
            console.log("Diagram saved successfully");
          })
          .catch((error) => {
            toast.error(`Failed to save diagram: ${error.message}`);
          });
        break;
      default:
        break;
    }
  };

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
      contextToolbar={
        isAdmin ? (
          <Toolbar org={org} onAdd={handleAdd} count={selectedIds.length} />
        ) : (
          <DiagramTitle org={org} />
        )
      }
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
