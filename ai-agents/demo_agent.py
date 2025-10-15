"""
Demo Script for AidRoute AI Agent

Test the agent's capabilities without running the full server
"""

import asyncio
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from dotenv import load_dotenv
load_dotenv()

async def demo_metta_reasoning():
    """Demo MeTTa knowledge reasoning"""
    print("\n" + "="*70)
    print("🧠 DEMO: MeTTa Humanitarian Reasoning")
    print("="*70 + "\n")
    
    try:
        from metta_reasoner import MettaHumanitarianReasoner
        
        reasoner = MettaHumanitarianReasoner()
        
        # Test mission optimization
        test_missions = [
            "Urgent medical supplies needed in Gaza",
            "Food security crisis in Yemen - need family packages",
            "Water purification systems for Haiti after earthquake",
            "Emergency shelter for Syria refugee camp"
        ]
        
        for mission in test_missions:
            print(f"\n📋 Mission: {mission}")
            print("-" * 70)
            
            result = reasoner.optimize_mission_plan(mission)
            
            print(result['recommendation'])
            print(f"\n💡 Reasoning: {result['reasoning']}")
            print(f"💰 Cost: ${result['estimated_cost']:,.2f} PYUSD")
            print(f"👥 Beneficiaries: {result['estimated_beneficiaries']:,}")
            print(f"⏱️  Timeline: {result['estimated_timeline']}")
            print(f"📊 Efficiency: {result['efficiency_score']}%")
            
            print("\n")
        
        print("✅ MeTTa reasoning demo complete!\n")
        
    except Exception as e:
        print(f"❌ MeTTa demo failed: {e}\n")


async def demo_blockchain_interface():
    """Demo blockchain integration"""
    print("\n" + "="*70)
    print("🔗 DEMO: Blockchain Smart Contract Interface")
    print("="*70 + "\n")
    
    try:
        from blockchain_interface import BlockchainInterface
        
        contract_addr = os.getenv("CONTRACT_ADDRESS", "0x681735982373ae65a8f8b2074922a924780ba360")
        pyusd_addr = os.getenv("PYUSD_ADDRESS", "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9")
        
        blockchain = BlockchainInterface(contract_addr, pyusd_addr)
        
        # Get stats
        print("📊 Contract Statistics:")
        print("-" * 70)
        stats = blockchain.get_contract_stats()
        for key, value in stats.items():
            print(f"  {key.replace('_', ' ').title()}: {value}")
        
        # Get missions
        print("\n\n📋 Active Missions:")
        print("-" * 70)
        missions = blockchain.get_active_missions()
        
        if missions:
            for mission in missions[:3]:  # Show first 3
                print(f"\n  Mission #{mission['id']}: {mission['location']}")
                print(f"    Description: {mission['description'][:60]}...")
                print(f"    Goal: {mission['funding_goal']} PYUSD")
                print(f"    Funded: {mission['funds_allocated']}/{mission['funding_goal']} PYUSD")
                print(f"    Status: {mission['status']}")
        else:
            print("  No active missions found")
        
        print("\n✅ Blockchain interface demo complete!\n")
        
    except Exception as e:
        print(f"❌ Blockchain demo failed: {e}\n")


async def demo_chat_interaction():
    """Demo chat protocol interactions"""
    print("\n" + "="*70)
    print("💬 DEMO: Chat Protocol Simulation")
    print("="*70 + "\n")
    
    # Simulate chat interactions
    test_chats = [
        "Hello, what can you do?",
        "Show me active missions",
        "Create a mission in Gaza for medical supplies",
        "How can I donate?",
        "Optimize my mission plan for Yemen"
    ]
    
    print("Simulating user conversations with the agent:\n")
    
    for i, chat in enumerate(test_chats, 1):
        print(f"\n{i}. 👤 User: {chat}")
        print("   🤖 Agent: [Response would be generated here]")
        print("   " + "-" * 60)
    
    print("\n💡 In production, these interactions happen via ASI:One")
    print("   Connect at: https://asi1.ai/\n")
    
    print("✅ Chat protocol demo complete!\n")


async def demo_full_workflow():
    """Demo complete mission workflow"""
    print("\n" + "="*70)
    print("🔄 DEMO: Complete Mission Workflow")
    print("="*70 + "\n")
    
    print("Simulating a full humanitarian mission lifecycle:\n")
    
    steps = [
        ("1. User Request", "💬 'I need to send medical supplies to Gaza'"),
        ("2. MeTTa Reasoning", "🧠 Analyzing crisis type, optimizing supply list..."),
        ("3. Cost Estimation", "💰 Estimated cost: $5,247 PYUSD"),
        ("4. Mission Creation", "📝 Creating mission on blockchain..."),
        ("5. Blockchain Tx", "⛓️  Transaction confirmed: 0x4cc3..."),
        ("6. Mission Live", "✅ Mission #2 created successfully!"),
        ("7. Donation Received", "💵 1000 PYUSD donated to mission #2"),
        ("8. Fund Deployment", "🚀 500 PYUSD deployed to supplier"),
        ("9. Status Update", "📦 Status changed to 'En Route'"),
        ("10. Delivery Proof", "✅ Delivery verified with IPFS proof"),
        ("11. Mission Complete", "🎉 Mission completed! 500 beneficiaries helped")
    ]
    
    for step, desc in steps:
        print(f"  {step}")
        print(f"    {desc}\n")
        await asyncio.sleep(0.5)  # Simulate processing time
    
    print("✅ Full workflow demo complete!\n")


async def main():
    """Run all demos"""
    print("""
╔══════════════════════════════════════════════════════════════════╗
║                 AidRoute AI Agent Demo                           ║
║        Artificial Superintelligence Alliance Integration         ║
╚══════════════════════════════════════════════════════════════════╝
    """)
    
    print("\nThis demo showcases:")
    print("  • MeTTa knowledge reasoning")
    print("  • Blockchain smart contract integration")
    print("  • Chat protocol capabilities")
    print("  • Complete mission workflows")
    
    print("\nChoose a demo:")
    print("  1. MeTTa Reasoning")
    print("  2. Blockchain Interface")
    print("  3. Chat Interaction")
    print("  4. Full Workflow")
    print("  5. Run All Demos")
    print("  0. Exit")
    
    try:
        choice = input("\nEnter choice (0-5): ").strip()
        
        if choice == "1":
            await demo_metta_reasoning()
        elif choice == "2":
            await demo_blockchain_interface()
        elif choice == "3":
            await demo_chat_interaction()
        elif choice == "4":
            await demo_full_workflow()
        elif choice == "5":
            await demo_metta_reasoning()
            await demo_blockchain_interface()
            await demo_chat_interaction()
            await demo_full_workflow()
        elif choice == "0":
            print("\nExiting demo. Goodbye! 👋\n")
            return
        else:
            print("\n❌ Invalid choice\n")
            return
        
        print("\n" + "="*70)
        print("🎉 Demo Complete!")
        print("="*70)
        print("\nTo run the full agent:")
        print("  python src/aidroute_agent.py")
        print("\nTo register on Agentverse:")
        print("  python register_agentverse.py")
        print("\nTo connect via ASI:One:")
        print("  https://asi1.ai/ (search for 'AidRoute')\n")
        
    except KeyboardInterrupt:
        print("\n\nDemo interrupted. Goodbye! 👋\n")
    except Exception as e:
        print(f"\n❌ Demo error: {e}\n")


if __name__ == "__main__":
    asyncio.run(main())

