import { gql } from "@apollo/client";

// Query to get server nodes
export const GET_SERVER_NODES = gql`
  query GetServerNodes {
    getServerNodes {
      branch
      department
      port
      server_name
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
