"""
Blockchain Interface for AidRoute Smart Contract

Connects the AI agent to the deployed PYUSD-based smart contract
"""

import os
from typing import Dict, List, Optional, Tuple
from web3 import Web3
from web3.contract import Contract
import json

class BlockchainInterface:
    """
    Interface to interact with AidRoute smart contract
    """
    
    def __init__(self, contract_address: str, pyusd_address: str):
        """
        Initialize blockchain connection
        
        Args:
            contract_address: Deployed AidRouteMissions contract address
            pyusd_address: PYUSD token contract address
        """
        # Connect to Sepolia
        rpc_url = os.getenv("SEPOLIA_RPC_URL", "https://ethereum-sepolia-rpc.publicnode.com")
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        if not self.w3.is_connected():
            raise ConnectionError("Failed to connect to Ethereum network")
        
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.pyusd_address = Web3.to_checksum_address(pyusd_address)
        
        # Load contract ABI
        self.contract = self._load_contract()
        
        # Load account if private key available
        private_key = os.getenv("PRIVATE_KEY")
        if private_key:
            self.account = self.w3.eth.account.from_key(private_key)
        else:
            self.account = None
            print("⚠️  No private key - read-only mode")
    
    def _load_contract(self) -> Contract:
        """Load the AidRouteMissions contract"""
        # Try to load ABI from artifacts
        abi_path = "../artifacts/contracts/AidRouteMissions.sol/AidRouteMissions.json"
        
        if os.path.exists(abi_path):
            with open(abi_path, 'r') as f:
                contract_json = json.load(f)
                abi = contract_json['abi']
        else:
            # Minimal ABI for common functions
            abi = [
                {"inputs": [], "name": "getStats", "outputs": [
                    {"type": "uint256"}, {"type": "uint256"}, {"type": "uint256"},
                    {"type": "uint256"}, {"type": "uint256"}
                ], "stateMutability": "view", "type": "function"},
                {"inputs": [{"type": "uint256"}], "name": "getMission", "outputs": [
                    {"type": "tuple", "components": [
                        {"name": "id", "type": "uint256"},
                        {"name": "location", "type": "string"},
                        {"name": "description", "type": "string"},
                        {"name": "items", "type": "string[]"},
                        {"name": "fundingGoal", "type": "uint256"},
                        {"name": "fundsAllocated", "type": "uint256"},
                        {"name": "fundsDeployed", "type": "uint256"},
                        {"name": "coordinator", "type": "address"},
                        {"name": "status", "type": "uint8"},
                        {"name": "createdAt", "type": "uint256"},
                        {"name": "completedAt", "type": "uint256"},
                        {"name": "deliveryProof", "type": "string"}
                    ]}
                ], "stateMutability": "view", "type": "function"},
                {"inputs": [
                    {"type": "string"}, {"type": "string"}, 
                    {"type": "string[]"}, {"type": "uint256"}
                ], "name": "createMission", "outputs": [{"type": "uint256"}], 
                "stateMutability": "nonpayable", "type": "function"}
            ]
        
        return self.w3.eth.contract(address=self.contract_address, abi=abi)
    
    def get_contract_stats(self) -> Dict[str, any]:
        """Get overall contract statistics"""
        try:
            stats = self.contract.functions.getStats().call()
            
            return {
                "total_missions": int(stats[0]),
                "total_donations": self._format_pyusd(stats[1]),
                "total_deployed": self._format_pyusd(stats[2]),
                "general_fund": self._format_pyusd(stats[3]),
                "contract_balance": self._format_pyusd(stats[4])
            }
        except Exception as e:
            print(f"Error getting stats: {e}")
            return {
                "total_missions": 0,
                "total_donations": 0,
                "total_deployed": 0,
                "general_fund": 0,
                "contract_balance": 0
            }
    
    def get_mission(self, mission_id: int) -> Optional[Dict]:
        """Get mission details"""
        try:
            mission = self.contract.functions.getMission(mission_id).call()
            
            return {
                "id": mission[0],
                "location": mission[1],
                "description": mission[2],
                "items": list(mission[3]),
                "funding_goal": self._format_pyusd(mission[4]),
                "funds_allocated": self._format_pyusd(mission[5]),
                "funds_deployed": self._format_pyusd(mission[6]),
                "coordinator": mission[7],
                "status": self._format_status(mission[8]),
                "created_at": mission[9],
                "completed_at": mission[10],
                "delivery_proof": mission[11]
            }
        except Exception as e:
            print(f"Error getting mission {mission_id}: {e}")
            return None
    
    def get_missions(self, mission_id: Optional[int] = None, 
                    location: Optional[str] = None,
                    status: Optional[str] = None) -> List[Dict]:
        """
        Get missions based on filters
        Note: This is a simplified version - full implementation would use events
        """
        missions = []
        
        try:
            stats = self.contract.functions.getStats().call()
            total_missions = int(stats[0])
            
            for i in range(1, total_missions + 1):
                if mission_id and i != mission_id:
                    continue
                
                mission = self.get_mission(i)
                if not mission:
                    continue
                
                if location and location.lower() not in mission['location'].lower():
                    continue
                
                if status and mission['status'].lower() != status.lower():
                    continue
                
                missions.append(mission)
        
        except Exception as e:
            print(f"Error querying missions: {e}")
        
        return missions
    
    def get_active_missions(self) -> List[Dict]:
        """Get all non-completed missions"""
        all_missions = self.get_missions()
        return [m for m in all_missions if m['status'] not in ['Completed', 'Cancelled']]
    
    def create_mission(self, location: str, description: str, 
                      items: List[str], funding_goal: float) -> Tuple[str, int]:
        """
        Create a new mission on the blockchain
        
        Returns:
            (transaction_hash, mission_id)
        """
        if not self.account:
            raise Exception("No account configured - cannot send transactions")
        
        # Convert PYUSD amount (6 decimals)
        funding_goal_wei = int(funding_goal * 1_000_000)
        
        # Build transaction
        tx = self.contract.functions.createMission(
            location,
            description,
            items,
            funding_goal_wei
        ).build_transaction({
            'from': self.account.address,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'gas': 500000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        # Sign and send
        signed_tx = self.w3.eth.account.sign_transaction(tx, self.account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        # Wait for receipt
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get mission ID from stats (last created)
        stats = self.contract.functions.getStats().call()
        mission_id = int(stats[0])
        
        return (tx_hash.hex(), mission_id)
    
    def _format_pyusd(self, amount_raw: int) -> float:
        """Format PYUSD amount (6 decimals)"""
        return amount_raw / 1_000_000
    
    def _format_status(self, status_code: int) -> str:
        """Convert status code to string"""
        statuses = [
            "Pending", "Funded", "InProgress", "EnRoute",
            "Delivered", "Verified", "Completed", "Cancelled"
        ]
        return statuses[status_code] if status_code < len(statuses) else "Unknown"


# Testing
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    contract_addr = os.getenv("CONTRACT_ADDRESS", "0x681735982373ae65a8f8b2074922a924780ba360")
    pyusd_addr = os.getenv("PYUSD_ADDRESS", "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9")
    
    print("🔗 Testing Blockchain Interface...\n")
    
    try:
        blockchain = BlockchainInterface(contract_addr, pyusd_addr)
        
        # Get stats
        print("📊 Contract Statistics:")
        stats = blockchain.get_contract_stats()
        for key, value in stats.items():
            print(f"  {key}: {value}")
        
        # Get mission #1
        print("\n📋 Mission #1:")
        mission = blockchain.get_mission(1)
        if mission:
            print(f"  Location: {mission['location']}")
            print(f"  Goal: {mission['funding_goal']} PYUSD")
            print(f"  Status: {mission['status']}")
        
        print("\n✅ Blockchain interface working!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

