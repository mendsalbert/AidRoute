"""
AidRoute Humanitarian Coordinator Agent

An autonomous AI agent that coordinates humanitarian missions using:
- Fetch.ai uAgents for autonomous behavior
- MeTTa Knowledge Graphs for structured reasoning
- Smart contract integration for on-chain operations
- ASI:One Chat Protocol for human interaction
"""

import os
import json
from typing import List, Dict, Optional
from dotenv import load_dotenv

from uagents import Agent, Context, Model, Protocol
from uagents.setup import fund_agent_if_low

# Load environment variables
load_dotenv()

# Agent configuration
AGENT_SEED = os.getenv("AGENT_SEED", "aidroute_humanitarian_coordinator_seed_2025")
AGENT_NAME = os.getenv("AGENT_NAME", "AidRoute Coordinator")
AGENT_PORT = int(os.getenv("AGENT_PORT", "8000"))
MAILBOX_KEY = os.getenv("MAILBOX_KEY", "")

# Blockchain configuration
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x681735982373ae65a8f8b2074922a924780ba360")
PYUSD_ADDRESS = os.getenv("PYUSD_ADDRESS", "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9")

# Message Models for Chat Protocol
class ChatRequest(Model):
    """User message to the agent"""
    message: str
    session_id: Optional[str] = None

class ChatResponse(Model):
    """Agent response to user"""
    message: str
    mission_data: Optional[Dict] = None
    suggestions: Optional[List[str]] = None

class MissionRequest(Model):
    """Request to create a new mission"""
    location: str
    description: str
    items: List[str]
    funding_goal: float  # in PYUSD

class MissionResponse(Model):
    """Response after mission creation"""
    success: bool
    mission_id: Optional[int] = None
    message: str
    transaction_hash: Optional[str] = None

class MissionQuery(Model):
    """Query for mission information"""
    mission_id: Optional[int] = None
    location: Optional[str] = None
    status: Optional[str] = None

class MissionInfo(Model):
    """Mission information response"""
    missions: List[Dict]
    total_count: int
    summary: str

# Initialize the agent
agent = Agent(
    name=AGENT_NAME,
    seed=AGENT_SEED,
    port=AGENT_PORT,
    endpoint=[f"http://localhost:{AGENT_PORT}/submit"],
    mailbox=MAILBOX_KEY if MAILBOX_KEY else None,
)

# Fund agent if needed (for testnet)
fund_agent_if_low(agent.wallet.address())

# Import MeTTa reasoning engine
try:
    from .metta_reasoner import MettaHumanitarianReasoner
    metta_enabled = True
    print("✅ MeTTa reasoning engine loaded")
except ImportError:
    metta_enabled = False
    print("⚠️  MeTTa not available - using basic reasoning")

# Import blockchain interface
try:
    from .blockchain_interface import BlockchainInterface
    blockchain = BlockchainInterface(CONTRACT_ADDRESS, PYUSD_ADDRESS)
    blockchain_enabled = True
    print("✅ Blockchain interface connected")
except Exception as e:
    blockchain_enabled = False
    print(f"⚠️  Blockchain not available: {e}")

# Initialize MeTTa reasoner if available
if metta_enabled:
    reasoner = MettaHumanitarianReasoner()
else:
    reasoner = None


# Chat Protocol Implementation
chat_protocol = Protocol("AidRoute Chat Protocol", version="1.0")

@chat_protocol.on_message(model=ChatRequest)
async def handle_chat(ctx: Context, sender: str, msg: ChatRequest):
    """
    Handle incoming chat messages from users via ASI:One
    This makes the agent discoverable and interactive
    """
    ctx.logger.info(f"Received chat message from {sender}: {msg.message}")
    
    user_message = msg.message.lower()
    
    # Intent classification using simple rules (can be enhanced with LLM)
    if any(word in user_message for word in ["create", "new", "start", "mission"]):
        response = await handle_mission_creation_intent(ctx, msg.message)
    
    elif any(word in user_message for word in ["status", "check", "how", "progress"]):
        response = await handle_status_query(ctx, msg.message)
    
    elif any(word in user_message for word in ["donate", "fund", "contribute", "help"]):
        response = await handle_donation_intent(ctx, msg.message)
    
    elif any(word in user_message for word in ["suggest", "recommend", "optimize", "plan"]):
        response = await handle_optimization_request(ctx, msg.message)
    
    elif any(word in user_message for word in ["hello", "hi", "help", "what"]):
        response = await handle_greeting(ctx)
    
    else:
        response = await handle_general_query(ctx, msg.message)
    
    await ctx.send(sender, ChatResponse(
        message=response["message"],
        mission_data=response.get("data"),
        suggestions=response.get("suggestions")
    ))


