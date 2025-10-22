"use client";

export interface TransactionRecord {
  id: string;
  hash: string;
  type:
    | "mission_creation"
    | "fund_allocation"
    | "donation"
    | "deployment"
    | "emergency_funds";
  amount: number;
  currency: "PYUSD" | "ETH";
  from: string;
  to: string;
  missionId?: string;
  description: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: Date;
  blockNumber?: number;
  gasUsed?: number;
  network: "sepolia" | "mainnet";
  etherscanUrl: string;
  agentName?: string;
  confidence?: number;
}

class TransactionStorage {
  private transactions: Map<string, TransactionRecord> = new Map();
  private listeners: Set<(transactions: TransactionRecord[]) => void> =
    new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("aidroute_transactions");
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach((tx: any) => {
          tx.timestamp = new Date(tx.timestamp);
          this.transactions.set(tx.id, tx);
        });
      }
    } catch (error) {
      console.error("Failed to load transactions from storage:", error);
    }
  }

  private saveToStorage() {
    try {
      const data = Array.from(this.transactions.values());
      localStorage.setItem("aidroute_transactions", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save transactions to storage:", error);
    }
  }

  addTransaction(
    transaction: Omit<TransactionRecord, "id" | "timestamp" | "etherscanUrl">
  ): string {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();
    const network = transaction.network || "sepolia";

    const etherscanUrl =
      network === "sepolia"
        ? `https://sepolia.etherscan.io/tx/${transaction.hash}`
        : `https://etherscan.io/tx/${transaction.hash}`;

    const fullTransaction: TransactionRecord = {
      ...transaction,
      id,
      timestamp,
      etherscanUrl,
    };

    this.transactions.set(id, fullTransaction);
    this.saveToStorage();
    this.notifyListeners();
    return id;
  }

  updateTransaction(id: string, updates: Partial<TransactionRecord>): boolean {
    const transaction = this.transactions.get(id);
    if (!transaction) return false;

    const updatedTransaction = { ...transaction, ...updates };
    this.transactions.set(id, updatedTransaction);
    this.saveToStorage();
    this.notifyListeners();

    return true;
  }

  getTransaction(id: string): TransactionRecord | undefined {
    return this.transactions.get(id);
  }

  getAllTransactions(): TransactionRecord[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getTransactionsByType(type: TransactionRecord["type"]): TransactionRecord[] {
    return this.getAllTransactions().filter((tx) => tx.type === type);
  }

  getTransactionsByMission(missionId: string): TransactionRecord[] {
    return this.getAllTransactions().filter((tx) => tx.missionId === missionId);
  }

  getTransactionsByStatus(
    status: TransactionRecord["status"]
  ): TransactionRecord[] {
    return this.getAllTransactions().filter((tx) => tx.status === status);
  }

  getTotalVolume(): number {
    return this.getAllTransactions()
      .filter((tx) => tx.status === "confirmed")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  getTotalByType(type: TransactionRecord["type"]): number {
    return this.getTransactionsByType(type)
      .filter((tx) => tx.status === "confirmed")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  getStats() {
    const all = this.getAllTransactions();
    const confirmed = all.filter((tx) => tx.status === "confirmed");
    const pending = all.filter((tx) => tx.status === "pending");
    const failed = all.filter((tx) => tx.status === "failed");

    return {
      total: all.length,
      confirmed: confirmed.length,
      pending: pending.length,
      failed: failed.length,
      totalVolume: this.getTotalVolume(),
      byType: {
        mission_creation: this.getTotalByType("mission_creation"),
        fund_allocation: this.getTotalByType("fund_allocation"),
        donation: this.getTotalByType("donation"),
        deployment: this.getTotalByType("deployment"),
        emergency_funds: this.getTotalByType("emergency_funds"),
      },
    };
  }

  subscribe(listener: (transactions: TransactionRecord[]) => void) {
    this.listeners.add(listener);
    // Immediately call with current data
    listener(this.getAllTransactions());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const transactions = this.getAllTransactions();
    this.listeners.forEach((listener) => listener(transactions));
  }

  clear() {
    this.transactions.clear();
    localStorage.removeItem("aidroute_transactions");
    this.notifyListeners();
  }
}

// Export singleton instance
export const transactionStorage = new TransactionStorage();

// Helper function to create transaction from agent message
export function createTransactionFromMessage(
  message: any,
  hash: string,
  network: "sepolia" | "mainnet" = "sepolia"
): Omit<TransactionRecord, "id" | "timestamp" | "etherscanUrl"> {
  const transactionData = message.transactionData || {};

  return {
    hash,
    type: transactionData.type || "fund_allocation",
    amount: transactionData.amount || 0,
    currency: "PYUSD",
    from: "user_wallet", // This would be the actual wallet address
    to: "contract_address", // This would be the actual contract address
    missionId: transactionData.missionId,
    description: message.content.split("\n")[0] || "Transaction",
    status: "confirmed",
    network,
    agentName: message.agentName,
    confidence: message.confidence,
  };
}
