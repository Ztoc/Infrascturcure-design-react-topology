"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Download,
  Upload,
  Eye,
  EyeOff,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import { cn } from "@/lib/utils";

// Mock data for the infrastructure table
interface InfrastructureItem {
  id: string;
  department: string;
  description: string;
  type: "server" | "switch" | "router" | "firewall";
  location: string;
  ipAddress: string;
  macAddress: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installDate: string;
  lastMaintenance: string;
  status: "active" | "inactive" | "maintenance";
}

// Column definition
interface Column {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

const initialColumns: Column[] = [
  { id: "department", name: "Department", visible: true, order: 0 },
  { id: "description", name: "Description", visible: true, order: 1 },
  { id: "type", name: "Type", visible: true, order: 2 },
  { id: "location", name: "Location", visible: true, order: 3 },
  { id: "ipAddress", name: "IP Address", visible: true, order: 4 },
  { id: "macAddress", name: "MAC Address", visible: false, order: 5 },
  { id: "manufacturer", name: "Manufacturer", visible: false, order: 6 },
  { id: "model", name: "Model", visible: true, order: 7 },
  { id: "serialNumber", name: "Serial Number", visible: false, order: 8 },
  { id: "installDate", name: "Install Date", visible: true, order: 9 },
  {
    id: "lastMaintenance",
    name: "Last Maintenance",
    visible: false,
    order: 10,
  },
  { id: "status", name: "Status", visible: true, order: 11 },
];

// Mock data generator
const generateMockData = (): InfrastructureItem[] => {
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

  const types: InfrastructureItem["type"][] = [
    "server",
    "switch",
    "router",
    "firewall",
  ];
  const locations = [
    "HQ Floor 1",
    "HQ Floor 2",
    "HQ Floor 3",
    "East Branch",
    "West Branch",
    "Data Center A",
    "Data Center B",
  ];
  const manufacturers = [
    "Cisco",
    "Dell",
    "HP",
    "Juniper",
    "Fortinet",
    "Palo Alto Networks",
  ];
  const statuses: InfrastructureItem["status"][] = [
    "active",
    "inactive",
    "maintenance",
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const manufacturer =
      manufacturers[Math.floor(Math.random() * manufacturers.length)];

    return {
      id: `INF-${(i + 1).toString().padStart(3, "0")}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} for ${
        departments[Math.floor(Math.random() * departments.length)]
      }`,
      type,
      location: locations[Math.floor(Math.random() * locations.length)],
      ipAddress: `192.168.${Math.floor(Math.random() * 254) + 1}.${
        Math.floor(Math.random() * 254) + 1
      }`,
      macAddress: Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0")
      ).join(":"),
      manufacturer,
      model: `${manufacturer} ${type.charAt(0).toUpperCase()}${type.slice(
        1
      )}-${Math.floor(Math.random() * 1000)}`,
      serialNumber: Array.from({ length: 10 }, () =>
        Math.floor(Math.random() * 36)
          .toString(36)
          .toUpperCase()
      ).join(""),
      installDate: new Date(
        Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365 * 3)
      ).toLocaleDateString(),
      lastMaintenance: new Date(
        Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 90)
      ).toLocaleDateString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
};

