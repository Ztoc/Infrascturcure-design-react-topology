import { Edge, Node } from "@patternfly/react-topology";
import React from "react";

export type FormType = {
  email: string;
  password: string;
  remember?: boolean;
};

export type Tab = {
  name: string;
  path: string;
  icon: React.ReactNode;
  isDropdown?: boolean;
  dropdownItems?: {
    name: string;
    path: string;
  }[];
};

export type Branch = {
  branch_name: string;
  branch_id: string;
};

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

export interface InfrastructureItem {
  Branch: string;
  Department: string;
  Port: string;
  IPAddress: string;
}

export interface Column {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

export interface CustomNodeProps {
  element: Node;
}

export interface DataEdgeProps {
  element: Edge;
}

export type Log = {
  id: number;
  IPv4_Src: string;
  IPv4_Dst: string;
  IPv4_Proto: string;
  IPv4_Ttl: number;
  MACSrc: string;
  MACDst: string;
  MACProto: string;
  TS: number;
  hash: string;
  UDP_Port_Src: number;
  UDP_Port_Dst: number;
  TCP_Port_Src: number;
  TCP_Port_Dst: number;
  TotalPkt: number;
  TotalByte: number;
  capturename: string;
  ICMP_TYPE: string;
  ICMP_CODE: string;
  TCP_ACK: string;
  TCP_FIN: string;
  TCP_SACK: string;
  TCP_RST: string;
  TCP_SYN: string;
  TCP_PSH: string;
  AverageByte: string;
  ICMP_IPv4_Src: string;
  ICMP_IPv4_Dst: string;
  ICMP_IPv4_Ttl: number;
  ICMP_IP_EQ: string;
  Agency: string;
  Attacktype: string;
  AttackLevel: number;
  Indexpattern: string;
  created_at: Date;
  updated_at: Date;
};
