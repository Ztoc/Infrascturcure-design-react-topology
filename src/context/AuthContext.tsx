import { createContext, ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useSound from "use-sound";

export const SECURITY_STORAGE_ITEM = "total-security";

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
  id: string;
  data: {
    ipAddress: string;
    isAlarm: boolean;
    confirmed: boolean;
  };
};

type IAuthContext = {
  speedLog: { alarms: Alarm[] };
  serverLogs: ServerLog[];
  alarmAreas: string[];
  authenticated: boolean;
  isAdmin: boolean;
  user: string;
  setAuthenticated: (newState: boolean) => void;
  setAdmin: (newState: boolean) => void;
  setUser: (newState: string) => void;
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
  user: "",
  setAuthenticated: () => {},
  setAdmin: () => {},
  setUser: () => {},
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
  // const [getIPTitle] = useLazyQuery(READ_IP);

  // const [play, { stop }] = useSound("assets/alarm.wav", {
  //   soundEnabled: true,
  // });
  const router = useRouter();
  const location = usePathname();
  // const { data: sitesData } = useQuery(READ_DIAGRAM, {
  //   variables: { org: "all" },
  //   fetchPolicy: "no-cache",
  // });

  //Initializing an auth state with false value (unauthenticated)
  const [authenticated, setAuthenticated] = useState(
    initialValue.authenticated
  );
  const [isAdmin, setAdmin] = useState(initialValue.isAdmin);
  const [user, setUser] = useState(initialValue.user);
  const [speedLog] = useState(initialValue.speedLog);
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

      setServerLogs([...updatedServerLogs]);
    }
  };

  const checkSitesAlarm = () => {
    const alarmStatus: boolean = serverLogs.some((item) => {
      const index = nodes.findIndex(
        (node: NodeType) => node.data.ipAddress === item.IP
      );

      if (index === -1) {
        return false;
      } else {
        return item.isAlarm === true && item.confirmed === false;
      }
    });

    return alarmStatus;
  };

  useEffect(() => {
    if (!authenticated) {
      router.push("/login");
    } else {
      localStorage.setItem(
        SECURITY_STORAGE_ITEM,
        JSON.stringify({
          loggedIn: true,
          isAdmin: isAdmin,
          user: user,
        })
      );
    }
  }, [authenticated]);

  // useEffect(() => {
  //   const alarmCount = speedLog.alarms.filter(
  //     (router) => router.alarmType === "0"
  //   ).length;
  //   console.log(alarmCount);

  //   if (alarmCount === 3) {
  //     stop();
  //   } else if (alarmCount > 0) {
  //     stop();
  //     play();
  //   }
  // }, [JSON.stringify(speedLog.alarms)]);

  // useInterval(() => {
  //   const alarmCount = speedLog.alarms.filter(
  //     (router) => router.alarmType === "0"
  //   ).length;

  //   if (alarmCount === 3) {
  //     stop();
  //   } else if (alarmCount > 0) {
  //     stop();
  //     play();
  //   }
  // }, 10000);

  useEffect(() => {
    const storageData = localStorage.getItem(SECURITY_STORAGE_ITEM);
    if (storageData) {
      const { loggedIn, isAdmin, user } = JSON.parse(storageData);

      if (loggedIn) {
        setAuthenticated(true);
        setAdmin(isAdmin);
        setUser(user);
        router.push(location);
      } else {
        setAuthenticated(false);
      }
    }
  }, []);

  // useEffect(() => {
  //   if (sitesData) {
  //     setNodes([...sitesData.readDiagram.nodes]);
  //   }
  // }, [sitesData]);

  return (
    <AuthContext.Provider
      value={{
        setAuthenticated,
        setAdmin,
        signOut,
        confirmAlarm,
        setAlarmAreas,
        isAdmin,
        user,
        setUser,
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
