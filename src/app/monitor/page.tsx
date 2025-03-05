"use client";
import { useState, useEffect } from "react";
import { RefreshCw, Search } from "lucide-react";
import PageLayout from "../../components/PageLayout";
import StatusIndicator from "../../components/StatusIndicator";
import { cn } from "../../lib/utils";

// Mock data for the real-time monitoring table
interface ServerData {
  id: number;
  department: string;
  serverName: string;
  ipAddress: string;
  status: "online" | "offline" | "warning";
  lastUpdated: string;
  uptime: string;
  cpu: number;
  memory: number;
}

const generateMockData = (): ServerData[] => {
  const departments = [
    "IT Operations",
    "Human Resources",
    "Finance",
    "Marketing",
    "Sales",
    "Customer Support",
    "Research & Development",
    "Legal",
    "Executive",
  ];

  return Array.from({ length: 15 }, (_, i) => {
    const statusOptions: ("online" | "offline" | "warning")[] = [
      "online",
      "offline",
      "warning",
    ];
    const randomStatus =
      statusOptions[Math.floor(Math.random() * (i > 12 ? 3 : 2))]; // More online servers
    const cpu =
      randomStatus === "online"
        ? Math.floor(Math.random() * 60) + 5
        : randomStatus === "warning"
        ? Math.floor(Math.random() * 30) + 60
        : 0;
    const memory =
      randomStatus === "online"
        ? Math.floor(Math.random() * 50) + 10
        : randomStatus === "warning"
        ? Math.floor(Math.random() * 30) + 60
        : 0;

    return {
      id: i + 1,
      department: departments[i % departments.length],
      serverName: `SRV-${(i + 1).toString().padStart(3, "0")}`,
      ipAddress: `192.168.${Math.floor(i / 10) + 1}.${(i % 10) + 1}`,
      status: randomStatus,
      lastUpdated: new Date(
        Date.now() - Math.floor(Math.random() * 60000)
      ).toLocaleTimeString(),
      uptime: `${Math.floor(Math.random() * 100) + 1}d ${Math.floor(
        Math.random() * 24
      )}h`,
      cpu,
      memory,
    };
  });
};

export default function Monitor() {
  const [serverData, setServerData] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800));
      setServerData(generateMockData());
      setLoading(false);
    };

    fetchData();

    // Set up real-time updates
    const intervalId = setInterval(() => {
      // setRefreshCount((prev) => prev + 1);
      // Update a random server's status/metrics for real-time effect
      setServerData((prevData) => {
        const newData = [...prevData];
        const randomIndex = Math.floor(Math.random() * newData.length);
        const randomServer = { ...newData[randomIndex] };

        randomServer.lastUpdated = new Date().toLocaleTimeString();
        randomServer.cpu = Math.min(
          100,
          randomServer.cpu + (Math.random() > 0.5 ? 5 : -5)
        );
        randomServer.memory = Math.min(
          100,
          randomServer.memory + (Math.random() > 0.5 ? 3 : -3)
        );

        // Sometimes change status
        if (Math.random() > 0.8) {
          if (randomServer.cpu > 80) {
            randomServer.status = "warning";
          } else if (randomServer.cpu < 5) {
            randomServer.status = "offline";
          } else {
            randomServer.status = "online";
          }
        }

        newData[randomIndex] = randomServer;
        return newData;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredData = serverData.filter(
    (server) =>
      server.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.serverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.ipAddress.includes(searchTerm)
  );

  const handleRefresh = () => {
    // setRefreshCount((prev) => prev + 1);
    setServerData(generateMockData());
  };

  return (
    <PageLayout
      title="Infrastructure Monitor"
      subtitle="Real-time status and performance metrics for your network infrastructure"
    >
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            className="pl-10 py-2 pr-4 bg-background border rounded-lg w-full sm:w-80 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search by department, server or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-foreground"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <span>
            Last updated:{" "}
            <span className="font-medium text-foreground">
              {new Date().toLocaleTimeString()}
            </span>
          </span>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Department</th>
                <th>Server</th>
                <th>IP Address</th>
                <th>CPU</th>
                <th>Memory</th>
                <th>Uptime</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="py-4">
                      <div className="h-5 w-20 bg-muted rounded"></div>
                    </td>
                    <td>
                      <div className="h-5 w-32 bg-muted rounded"></div>
                    </td>
                    <td>
                      <div className="h-5 w-24 bg-muted rounded"></div>
                    </td>
                    <td>
                      <div className="h-5 w-28 bg-muted rounded"></div>
                    </td>
                    <td>
                      <div className="h-5 w-20 bg-muted rounded"></div>
                    </td>
                    <td>
                      <div className="h-5 w-20 bg-muted rounded"></div>
                    </td>
                    <td>
                      <div className="h-5 w-24 bg-muted rounded"></div>
                    </td>
                    <td>
                      <div className="h-5 w-24 bg-muted rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No servers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredData.map((server) => (
                  <tr
                    key={server.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td>
                      <StatusIndicator status={server.status} />
                    </td>
                    <td>{server.department}</td>
                    <td className="font-medium">{server.serverName}</td>
                    <td>{server.ipAddress}</td>
                    <td>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              server.cpu > 80
                                ? "bg-red-500"
                                : server.cpu > 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            )}
                            style={{ width: `${server.cpu}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm">{server.cpu}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              server.memory > 80
                                ? "bg-red-500"
                                : server.memory > 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            )}
                            style={{ width: `${server.memory}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm">{server.memory}%</span>
                      </div>
                    </td>
                    <td>{server.uptime}</td>
                    <td>{server.lastUpdated}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