async def handle_mission_creation_intent(ctx: Context, message: str) -> Dict:
    """Handle intent to create a new mission"""
    return {
        "message": """I can help you create a humanitarian mission! 🌍
        
To create a mission, I need:
1. **Location** - Where is help needed?
2. **Description** - What's the humanitarian need?
3. **Items** - What supplies are required?
4. **Funding Goal** - How much PYUSD is needed?

You can provide these details, or I can help you optimize the mission plan using my knowledge of humanitarian logistics!

Example: "Create a mission in Gaza for medical supplies - we need bandages, antibiotics, and IV fluids. Budget: 5000 PYUSD"
""",
        "suggestions": [
            "Tell me about urgent needs",
            "Suggest optimal supply packages",
            "Check similar past missions",
            "Estimate costs for my region"
        ]
    }


async def handle_status_query(ctx: Context, message: str) -> Dict:
    """Handle mission status queries"""
    if blockchain_enabled:
        try:
            stats = blockchain.get_contract_stats()
            active_missions = blockchain.get_active_missions()
            
            return {
                "message": f"""📊 **AidRoute System Status**

**Overall Statistics:**
- Active Missions: {stats['total_missions']}
- Total Donations: {stats['total_donations']} PYUSD
- Funds Deployed: {stats['total_deployed']} PYUSD
- Available General Fund: {stats['general_fund']} PYUSD

**Recent Missions:**
{format_missions_list(active_missions[:3])}

Would you like details on a specific mission?
""",
                "data": {
                    "stats": stats,
                    "active_missions": active_missions
                }
            }
        except Exception as e:
            ctx.logger.error(f"Error fetching stats: {e}")
    
    return {
        "message": "I can check mission status for you! Please provide a mission ID or location.",
        "suggestions": ["Show all missions", "Check mission #1", "Latest deployments"]
    }


async def handle_donation_intent(ctx: Context, message: str) -> Dict:
    """Handle donation-related queries"""
    return {
        "message": f"""💰 **How to Donate to AidRoute**

**Option 1: Donate via Smart Contract**
Contract: `{CONTRACT_ADDRESS}`
Token: PYUSD on Sepolia

**Option 2: Donate to Specific Mission**
1. Get PYUSD from faucet: https://faucet.paxos.com/
2. Approve spending to AidRoute contract
3. Call `donate(amount, missionId)` function

**Option 3: General Fund**
Donate to mission ID `0` to support any urgent need!

**Tax Benefits:** Donations are recorded on blockchain for verification 📝

Which mission would you like to support?
""",
        "suggestions": [
            "Show urgent missions",
            "Donate to Mission #1",
            "Add to general fund",
            "View my donation history"
        ]
    }


async def handle_optimization_request(ctx: Context, message: str) -> Dict:
    """Handle mission optimization requests using MeTTa reasoning"""
    if metta_enabled and reasoner:
        try:
            # Use MeTTa to reason about optimal mission planning
            optimization = reasoner.optimize_mission_plan(message)
            
            return {
                "message": f"""🧠 **AI-Optimized Mission Plan**

{optimization['recommendation']}

**Reasoning:**
{optimization['reasoning']}

**Estimated Impact:**
- Beneficiaries: {optimization.get('estimated_beneficiaries', 'TBD')}
- Timeline: {optimization.get('estimated_timeline', 'TBD')}
- Efficiency Score: {optimization.get('efficiency_score', 'TBD')}%

Ready to create this mission?
""",
                "data": optimization,
                "suggestions": [
                    "Create this mission",
                    "Adjust parameters",
                    "Compare alternatives",
                    "Show similar missions"
                ]
            }
        except Exception as e:
            ctx.logger.error(f"MeTTa optimization error: {e}")
    
    return {
        "message": """I can help optimize your humanitarian mission! 🎯

I analyze:
- Historical mission data
- Regional needs and constraints
- Supply chain efficiency
- Cost optimization
- Impact maximization

Tell me about your planned mission and I'll suggest improvements!
""",
        "suggestions": [
            "Optimize supply list",
            "Best delivery routes",
            "Cost-effective alternatives",
            "Maximize impact"
        ]
    }