export default function CustomTable() {
  const [infraData, setInfraData] = useState<InfrastructureItem[]>([]);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [loading, setLoading] = useState(true);
  const [showColumnCustomization, setShowColumnCustomization] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "ascending" | "descending";
  }>({
    key: null,
    direction: "ascending",
  });

  // Dragged column state
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setInfraData(generateMockData());
      setLoading(false);
    };

    loadData();
  }, []);

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Handle column drag start
  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };

  // Handle column drag over
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  // Handle column drop
  const handleDrop = (targetColumnId: string) => {
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    // Reorder columns
    const orderedColumns = [...columns].sort((a, b) => a.order - b.order);
    const sourceIndex = orderedColumns.findIndex(
      (col) => col.id === draggedColumn
    );
    const targetIndex = orderedColumns.findIndex(
      (col) => col.id === targetColumnId
    );

    if (sourceIndex < 0 || targetIndex < 0) return;

    // Remove source column
    const [removed] = orderedColumns.splice(sourceIndex, 1);
    // Insert at target position
    orderedColumns.splice(targetIndex, 0, removed);

    // Update order values
    const updatedColumns = orderedColumns.map((col, index) => ({
      ...col,
      order: index,
    }));

    setColumns(updatedColumns);
    setDraggedColumn(null);
    setDragOverColumn(null);
    toast.success("Column order updated");
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // Filter data based on search term
  const filteredData = infraData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data
  const sortedData = [...filteredData].sort((a: any, b: any) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Handle column sort
  const handleSort = (columnId: string) => {
    setSortConfig({
      key: columnId,
      direction:
        sortConfig.key === columnId && sortConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    });
  };

  // Save column configuration
  const saveColumnConfig = () => {
    setShowColumnCustomization(false);
    toast.success("Table configuration saved");
    // In a real app, this would save to a backend or local storage
  };

  // Reset column configuration
  const resetColumnConfig = () => {
    setColumns(initialColumns);
    toast.success("Table configuration reset to default");
  };

  // Get visible columns in the correct order
  const visibleColumns = [...columns]
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <PageLayout
      title="Customizable Infrastructure Table"
      subtitle="View and configure your infrastructure data with customizable columns"
    >
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <input
            type="text"
            className="py-2 px-4 bg-background border rounded-lg w-full sm:w-80 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search infrastructure..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColumnCustomization(!showColumnCustomization)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Settings size={16} />
            <span>Customize Columns</span>
          </button>

          <button
            onClick={() => toast.success("Table data exported successfully")}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Column customization panel */}
      {showColumnCustomization && (
        <div className="mb-6 glass-card rounded-xl p-4 animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Customize Table Columns</h3>
            <div className="flex gap-2">
              <button
                onClick={resetColumnConfig}
                className="text-sm px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={saveColumnConfig}
                className="text-sm px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {columns
              .sort((a, b) => a.order - b.order)
              .map((column) => (
                <div
                  key={column.id}
                  className={cn(
                    "flex items-center p-2 rounded-lg border",
                    draggedColumn === column.id
                      ? "border-primary bg-primary/5"
                      : "border-border",
                    dragOverColumn === column.id ? "border-dashed" : ""
                  )}
                  draggable
                  onDragStart={() => handleDragStart(column.id)}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDrop={() => handleDrop(column.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="cursor-grab text-muted-foreground">
                    <GripVertical size={16} />
                  </div>
                  <div className="ml-2 flex-1">{column.name}</div>
                  <button
                    onClick={() => toggleColumnVisibility(column.id)}
                    className={cn(
                      "p-1 rounded-md transition-colors",
                      column.visible
                        ? "text-primary hover:bg-primary/10"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {column.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.id}
                    className="relative cursor-pointer select-none"
                    onClick={() => handleSort(column.id)}
                  >
                    <div className="flex items-center">
                      <span>{column.name}</span>
                      {sortConfig.key === column.id && (
                        <span className="ml-1">
                          {sortConfig.direction === "ascending" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    {visibleColumns.map((column) => (
                      <td key={column.id}>
                        <div className="h-5 bg-muted rounded w-full max-w-[120px]"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No infrastructure items found matching your search.
                  </td>
                </tr>
              ) : (
                sortedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {visibleColumns.map((column) => (
                      <td key={column.id}>
                        {column.id === "status" ? (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              {
                                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300":
                                  item.status === "active",
                                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300":
                                  item.status === "inactive",
                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300":
                                  item.status === "maintenance",
                              }
                            )}
                          >
                            {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                          </span>
                        ) : (
                          (item as any)[column.id]
                        )}
                      </td>
                    ))}
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
