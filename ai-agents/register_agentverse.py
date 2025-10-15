"""
Register AidRoute Agent on Agentverse

This script helps you register your agent on Agentverse for:
- Discovery via ASI:One
- Cloud hosting
- Multi-agent coordination
"""

import os
from dotenv import load_dotenv

load_dotenv()

def print_registration_guide():
    """Print step-by-step guide for Agentverse registration"""
    
    agent_address = os.getenv("AGENT_ADDRESS", "agent1...")
    agent_name = os.getenv("AGENT_NAME", "AidRoute Humanitarian Coordinator")
    
    print("""
╔══════════════════════════════════════════════════════════════════╗
║           Register AidRoute on Agentverse                        ║
╚══════════════════════════════════════════════════════════════════╝

📋 **STEP 1: Get Your Agent Address**

Your agent address will be displayed when you run:
  python src/aidroute_agent.py

Look for: "Agent Address: agent1..."

---

📋 **STEP 2: Create Agentverse Account**

1. Go to: https://agentverse.ai/
2. Sign up with your email
3. Verify your account

---

📋 **STEP 3: Register Your Agent**

1. Click "My Agents" in Agentverse dashboard
2. Click "+ Add Agent"
3. Choose "Register Existing Agent"
4. Enter your agent address from Step 1
5. Add agent details:

   **Name:** AidRoute Humanitarian Coordinator
   
   **Description:**
   Autonomous AI agent for humanitarian logistics coordination.
   Powered by Fetch.ai uAgents + SingularityNET MeTTa.
   Manages PYUSD-funded missions on Ethereum.
   
   **Tags:** humanitarian, logistics, PYUSD, blockchain, AI
   
   **Category:** DeFi & Finance / Social Good
   
   **README:**
   ```markdown
   # AidRoute Humanitarian Coordinator

   An autonomous AI agent that coordinates humanitarian aid missions
   using blockchain technology and AI reasoning.

   ## Features
   - 🌍 Create & manage humanitarian missions
   - 💰 Process PYUSD donations transparently
   - 🧠 AI-optimized logistics planning
   - ✅ Blockchain-verified deliveries

   ## How to Use
   Chat with me via ASI:One to:
   - Create missions
   - Check status
   - Donate to causes
   - Optimize logistics

   ## Technologies
   - Fetch.ai uAgents
   - MeTTa Knowledge Graphs
   - PYUSD Smart Contracts
   - Ethereum Sepolia Testnet

   ## Contract
   Sepolia: 0x681735982373ae65a8f8b2074922a924780ba360
   ```

6. Click "Register"

---

📋 **STEP 4: Get Mailbox Key (Optional)**

For cloud hosting:

1. In Agentverse, go to your agent
2. Click "Get Mailbox Key"
3. Copy the key
4. Add to your .env file:
   MAILBOX_KEY=your_mailbox_key_here

5. Restart your agent

---

📋 **STEP 5: Enable Chat Protocol**

1. In your agent settings on Agentverse
2. Enable "Chat Protocol"
3. Set protocol version: 1.0
4. Set endpoint models:
   - ChatRequest
   - ChatResponse
   - MissionRequest
   - MissionResponse

---

📋 **STEP 6: Test on ASI:One**

1. Go to: https://asi1.ai/
2. Search for: "AidRoute"
3. Start a chat:
   "Hello, what can you do?"

4. Try commands:
   - "Show active missions"
   - "Create a mission in Gaza"
   - "How can I donate?"

---

📋 **STEP 7: Verify Integration**

✅ Agent appears in Agentverse
✅ Discoverable on ASI:One
✅ Chat protocol working
✅ Can create missions
✅ MeTTa reasoning active

---

🎉 **You're Live!**

Your agent is now:
- Registered on Agentverse
- Discoverable via ASI:One
- Ready for multi-agent coordination
- Competing for hackathon prizes!

---

📊 **Agent Information:**

Name: {agent_name}
Address: {agent_address}
Contract: 0x681735982373ae65a8f8b2074922a924780ba360
Network: Sepolia Testnet

---

💡 **Tips:**

1. Keep your agent running for 24/7 availability
2. Monitor logs for incoming messages
3. Update MeTTa knowledge base regularly
4. Test all protocols before demo
5. Document your agent's capabilities

---

🏆 **Hackathon Submission:**

Include these links:
- Agentverse: https://agentverse.ai/agents/[your-agent]
- ASI:One Demo: Screenshot of chat interaction
- GitHub: Full code repository
- Documentation: This README

---

Need help? Check out:
- Agentverse Docs: https://docs.agentverse.ai/
- Fetch.ai Support: https://fetch.ai/discord

Good luck! 🚀
    """.format(agent_name=agent_name, agent_address=agent_address))


def generate_agent_metadata():
    """Generate metadata JSON for Agentverse"""
    
    metadata = {
        "name": "AidRoute Humanitarian Coordinator",
        "description": "Autonomous AI agent for humanitarian logistics powered by ASI Alliance",
        "version": "1.0.0",
        "author": "AidRoute Team",
        "license": "MIT",
        "tags": ["humanitarian", "logistics", "PYUSD", "blockchain", "AI", "crisis-response"],
        "category": "Social Good",
        "capabilities": [
            "Mission Creation",
            "PYUSD Donations",
            "AI Optimization",
            "Blockchain Verification",
            "Natural Language Chat"
        ],
        "protocols": [
            {
                "name": "AidRoute Chat Protocol",
                "version": "1.0",
                "messages": ["ChatRequest", "ChatResponse"]
            },
            {
                "name": "AidRoute Mission Management",
                "version": "1.0",
                "messages": ["MissionRequest", "MissionResponse", "MissionQuery", "MissionInfo"]
            }
        ],
        "integrations": {
            "blockchain": {
                "network": "Sepolia",
                "contract": "0x681735982373ae65a8f8b2074922a924780ba360",
                "token": "PYUSD"
            },
            "ai": {
                "framework": "MeTTa",
                "provider": "SingularityNET"
            }
        },
        "links": {
            "documentation": "https://github.com/yourrepo/AidRoute/tree/main/ai-agents",
            "contract": "https://sepolia.etherscan.io/address/0x681735982373ae65a8f8b2074922a924780ba360",
            "website": "https://aidroute.xyz"
        }
    }
    
    import json
    with open("agent_metadata.json", "w") as f:
        json.dump(metadata, indent=2, fp=f)
    
    print("\n✅ Generated agent_metadata.json")
    print("   Upload this to Agentverse when registering\n")


if __name__ == "__main__":
    print_registration_guide()
    generate_agent_metadata()

