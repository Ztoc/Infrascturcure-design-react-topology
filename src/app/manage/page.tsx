"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
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

import { InfrastructureItem, Column } from "@/type";
import { GET_SERVER_NODES } from "../../query";
import { cn } from "@/lib/utils";
import {
  APPLY_CHANGES,
  CUSTOMIZE_COLUMNS,
  MANAGE_SERVER_NODES,
  NO_DATA_FOUND,
  RESET,
} from "@/consts";

const initialColumns: Column[] = [
  { id: "branch", name: "Branch", visible: true, order: 0 },
  { id: "department", name: "Department", visible: true, order: 1 },
  { id: "port", name: "Port", visible: true, order: 2 },
  { id: "server_name", name: "Server Name", visible: true, order: 3 },
];

const ManagePage = () => {
  const { data, loading } = useQuery(GET_SERVER_NODES);

  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const [showColumnCustomization, setShowColumnCustomization] = useState(false);
  const [infraData, setInfraData] = useState<InfrastructureItem[]>([]);
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
    if (data) {
      if (data?.getServerNodes) {
        setInfraData(data.getServerNodes);
      }
    }
  }, [data]);

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
  const sortedData = [...filteredData].sort(
    (a: InfrastructureItem, b: InfrastructureItem) => {
      if (!sortConfig.key) return 0;

      const aValue = a[sortConfig.key as keyof InfrastructureItem];
      const bValue = b[sortConfig.key as keyof InfrastructureItem];

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    }
  );

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
            <span>{CUSTOMIZE_COLUMNS}</span>
          </button>
        </div>
      </div>

      {/* Column customization panel */}
      {showColumnCustomization && (
        <div className="mb-6 glass-card rounded-xl p-4 animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">{MANAGE_SERVER_NODES}</h3>
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
              {sortedData.length === 0 ? (
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
                sortedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {visibleColumns.map((column) => (
                      <td key={column.id}>
                        {
                          (item as InfrastructureItem)[
                            column.id as keyof InfrastructureItem
                          ]
                        }
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
};

export default ManagePage;
