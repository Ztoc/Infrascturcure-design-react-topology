import { useLazyQuery, useQuery } from "@apollo/client";
import { createContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useInterval } from "react-use";
import useSound from "use-sound";

import { READ_DIAGRAM, READ_IP } from "@/app/structure/Diagram";

const SECURITY_STORAGE_ITEM = "total-security";

type Props = {
  children?: ReactNode;
};

type ServerLog = {
  IP: string;
  SERVER: string;
  IPTABLES: string;
  CPU: string;
  RAM: string;
  HARD_HOME: string;
  HARD_ROOT: string;
  HARD_LOG: string;
  FS: {
    success: string;
    time: string;
  };
  NIS: {
    success: string;
    time: string;
  };
  confirmed: boolean;
  isAlarm: boolean;
  errorMsgs: string;
};

// Define the type for alarms
type Alarm = {
  alarmType: string; // Add other properties as needed
};

// Define the type for nodes (adjust according to your actual node structure)
type NodeType = {
  // Define properties of the node here
};

type IAuthContext = {
  speedLog: { alarms: Alarm[] };
  serverLogs: ServerLog[];
  alarmAreas: String[];
  authenticated: boolean;
  isAdmin: boolean;
  setAuthenticated: (newState: boolean) => void;
  setAdmin: (newState: boolean) => void;
  signOut: () => void;
  confirmAlarm: (ipAddress: string) => void;
  setAlarmAreas: (newAreas: string[]) => void;
  checkSitesAlarm: () => boolean;
};

const initialValue = {
  authenticated: false,
  speedLog: { alarms: [] as Alarm[] },
  serverLogs: [],
  alarmAreas: [],
  isAdmin: false,
  setAuthenticated: () => {},
  setAdmin: () => {},
  signOut: () => {},
  setSpeedLog: () => {},
  setServerLogs: () => {},
  confirmAlarm: () => {},
  setAlarmAreas: () => {},
  checkSitesAlarm: () => {
    return true;
  },
};

const AuthContext = createContext<IAuthContext>(initialValue);

const AuthProvider = ({ children }: Props) => {
  const [getIPTitle] = useLazyQuery(READ_IP);

  const [play, { stop }] = useSound("assets/alarm.wav", {
    soundEnabled: true,
  });
  const router = useRouter();
  const location = usePathname();
  const {
    error,
    loading: sitesLoading,
    data: sitesData,
    refetch,
  } = useQuery(READ_DIAGRAM, {
    variables: { org: "sites" },
    fetchPolicy: "no-cache",
  });

  //Initializing an auth state with false value (unauthenticated)
  const [authenticated, setAuthenticated] = useState(
    initialValue.authenticated
  );
  const [isAdmin, setAdmin] = useState(initialValue.isAdmin);
  const [speedLog, setSpeedLog] = useState(initialValue.speedLog);
  const [serverLogs, setServerLogs] = useState<ServerLog[]>(
    initialValue.serverLogs
  );
  const [alarmAreas, setAlarmAreas] = useState<string[]>(
    initialValue.alarmAreas
  );
  const [nodes, setNodes] = useState<NodeType[]>([]);

  console.log("serverLogs", serverLogs);

  const signOut = () => {
    localStorage.removeItem(SECURITY_STORAGE_ITEM);
  };

  const confirmAlarm = (ipAddress: string) => {
    const index = serverLogs.findIndex((item) => item.IP === ipAddress);
    if (index !== -1) {
      const updatedServerLogs = [...serverLogs];
      if (
        typeof updatedServerLogs[index] === "object" &&
        updatedServerLogs[index] !== null
      ) {
        updatedServerLogs[index] = {
          ...updatedServerLogs[index],
          confirmed: true,
        };
      }

      console.log("confirm", ipAddress);

      setServerLogs([...updatedServerLogs]);
    }
  };

  const addAlarmArea = (area: string, isAlarm: boolean) => {
    if (isAlarm) {
      const includesAlarmArea = alarmAreas.includes(area);
      if (includesAlarmArea === false) {
        setAlarmAreas([...alarmAreas, area]);
      }
    } else {
      const updatedAlarms = alarmAreas.filter((item) => item !== area);
      setAlarmAreas([...updatedAlarms]);
    }
  };

  const checkSitesAlarm = () => {
    const alarmStatus: boolean = serverLogs.some((item) => {
      const index = nodes.findIndex(
        (node: any) => node.data.ipAddress === item.IP
      );

      if (index === -1) {
        return false;
      } else {
        return item.isAlarm === true && item.confirmed === false;
      }
    });
    console.log("result", alarmStatus);

    return alarmStatus;
  };

  useEffect(() => {
    if (!authenticated) {
      router.push("/sign-in");
    } else {
      localStorage.setItem(
        SECURITY_STORAGE_ITEM,
        JSON.stringify({
          loggedIn: true,
          isAdmin: isAdmin,
        })
      );
    }
  }, [authenticated]);

  useEffect(() => {
    const alarmCount = speedLog.alarms.filter(
      (router) => router.alarmType === "0"
    ).length;
    console.log(alarmCount);

    if (alarmCount === 3) {
      stop();
    } else if (alarmCount > 0) {
      stop();
      play();
    }
  }, [JSON.stringify(speedLog.alarms)]);

  useInterval(() => {
    const alarmCount = speedLog.alarms.filter(
      (router) => router.alarmType === "0"
    ).length;

    if (alarmCount === 3) {
      stop();
    } else if (alarmCount > 0) {
      stop();
      play();
    }
  }, 10000);

  useEffect(() => {
    const storageData = localStorage.getItem(SECURITY_STORAGE_ITEM);
    if (storageData) {
      const { loggedIn, isAdmin } = JSON.parse(storageData);

      if (loggedIn) {
        setAuthenticated(true);
        setAdmin(isAdmin);
        router.push(location);
      } else {
        setAuthenticated(false);
      }
    }
  }, []);

  useEffect(() => {
    if (sitesData) {
      setNodes([...sitesData.readDiagram.nodes]);
    }
  }, [sitesData]);

  return (
    <AuthContext.Provider
      value={{
        setAuthenticated,
        setAdmin,
        signOut,
        confirmAlarm,
        setAlarmAreas,
        isAdmin,
        authenticated,
        speedLog,
        serverLogs,
        alarmAreas,
        checkSitesAlarm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
