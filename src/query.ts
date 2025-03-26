import { gql } from "@apollo/client";

// Query to get server nodes
export const GET_SERVER_NODES = gql`
  query GetServerNodes {
    getServerNodes {
      Branch
      Department
      Port
      IPAddress
    }
  }
`;

export const GET_COLUMN_SETTING = gql`
  query getColumnSetting($name: String) {
    getColumnSetting(name: $name) {
      id
      name
      visible
      order
    }
  }
`;

export const GET_BRANCHES = gql`
  query GetBranches {
    getBranches {
      branch_name
      branch_id
    }
  }
`;

export const GET_LOGS = gql`
  query getLogs {
    getLogs {
        id
        AverageByte
        Device
        IPv4_Dst
        MACDst
        MACProto
        MACSrc
        TCP_ACK
        TCP_FIN
        TCP_PSH
        TCP_Port_Dst
        TCP_Port_Src
        TCP_RST
        TCP_SACK
        TCP_SYN
        TS
        TotalByte
        TotalPkt
        capturename
        hash
        uid
        IndexPattern
        AttackType
        AttackLevel
        Agency
        createdAt
        updatedAt
    }
  }
`;

export const GET_DIAGRAM_TITLE = gql`
  query getDiagramTitle($org: String) {
    getDiagramTitle(org: $org)
  }
`;

export const CHECK_PASSWORD = gql(`
	query CHECK_PASSWORD($id: String, $pwd: String){
	  checkPassword(id:$id, pwd:$pwd){
      isAdmin
      success
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

export const SAVE_DIAGRAM = gql`
  mutation saveDiagram($diagram: DiagramInput) {
    saveDiagram(diagram: $diagram)
  }
`;



export const SAVE_COLUMN_SETTING = gql`
  mutation saveColumnSetting($columnConfig: ColumnConfigInput) {
    saveColumnSetting(columnConfig: $columnConfig)
  }
`;

export const READ_IP = gql(`
  query GET_IP_TITLE($ip: String){
    getIPTitle(ip:$ip)
  } 
  `);

export const READ_DIAGRAM = gql(`
  query READ_DIAGRAM($org: String, $status: Boolean) {
    readDiagram(org:$org, status:$status){
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
          isRoot
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
