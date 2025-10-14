"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Shield,
  Eye,
  CheckCircle,
  Clock,
  Hash,
  User,
  ArrowUpRight,
} from "lucide-react";
import { AuditLog } from "@/lib/types";
import { generateMockAuditLogs } from "@/lib/data-simulation";

export default function AuditView() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(
    generateMockAuditLogs()
  );
  const [selectedMission, setSelectedMission] = useState<AuditLog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "verified" | "pending_verification"
  >("all");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.missionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.deliveryZone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalMissions: auditLogs.length,
    verifiedMissions: auditLogs.filter((log) => log.status === "verified")
      .length,
    totalFundsSettled: auditLogs.reduce(
      (sum, log) => sum + log.fundsSettled,
      0
    ),
    pendingVerification: auditLogs.filter(
      (log) => log.status === "pending_verification"
    ).length,
  };

  const getStatusColor = (status: AuditLog["status"]) => {
    switch (status) {
      case "verified":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "pending_verification":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: AuditLog["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />;
      case "pending_verification":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Portal</h1>
          <p className="text-slate-400 mt-1">
            Transparency tools and verification for all humanitarian
            transactions
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Trustless Transparency Active</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm font-medium">Total Missions</p>
          <p className="text-blue-400 text-2xl font-bold mt-1">
            {stats.totalMissions}
          </p>
        </div>
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm font-medium">Verified</p>
          <p className="text-green-400 text-2xl font-bold mt-1">
            {stats.verifiedMissions}
          </p>
        </div>
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm font-medium">Funds Settled</p>
          <p className="text-purple-400 text-2xl font-bold mt-1">
            ${stats.totalFundsSettled.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm font-medium">Pending</p>
          <p className="text-yellow-400 text-2xl font-bold mt-1">
            {stats.pendingVerification}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Log Table */}
        <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Audit Log</span>
            </h3>

            {/* Search and Filter Controls */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search missions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending_verification">Pending</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-2 text-slate-400 font-medium">
                    Mission ID
                  </th>
                  <th className="text-left py-3 px-2 text-slate-400 font-medium">
                    Delivery Zone
                  </th>
                  <th className="text-left py-3 px-2 text-slate-400 font-medium">
                    Funds Settled
                  </th>
                  <th className="text-left py-3 px-2 text-slate-400 font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 text-slate-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.missionId}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedMission(log)}
                  >
                    <td className="py-3 px-2 text-slate-300 font-mono">
                      {log.missionId}
                    </td>
                    <td className="py-3 px-2 text-slate-300">
                      {log.deliveryZone}
                    </td>
                    <td className="py-3 px-2 text-slate-300">
                      ${log.fundsSettled.toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(
                          log.status
                        )}`}
                      >
                        {getStatusIcon(log.status)}
                        <span className="capitalize">
                          {log.status.replace("_", " ")}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMission(log);
                        }}
                        className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Proof</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Proof Details Panel */}
        <div className="space-y-6">
          {selectedMission ? (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Proof Details</span>
              </h3>

              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-3">
                    Mission Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mission ID:</span>
                      <span className="text-slate-300 font-mono">
                        {selectedMission.missionId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Delivery Zone:</span>
                      <span className="text-slate-300">
                        {selectedMission.deliveryZone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Funds Settled:</span>
                      <span className="text-slate-300">
                        ${selectedMission.fundsSettled.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Timestamp:</span>
                      <span className="text-slate-300 text-xs">
                        {new Date(selectedMission.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-3">
                    Proof of Delivery
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Proof Hash</p>
                      <div className="bg-slate-800/50 rounded p-2 font-mono text-xs text-slate-300 break-all">
                        {selectedMission.proofHash}
                      </div>
                    </div>

                    {selectedMission.recipientSignature && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">
                          Recipient Signature
                        </p>
                        <div className="bg-slate-800/50 rounded p-2 font-mono text-xs text-slate-300 break-all">
                          {selectedMission.recipientSignature}
                        </div>
                      </div>
                    )}

                    {selectedMission.transactionHash && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">
                          Blockchain Transaction
                        </p>
                        <div className="bg-slate-800/50 rounded p-2 font-mono text-xs text-slate-300 break-all">
                          {selectedMission.transactionHash}
                        </div>
                        <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>View on Blockchain Explorer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-3">
                    Verification Status
                  </h4>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedMission.status)}
                    <span
                      className={`text-sm capitalize ${
                        getStatusColor(selectedMission.status).split(" ")[0]
                      }`}
                    >
                      {selectedMission.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="text-center space-y-4">
                <Shield className="w-12 h-12 text-slate-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Select a Mission
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Click on any mission in the audit log to view detailed proof
                    information and verification status.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Blockchain Status */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Hash className="w-5 h-5" />
              <span>Blockchain Status</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="text-green-400 font-mono">
                  Ethereum Mainnet
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Block Height:</span>
                <span className="text-blue-400 font-mono">18,947,203</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Confirmation Time:</span>
                <span className="text-purple-400 font-mono">~2.3 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gas Price:</span>
                <span className="text-yellow-400 font-mono">21 Gwei</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
