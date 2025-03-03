"use client";

import React from "react";

import Server from "../../assets/server.svg";
import Branch from "../../assets/branch.svg";
import Building from "../../assets/building.svg";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
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
import gql from "graphql-tag";
import _, { uniqueId } from "lodash";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import useSound from "use-sound";
import DiagramSideBar from "./DiagramSideBar";
import Toolbar, { DrawItemType, IconType } from "./Toolbar";
import { Organization } from "./page";
import DiagramTitle from "./DiagramTitle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";
import ServerIcon from "@/components/icons/ServerIcon";
import DepartmentIcon from "@/components/icons/DepartmentIcon";
import BranchIcon from "@/components/icons/BranchIcon";

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

const SAVE_DIAGRAM = gql`
  mutation saveDiagram($diagram: DiagramInput) {
    saveDiagram(diagram: $diagram)
  }
`;

export const READ_IP = gql(`
  query GET_IP_TITLE($ip: String){
    getIPTitle(ip:$ip)
  } 
  `);

export const READ_DIAGRAM = gql(`
  query READ_DIAGRAM($org: String) {
    readDiagram(org:$org){
      graph {
        id
        layout
        type
      }
      edges {
        id
        source
        target
        type
        edgeStyle
      }
      nodes {
        id
        label
        shape
        status
        width
        height
        x
        y
        data{
          badge
          icon
          ipAddress
        }
        children
        group
        type
        style {
          padding
        } 
      }
    }
  }
	`);

export const NEW_SERVER_LOG = gql`
  subscription newServerLog {
    newServerLog {
      IP
      IPTABLES
      CPU
      RAM
      HARD_HOME
      HARD_ROOT
      HARD_LOG
      FS {
        success
        time
      }
      NIS {
        success
        time
      }
    }
  }
`;

interface CustomNodeProps {
  element: Node;
}

interface DataEdgeProps {
  element: Edge;
}

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

const CustomNode: React.FC<
  CustomNodeProps & WithSelectionProps & WithDragNodeProps & WithDndDropProps
> = ({ element, selected, onSelect, ...rest }) => {
  const data = element.getData();

  const badgeColors =
    BadgeColors.find((badgeColor) => badgeColor.name === data.badge) ||
    BadgeColors[0];
  console.log(data.icon);
  return (
    <DefaultNode
      element={element}
      showStatusDecorator
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
    </DefaultNode>
  );
};

const CustomEdge: React.FC<DataEdgeProps> = ({ element, ...rest }) => (
  <DefaultEdge
    element={element}
    startTerminalType={EdgeTerminalType.none}
    endTerminalType={EdgeTerminalType.none}
    className="text-gray-400"
    {...rest}
  />
);

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

type DiagramProps = {
  organization: Organization;
};

const Diagram: React.FC<DiagramProps> = ({ organization }: DiagramProps) => {
  const [play, { stop }] = useSound("assets/alarm.wav", {
    soundEnabled: true,
  });

  const { isAdmin, serverLogs, confirmAlarm } = useContext(AuthContext);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [model, setModel] = React.useState<Model>({
    graph: DEFAULT_GRAPH,
    nodes: [],
    edges: [],
  });

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [caption, setCaption] = React.useState("");

  const {
    error,
    loading,
    data: diagram,
  } = useQuery(READ_DIAGRAM, {
    variables: { org: organization },
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

  const controller = React.useMemo(() => {
    const newController = new Visualization();
    newController.registerLayoutFactory(customLayoutFactory);
    newController.registerComponentFactory(customComponentFactory);

    newController.addEventListener(SELECTION_EVENT, setSelectedIds);
    newController.addEventListener(DRAG_NODE_END_EVENT, dragFunc);

    newController.fromModel(model, true);

    return newController;
  }, []);

  const isInEdges = (id: string) => {
    return model.edges ? model.edges.some((item) => item.id === id) : false;
  };

  const isInNodes = (id: string) => {
    return model.nodes ? model.nodes.some((item) => item.id === id) : false;
  };

  const getNewId = () => {
    const length = model.nodes ? model.nodes.length : 0;

    for (let i = 0; i < length; i++) {
      const nodeIndex = `node-` + i;
      const index: number = model.nodes
        ? model.nodes.findIndex((item) => item.id === nodeIndex)
        : -1;
      if (index === -1) {
        return i;
      }
    }

    return length;
  };

  const getIcon = (item: DrawItemType) => {
    switch (item) {
      case DrawItemType.ADD_BRANCH:
        return { title: "Branch", icon: Branch };
      case DrawItemType.ADD_DEPARTMENT:
        return { title: "Department", icon: Building };
      case DrawItemType.ADD_SERVER:
        return { title: "Server", icon: Server };
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
        const nodeId = getNewId();
        const iconData = getIcon(item);
        if (!iconData) return;

        const { title, icon } = iconData;
        const label = title + "-" + nodeId;

        const newNode: NodeModel = {
          id: `node-` + nodeId,
          label,
          shape: NodeShape.hexagon,
          children: [],
          type: "node",
          width: NODE_DIAMETER,
          height: NODE_DIAMETER,
          data: {
            icon,
            ipAddress: label,
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
          let newEdges = [...model.edges];
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
              organization,
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
                    icon: data?.icon?.displayName,
                    ipAddress: data?.ipAddress,
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
        });
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    if (!_.isEmpty(model)) {
      controller.fromModel(model, true);
    }
  }, [JSON.stringify(model.edges), JSON.stringify(model.nodes)]);

  React.useEffect(() => {
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
                  icon: getIconComponent(item.data.icon),
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

  React.useEffect(() => {
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

  if (loading) return <p>Loading...</p>;

  return (
    <TopologyView
      className="h-full"
      sideBar={isAdmin ? null : <ServerSideBar />}
      contextToolbar={
        isAdmin ? (
          <Toolbar
            org={organization}
            onAdd={handleAdd}
            count={selectedIds.length}
          />
        ) : (
          <DiagramTitle org={organization} />
        )
      }
    >
      <VisualizationProvider controller={controller}>
        <Dialog open={open} onClose={handleClose}>
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
