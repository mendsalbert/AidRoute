"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { aidRouteSimulation, type AuditRecord } from "@/lib/simulation";
import {
  Shield,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  DollarSign,
  Hash,
  Calendar,
  MapPin,
} from "lucide-react";

export function AuditView() {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "verified" | "pending" | "disputed"
  >("all");
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(
    null
  );

  useEffect(() => {
    setAuditRecords(aidRouteSimulation.getAuditRecords());

    const handleAuditUpdated = (updatedRecords: AuditRecord[]) => {
      setAuditRecords(updatedRecords);
    };

    aidRouteSimulation.on("audit-updated", handleAuditUpdated);

    return () => {
      aidRouteSimulation.off("audit-updated", handleAuditUpdated);
    };
  }, []);

  const filteredRecords = auditRecords.filter((record) => {
    const matchesSearch =
      !searchQuery ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.missionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.deliveryZone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: AuditRecord["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "disputed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: AuditRecord["status"]) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-500/10 border-green-500/20";
      case "pending":
        return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
      case "disputed":
        return "text-red-600 bg-red-500/10 border-red-500/20";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalFunds = filteredRecords.reduce(
    (sum, record) => sum + record.fundsSettled,
    0
  );
  const verifiedCount = filteredRecords.filter(
    (r) => r.status === "verified"
  ).length;
  const pendingCount = filteredRecords.filter(
    (r) => r.status === "pending"
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{filteredRecords.length}</p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{verifiedCount}</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalFunds)}</p>
              <p className="text-sm text-muted-foreground">Total Settled</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Audit Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
          {/* Search and Filters */}
          <div className="p-4 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by Mission ID, Audit ID, or Zone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">
                    Mission ID
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Zone</th>
                  <th className="text-left p-4 font-medium text-sm">Funds</th>
                  <th className="text-left p-4 font-medium text-sm">Status</th>
                  <th className="text-left p-4 font-medium text-sm">Date</th>
                  <th className="text-left p-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm">
                        {record.missionId.slice(-8)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{record.deliveryZone}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">
                        {formatCurrency(record.fundsSettled)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            getStatusColor(record.status)
                          )}
                        >
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {record.timestamp.toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="flex items-center gap-1 px-2 py-1 bg-secondary hover:bg-secondary/80 rounded text-sm transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No audit records found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Proof Details Panel */}
        <div className="bg-card border border-border rounded-xl p-6">
          {selectedRecord ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Proof Details</h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedRecord.status)}
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(selectedRecord.status)
                    )}
                  >
                    {selectedRecord.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Mission ID
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm bg-secondary px-2 py-1 rounded">
                      {selectedRecord.missionId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedRecord.missionId)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Delivery Zone
                  </label>
                  <p className="mt-1 font-medium">
                    {selectedRecord.deliveryZone}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Funds Settled
                  </label>
                  <p className="mt-1 text-lg font-bold text-green-600">
                    {formatCurrency(selectedRecord.fundsSettled)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Proof Hash
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs bg-secondary px-2 py-1 rounded break-all">
                      {selectedRecord.proofHash}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedRecord.proofHash)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Recipient Signature
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm bg-secondary px-2 py-1 rounded">
                      {selectedRecord.recipientSignature}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(selectedRecord.recipientSignature)
                      }
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Transaction ID
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm bg-secondary px-2 py-1 rounded">
                      {selectedRecord.transactionId}
                    </span>
                    <button className="p-1 hover:bg-secondary rounded transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Timestamp
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedRecord.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedRecord.status === "verified" && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Delivery Verified</span>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    This mission has been successfully completed with
                    cryptographic proof of delivery and recipient confirmation.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a record to view proof details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