async def handle_greeting(ctx: Context) -> Dict:
    """Handle greetings and help requests"""
    return {
        "message": f"""👋 **Welcome to AidRoute!**

I'm your AI Humanitarian Coordinator, powered by the Artificial Superintelligence Alliance.

**What I Can Do:**
🌍 Create and manage humanitarian missions
📊 Monitor mission status and funding
💡 Optimize logistics using AI reasoning
🔗 Process donations via PYUSD
📈 Provide analytics and insights
✅ Verify deliveries on blockchain

**Powered By:**
- Fetch.ai uAgents (Autonomous coordination)
- SingularityNET MeTTa (Knowledge reasoning)
- PYUSD Smart Contracts (Transparent funding)
- ASI:One (Natural interaction)

**Try asking:**
- "Create a mission in [location]"
- "Show active missions"
- "How can I donate?"
- "Optimize my mission plan"
- "Check mission status"

How can I help you today? 🚀
""",
        "suggestions": [
            "Create new mission",
            "View active missions",
            "Donate to a cause",
            "Optimize logistics",
            "Get statistics"
        ]
    }


async def handle_general_query(ctx: Context, message: str) -> Dict:
    """Handle general queries with AI reasoning"""
    if metta_enabled and reasoner:
        try:
            # Use MeTTa to reason about the query
            response = reasoner.query_knowledge(message)
            return {
                "message": response['answer'],
                "data": response.get('knowledge'),
                "suggestions": response.get('related_queries', [])
            }
        except Exception as e:
            ctx.logger.error(f"MeTTa query error: {e}")
    
    return {
        "message": f"""I understand you're asking: "{message}"

I can help with:
- **Mission Management**: Create, track, and complete missions
- **Funding**: PYUSD donations and deployment
- **Optimization**: AI-powered logistics planning
- **Analytics**: Real-time stats and insights
- **Verification**: Blockchain-based delivery proof

Could you be more specific about what you'd like to do?
""",
        "suggestions": [
            "Show what you can do",
            "Create a mission",
            "Check statistics",
            "Learn about PYUSD"
        ]
    }


def format_missions_list(missions: List[Dict]) -> str:
    """Format missions into a readable list"""
    if not missions:
        return "No active missions found."
    
    formatted = []
    for m in missions:
        formatted.append(f"""
**Mission #{m['id']}**: {m['location']}
- Need: {m['description'][:80]}...
- Goal: {m['funding_goal']} PYUSD
- Status: {m['status']}
- Funded: {m['funds_allocated']}/{m['funding_goal']} PYUSD
""")
    
    return "\n".join(formatted)


# Mission Management Protocol
mission_protocol = Protocol("AidRoute Mission Management", version="1.0")

