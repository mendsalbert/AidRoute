"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  transactionStorage,
  type TransactionRecord,
} from "@/lib/transaction-storage";
import { blockchainFetcher } from "@/lib/blockchain-transaction-fetcher";
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
  Brain,
  Gift,
  Package,
  Zap,
} from "lucide-react";

export function AuditView() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    | "all"
    | "mission_creation"
    | "fund_allocation"
    | "donation"
    | "deployment"
    | "emergency_funds"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "confirmed" | "pending" | "failed"
  >("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionRecord | null>(null);

  useEffect(() => {
    // Subscribe to transaction updates
    const unsubscribe = transactionStorage.subscribe((updatedTransactions) => {
      setTransactions(updatedTransactions);
    });

    return unsubscribe;
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchQuery ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (transaction.missionId &&
        transaction.missionId
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: TransactionRecord["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
    }
  };

  const getStatusColor = (status: TransactionRecord["status"]) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-500/10 border-green-500/20";
      case "pending":
        return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
      case "failed":
        return "text-red-600 bg-red-500/10 border-red-500/20";
    }
  };

  const getTypeIcon = (type: TransactionRecord["type"]) => {
    switch (type) {
      case "mission_creation":
        return <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />;
      case "fund_allocation":
        return <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />;
      case "donation":
        return <Gift className="w-4 h-4 text-purple-500 flex-shrink-0" />;
      case "deployment":
        return <Package className="w-4 h-4 text-orange-500 flex-shrink-0" />;
      case "emergency_funds":
        return <Zap className="w-4 h-4 text-red-500 flex-shrink-0" />;
    }
  };

  const getTypeColor = (type: TransactionRecord["type"]) => {
    switch (type) {
      case "mission_creation":
        return "text-blue-600 bg-blue-500/10 border-blue-500/20";
      case "fund_allocation":
        return "text-green-600 bg-green-500/10 border-green-500/20";
      case "donation":
        return "text-purple-600 bg-purple-500/10 border-purple-500/20";
      case "deployment":
        return "text-orange-600 bg-orange-500/10 border-orange-500/20";
      case "emergency_funds":
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

  const stats = transactionStorage.getStats();
  const totalVolume = stats.totalVolume;
  const confirmedCount = stats.confirmed;
  const pendingCount = stats.pending;
  const failedCount = stats.failed;

  return (
    <div className="p-6 space-y-6">
      {/* Blockchain Sync Section */}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {filteredTransactions.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Transactions
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{confirmedCount}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
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
              <p className="text-2xl font-bold">
                {formatCurrency(totalVolume)}
              </p>
              <p className="text-sm text-muted-foreground">Total Volume</p>
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
                  placeholder="Search by Transaction Hash, Description, or Mission ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="all">All Types</option>
                  <option value="mission_creation">Mission Creation</option>
                  <option value="fund_allocation">Fund Allocation</option>
                  <option value="donation">Donation</option>
                  <option value="deployment">Deployment</option>
                  <option value="emergency_funds">Emergency Funds</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Table - Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm w-40">
                    Type
                  </th>
                  <th className="text-left p-4 font-medium text-sm">
                    Description
                  </th>
                  <th className="text-left p-4 font-medium text-sm w-32">
                    Amount
                  </th>
                  <th className="text-left p-4 font-medium text-sm w-32">
                    Status
                  </th>
                  <th className="text-left p-4 font-medium text-sm w-36">
                    Date
                  </th>
                  <th className="text-left p-4 font-medium text-sm w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          {getTypeIcon(transaction.type)}
                        </div>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap",
                            getTypeColor(transaction.type)
                          )}
                        >
                          {transaction.type
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {transaction.description}
                        </p>
                        {transaction.missionId && (
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            Mission: {transaction.missionId.slice(-8)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {transaction.currency}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          {getStatusIcon(transaction.status)}
                        </div>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap",
                            getStatusColor(transaction.status)
                          )}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-sm text-muted-foreground">
                        {transaction.timestamp.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.timestamp.toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors whitespace-nowrap"
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

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-card border border-border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {getTypeIcon(transaction.type)}
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        getTypeColor(transaction.type)
                      )}
                    >
                      {transaction.type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {getStatusIcon(transaction.status)}
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        getStatusColor(transaction.status)
                      )}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h3 className="font-medium text-sm">
                    {transaction.description}
                  </h3>
                  {transaction.missionId && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Mission: {transaction.missionId.slice(-8)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {formatCurrency(transaction.amount)}{" "}
                      {transaction.currency}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {transaction.timestamp.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => setSelectedTransaction(transaction)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                No Transactions Found
              </h3>
              <p className="text-sm">
                {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                  ? "No transactions match your current filters. Try adjusting your search criteria."
                  : "No transactions have been recorded yet. Sync with the blockchain to load existing transactions."}
              </p>
            </div>
          )}
        </div>

        {/* Transaction Details Panel */}
        <div className="bg-card border border-border rounded-xl p-6">
          {selectedTransaction ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Transaction Details</h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedTransaction.status)}
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(selectedTransaction.status)
                    )}
                  >
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Transaction Hash
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm bg-secondary px-2 py-1 rounded break-all">
                      {selectedTransaction.hash}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedTransaction.hash)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <a
                      href={selectedTransaction.etherscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedTransaction.type)}
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        getTypeColor(selectedTransaction.type)
                      )}
                    >
                      {selectedTransaction.type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Description
                  </label>
                  <p className="mt-1 font-medium">
                    {selectedTransaction.description}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Amount
                  </label>
                  <p className="mt-1 text-lg font-bold text-green-600">
                    {formatCurrency(selectedTransaction.amount)}{" "}
                    {selectedTransaction.currency}
                  </p>
                </div>

                {selectedTransaction.missionId && (
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Mission ID
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm bg-secondary px-2 py-1 rounded">
                        {selectedTransaction.missionId}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(selectedTransaction.missionId!)
                        }
                        className="p-1 hover:bg-secondary rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-muted-foreground">
                    Network
                  </label>
                  <p className="mt-1 font-medium capitalize">
                    {selectedTransaction.network}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">From</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm bg-secondary px-2 py-1 rounded">
                      {selectedTransaction.from}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedTransaction.from)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">To</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm bg-secondary px-2 py-1 rounded">
                      {selectedTransaction.to}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedTransaction.to)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
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
                      {selectedTransaction.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedTransaction.blockNumber && (
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Block Number
                    </label>
                    <p className="mt-1 font-mono text-sm">
                      {selectedTransaction.blockNumber.toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedTransaction.gasUsed && (
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Gas Used
                    </label>
                    <p className="mt-1 font-mono text-sm">
                      {selectedTransaction.gasUsed.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedTransaction.status === "confirmed" && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Transaction Confirmed</span>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    This transaction has been successfully confirmed on the
                    blockchain.
                  </p>
                </div>
              )}

              {selectedTransaction.agentName && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <Brain className="w-4 h-4" />
                    <span className="font-medium">
                      AI Agent: {selectedTransaction.agentName}
                    </span>
                  </div>
                  {selectedTransaction.confidence && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Confidence:{" "}
                      {Math.floor(selectedTransaction.confidence * 100)}%
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a transaction to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
