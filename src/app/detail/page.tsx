"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import PageLayout from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import {
  APPLY_CHANGES,
  CUSTOMIZE_COLUMNS,
  NO_DATA_FOUND,
  RESET,
} from "@/consts";
import { Column } from "@/type";
import { useMutation, useQuery } from "@apollo/client";
import { GET_COLUMN_SETTING, GET_LOGS, SAVE_COLUMN_SETTING } from "@/query";
import Loading from "@/components/Loading";

interface ILogItem {
  id: number;
  AverageByte: number;
  Device: string;
  IPv4_Dst: string;
  MACDst: string;
  MACProto: string;
  MACSrc: string;
  TCP_ACK: number;
  TCP_FIN: number;
  TCP_PSH: number;
  TCP_Port_Dst: number;
  TCP_Port_Src: number;
  TCP_RST: number;
  TCP_SACK: number;
  TCP_SYN: number;
  TS: string;
  TotalByte: number;
  TotalPkt: number;
  capturename: string;
  hash: string;
  uid: string;
  IndexPattern: string;
  AttackType: string;
  AttackLevel: string;
  Agency: string;
  createdAt: string;
  updatedAt: string;
}

const initialColumns: Column[] = [
  { id: "AverageByte", name: "AverageByte", visible: true, order: 1 },
  { id: "Device", name: "Device", visible: true, order: 2 },
  { id: "IPv4_Dst", name: "IPv4_Dst", visible: true, order: 3 },
  { id: "MACDst", name: "MACDst", visible: true, order: 4 },
  { id: "MACProto", name: "MACProto", visible: true, order: 5 },
  { id: "MACSrc", name: "MACSrc", visible: true, order: 6 },
  { id: "TCP_ACK", name: "TCP_ACK", visible: false, order: 7 },
  { id: "TCP_FIN", name: "TCP_FIN", visible: false, order: 8 },
  { id: "TCP_PSH", name: "TCP_PSH", visible: false, order: 9 },
  { id: "TCP_Port_Dst", name: "TCP_Port_Dst", visible: true, order: 10 },
  { id: "TCP_Port_Src", name: "TCP_Port_Src", visible: true, order: 11 },
  { id: "TCP_RST", name: "TCP_RST", visible: false, order: 12 },
  { id: "TCP_SACK", name: "TCP_SACK", visible: false, order: 13 },
  { id: "TCP_SYN", name: "TCP_SYN", visible: false, order: 14 },
  { id: "TS", name: "TS", visible: true, order: 15 },
  { id: "TotalByte", name: "TotalByte", visible: true, order: 16 },
  { id: "TotalPkt", name: "TotalPkt", visible: true, order: 17 },
  { id: "capturename", name: "capturename", visible: true, order: 18 },
  { id: "hash", name: "hash", visible: false, order: 19 },
  { id: "uid", name: "uid", visible: true, order: 20 },
  { id: "IndexPattern", name: "IndexPattern", visible: true, order: 21 },
  { id: "AttackType", name: "AttackType", visible: true, order: 22 },
  { id: "AttackLevel", name: "AttackLevel", visible: true, order: 23 },
  { id: "Agency", name: "Agency", visible: true, order: 24 },
  { id: "createdAt", name: "createdAt", visible: true, order: 25 },
];

const DetailPage = () => {
  const [infraData, setInfraData] = useState<ILogItem[]>([]);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [saveColumnSetting] = useMutation(SAVE_COLUMN_SETTING);

  const { data: columnSetting, loading: columnLoading } = useQuery(
    GET_COLUMN_SETTING,
    {
      variables: { name: "log" },
    }
  );

  const { data: logData, loading } = useQuery(GET_LOGS);

  console.log(logData);

  useEffect(() => {
    if (columnSetting) {
      setColumns(columnSetting.getColumnSetting);
    }
  }, [columnSetting]);

  useEffect(() => {
    if (logData?.getLogs?.length > 0) {
      setInfraData(logData.getLogs);
    }
  }, [loading]);

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
  const sortedData = [...filteredData].sort((a: ILogItem, b: ILogItem) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key as keyof ILogItem];
    const bValue = b[sortConfig.key as keyof ILogItem];

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

    saveColumnSetting({
      variables: {
        columnConfig: {
          name: "log",
          columnSetting: columns,
        },
      },
    })
      .then(() => {
        toast.success("Table configuration saved");
      })
      .catch((error) => {
        toast.error("Failed to save table configuration");
      });
  };

  // Reset column configuration
  const resetColumnConfig = () => {
    setColumns(columnSetting.getColumnSetting);
    toast.success("Table configuration reset to default");
  };

  // Get visible columns in the correct order
  const visibleColumns = [...columns]
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <PageLayout
      title="Detail page"
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
            <span>{CUSTOMIZE_COLUMNS}</span>
          </button>
        </div>
      </div>

      {/* Column customization panel */}
      {showColumnCustomization && (
        <div className="mb-6 glass-card rounded-xl p-4 animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">{CUSTOMIZE_COLUMNS}</h3>
            <div className="flex gap-2">
              <button
                onClick={resetColumnConfig}
                className="text-sm px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {RESET}
              </button>
              <button
                onClick={saveColumnConfig}
                className="text-sm px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                {APPLY_CHANGES}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[...columns]
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

      {!columnLoading ? (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr className="bg-muted/50 dark:bg-muted/20">
                   <th>No</th>
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
                      {NO_DATA_FOUND}
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item,index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/20 transition-colors odd:bg-background even:bg-muted/50"
                    >
                      <td>
                        {index+1}
                      </td>
                      {visibleColumns.map((column) => (
                        <td key={column.id}>
                          {column.id === "AttackLevel" ? (
                           <span
                           className={cn(
                             "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                             {
                               "bg-amber-500 text-amber-100 dark:bg-amber-600 dark:text-amber-300": item.AttackLevel === "Warning", 
                               "bg-red-500 text-white dark:bg-red-600 dark:text-red-300": item.AttackLevel === "Critical", 
                               "bg-orange-500 text-white dark:bg-orange-600 dark:text-orange-300": item.AttackLevel === "Danger",
                               "bg-gray-500 text-white dark:bg-gray-600 dark:text-gray-300": item.AttackLevel === "Normal", 
                             }
                           )}
                         >
                           {item.AttackLevel}
                         </span>
                         
                          ) : column.id === "createdAt" ? (
                            <span>
                              {new Date(
                                Number(item.createdAt)
                              ).toLocaleString()}{" "}
                            </span>
                          ) : (
                            item[column.id as keyof ILogItem]
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
      ) : (
        <Loading />
      )}
    </PageLayout>
  );
};

export default DetailPage;