@mission_protocol.on_message(model=MissionRequest)
async def create_mission(ctx: Context, sender: str, msg: MissionRequest):
    """
    Create a new humanitarian mission on the blockchain
    """
    ctx.logger.info(f"Creating mission: {msg.location}")
    
    if blockchain_enabled:
        try:
            # Use MeTTa to validate and optimize the mission
            if metta_enabled and reasoner:
                validation = reasoner.validate_mission({
                    "location": msg.location,
                    "description": msg.description,
                    "items": msg.items,
                    "funding_goal": msg.funding_goal
                })
                
                if not validation['is_valid']:
                    await ctx.send(sender, MissionResponse(
                        success=False,
                        message=f"Mission validation failed: {validation['reason']}"
                    ))
                    return
            
            # Create mission on blockchain
            tx_hash, mission_id = blockchain.create_mission(
                location=msg.location,
                description=msg.description,
                items=msg.items,
                funding_goal=msg.funding_goal
            )
            
            await ctx.send(sender, MissionResponse(
                success=True,
                mission_id=mission_id,
                message=f"Mission #{mission_id} created successfully in {msg.location}!",
                transaction_hash=tx_hash
            ))
            
            ctx.logger.info(f"Mission created: #{mission_id}, tx: {tx_hash}")
            
        except Exception as e:
            ctx.logger.error(f"Mission creation failed: {e}")
            await ctx.send(sender, MissionResponse(
                success=False,
                message=f"Failed to create mission: {str(e)}"
            ))
    else:
        await ctx.send(sender, MissionResponse(
            success=False,
            message="Blockchain interface not available"
        ))


@mission_protocol.on_message(model=MissionQuery)
async def query_missions(ctx: Context, sender: str, msg: MissionQuery):
    """
    Query mission information
    """
    ctx.logger.info(f"Querying missions: {msg}")
    
    if blockchain_enabled:
        try:
            missions = blockchain.get_missions(
                mission_id=msg.mission_id,
                location=msg.location,
                status=msg.status
            )
            
            summary = f"Found {len(missions)} mission(s)"
            if msg.location:
                summary += f" in {msg.location}"
            if msg.status:
                summary += f" with status {msg.status}"
            
            await ctx.send(sender, MissionInfo(
                missions=missions,
                total_count=len(missions),
                summary=summary
            ))
            
        except Exception as e:
            ctx.logger.error(f"Mission query failed: {e}")
            await ctx.send(sender, MissionInfo(
                missions=[],
                total_count=0,
                summary=f"Query failed: {str(e)}"
            ))


# Register protocols
agent.include(chat_protocol)
agent.include(mission_protocol)


# Startup and periodic tasks
@agent.on_event("startup")
async def startup(ctx: Context):
    """Agent startup tasks"""
    ctx.logger.info(f"🚀 AidRoute Agent starting...")
    ctx.logger.info(f"Agent Address: {agent.address}")
    ctx.logger.info(f"Agent Name: {AGENT_NAME}")
    
    if blockchain_enabled:
        ctx.logger.info(f"📍 Contract: {CONTRACT_ADDRESS}")
        ctx.logger.info(f"💰 PYUSD: {PYUSD_ADDRESS}")
    
    if metta_enabled:
        ctx.logger.info("🧠 MeTTa reasoning engine active")
    
    ctx.logger.info(f"🌐 Agent ready at port {AGENT_PORT}")
    ctx.logger.info(f"🔗 Agentverse: https://agentverse.ai")
    ctx.logger.info(f"💬 Connect via ASI:One for chat!")


@agent.on_interval(period=300.0)  # Every 5 minutes
async def monitor_missions(ctx: Context):
    """
    Periodic monitoring of missions and blockchain state
    """
    if blockchain_enabled:
        try:
            # Get pending missions that need attention
            pending = blockchain.get_missions(status="Pending")
            
            if pending:
                ctx.logger.info(f"📊 Monitoring: {len(pending)} pending missions")
                
                # Use MeTTa to prioritize missions
                if metta_enabled and reasoner:
                    priorities = reasoner.prioritize_missions(pending)
                    ctx.logger.info(f"🎯 Mission priorities updated")
            
        except Exception as e:
            ctx.logger.error(f"Monitoring error: {e}")


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════════╗
║                    AidRoute AI Agent                             ║
║              Humanitarian Logistics Coordinator                  ║
║                                                                  ║
║  Powered by Artificial Superintelligence Alliance:              ║
║  • Fetch.ai uAgents                                             ║
║  • SingularityNET MeTTa                                         ║
║  • PYUSD Smart Contracts                                        ║
║  • ASI:One Chat Protocol                                        ║
╚══════════════════════════════════════════════════════════════════╝
    """)
    
    agent.run()

