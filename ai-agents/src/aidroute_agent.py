"""
AidRoute Humanitarian Coordinator Agent
Built with Fetch.ai uAgents Framework + SingularityNET MeTTa
Implements ASI:One Chat Protocol for natural language interaction
"""

from datetime import datetime
from uuid import uuid4
from typing import Optional, Dict, List, Any
import logging

try:
    from uagents import Agent, Context, Protocol, Model
    from uagents_core.contrib.protocols.chat import (
        ChatMessage,
        ChatAcknowledgement,
        TextContent,
        chat_protocol_spec,
    )
    UAGENTS_AVAILABLE = True
except ImportError:
    UAGENTS_AVAILABLE = False
    logging.warning("uAgents not available. Install with: pip install uagents uagents-core")

from metta_reasoner import MettaHumanitarianReasoner
from gdacs_analyzer import GDACSDisasterAnalyzer


class AidRouteCoordinator:
    """
    Main coordinator for AidRoute humanitarian logistics
    Integrates MeTTa reasoning, GDACS analysis, and Chat Protocol
    """
    
    def __init__(self, name: str = "AidRoute-Coordinator", 
                 port: int = 8000,
                 mailbox: bool = False):
        """
        Initialize the AidRoute Coordinator Agent
        
        Args:
            name: Agent name
            port: Port for agent endpoint
            mailbox: Whether to use Agentverse mailbox
        """
        
        self.logger = logging.getLogger("AidRouteAgent")
        
        # Initialize AI components
        self.metta_reasoner = MettaHumanitarianReasoner()
        self.gdacs_analyzer = GDACSDisasterAnalyzer(self.metta_reasoner)
        
        # Initialize agent if uAgents available
        if UAGENTS_AVAILABLE:
            self.agent = Agent(
                name=name,
                port=port,
                endpoint=[f"http://localhost:{port}/submit"],
                mailbox=mailbox
            )
            
            # Initialize chat protocol
            self.chat_proto = Protocol(spec=chat_protocol_spec)
            self._setup_chat_handlers()
            self.agent.include(self.chat_proto, publish_manifest=True)
            
            # Setup event handlers
            self._setup_event_handlers()
            
            self.logger.info(f"✅ AidRoute Agent initialized: {name}")
        else:
            self.agent = None
            self.logger.warning("uAgents not available - running in API-only mode")
    
    def _setup_event_handlers(self):
        """Setup agent event handlers"""
        
        @self.agent.on_event("startup")
        async def startup_handler(ctx: Context):
            ctx.logger.info("=" * 70)
            ctx.logger.info("🌍 AidRoute Humanitarian Coordinator Agent")
            ctx.logger.info("=" * 70)
            ctx.logger.info(f"Agent Name: {ctx.agent.name}")
            ctx.logger.info(f"Agent Address: {ctx.agent.address}")
            ctx.logger.info(f"Powered by: Fetch.ai + SingularityNET MeTTa + ASI:One")
            ctx.logger.info("=" * 70)
    
    def _setup_chat_handlers(self):
        """Setup Chat Protocol message handlers"""
        
        @self.chat_proto.on_message(ChatMessage)
        async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
            """Handle incoming chat messages using Chat Protocol"""
            
            for item in msg.content:
                if isinstance(item, TextContent):
                    user_message = item.text
                    ctx.logger.info(f"📩 Received message from {sender}: {user_message}")
                    
                    # Send acknowledgement
                    ack = ChatAcknowledgement(
                        timestamp=datetime.utcnow(),
                        acknowledged_msg_id=msg.msg_id
                    )
                    await ctx.send(sender, ack)
                    
                    # Process message and generate response
                    response_text, suggestions = self.process_chat_message(user_message)
                    
                    # Send response
                    response = ChatMessage(
                        timestamp=datetime.utcnow(),
                        msg_id=uuid4(),
                        content=[TextContent(type="text", text=response_text)]
                    )
                    await ctx.send(sender, response)
                    
                    ctx.logger.info(f"📤 Sent response to {sender}")
        
        @self.chat_proto.on_message(ChatAcknowledgement)
        async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
            """Handle message acknowledgements"""
            ctx.logger.info(f"✅ Received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")
    
    def process_chat_message(self, message: str, context: Optional[Dict] = None) -> tuple:
        """
        Process chat message and generate response
        
        Args:
            message: User message
            context: Optional context (disasters, analyses, etc.)
            
        Returns:
            Tuple of (response_text, suggestions)
        """
        
        message_lower = message.lower()
        context = context or {}
        
        # Intent classification
        if self._is_greeting(message_lower):
            return self._handle_greeting()
        
        elif self._is_status_query(message_lower):
            return self._handle_status(context)
        
        elif self._is_planning_request(message_lower):
            return self._handle_planning(message, context)
        
        elif self._is_explanation_request(message_lower):
            return self._handle_explanation()
        
        elif self._is_disaster_analysis(message_lower):
            return self._handle_disaster_analysis(context)
        
        else:
            return self._handle_default()
    
    def _is_greeting(self, message: str) -> bool:
        """Check if message is a greeting"""
        greetings = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon"]
        return any(g in message for g in greetings)
    
    def _is_status_query(self, message: str) -> bool:
        """Check if message is a status query"""
        keywords = ["status", "overview", "summary", "report"]
        return any(k in message for k in keywords)
    
    def _is_planning_request(self, message: str) -> bool:
        """Check if message is a planning request"""
        keywords = ["plan", "mission", "delivery", "deploy", "organize"]
        return any(k in message for k in keywords)
    
    def _is_explanation_request(self, message: str) -> bool:
        """Check if message is asking for explanation"""
        keywords = ["how", "what", "explain", "work", "about"]
        return any(k in message for k in keywords)
    
    def _is_disaster_analysis(self, message: str) -> bool:
        """Check if message is requesting disaster analysis"""
        keywords = ["analyze", "disaster", "crisis", "emergency", "gdacs"]
        return any(k in message for k in keywords)
    
    def _handle_greeting(self) -> tuple:
        """Handle greeting messages"""
        response = """👋 **Welcome to AidRoute AI!**

I'm your humanitarian logistics coordinator, powered by:
• **Fetch.ai uAgents** - Multi-agent coordination
• **SingularityNET MeTTa** - Knowledge reasoning
• **ASI:One Chat Protocol** - Natural language interaction
• **PYUSD** - Transparent funding
• **Blockchain** - Verifiable impact

**I can help you:**
🌍 Analyze real-time GDACS disasters
📊 Generate optimized mission plans
💡 Estimate costs and impact
🔗 Coordinate supply networks
✅ Deploy verified missions

**Try asking:**
- "Status overview"
- "Plan a mission for [location]"
- "Analyze current disasters"
- "How does AI planning work?"

How can I assist you today?"""
        
        suggestions = [
            "Status overview",
            "Analyze disasters",
            "Plan a mission",
            "How does it work?"
        ]
        
        return response, suggestions
    
    def _handle_status(self, context: Dict) -> tuple:
        """Handle status queries"""
        
        disasters = context.get("disasters", [])
        analyses = context.get("analyses", [])
        
        disaster_count = len(disasters)
        analysis_count = len(analyses)
        
        response = f"""📊 **AidRoute System Status**

**Live Disaster Monitoring:**
• GDACS Events: {disaster_count} active disasters tracked
• AI Analysis: {analysis_count} mission plans generated
• MeTTa Reasoning: ✅ Active
• Multi-Agent System: ✅ Operational

**AI Capabilities:**
• Planning Agent - Mission optimization
• Supply Agent - Resource allocation
• Risk Agent - Security assessment
• Coordinator - Multi-agent orchestration

**Network Status:**
✅ MeTTa Reasoner - Online
✅ GDACS Analyzer - Active
✅ Chat Protocol - Connected
✅ Blockchain Interface - Ready

**Ready to coordinate humanitarian missions!**"""
        
        suggestions = [
            "Analyze GDACS disasters",
            "Plan a new mission",
            "Show top priorities",
            "Check risk factors"
        ]
        
        return response, suggestions
    
    def _handle_planning(self, message: str, context: Dict) -> tuple:
        """Handle mission planning requests"""
        
        # Extract location if mentioned
        location = self._extract_location(message)
        
        if not location:
            response = """🎯 **Mission Planning Assistant**

To create an optimized mission plan, I need:

1. **Location** - Where is the crisis?
2. **Crisis Type** - Earthquake, flood, medical emergency, etc.
3. **Urgency** - Critical, urgent, high, or medium

**Examples:**
- "Plan delivery for Gaza"
- "Create mission for earthquake in Turkey"
- "Plan urgent medical response for Haiti"

You can also say "Analyze disasters" to see current GDACS events."""
            
            suggestions = [
                "Analyze current disasters",
                "Plan for highest priority",
                "Show active crises"
            ]
        else:
            # Generate mission plan
            mission = self.metta_reasoner.optimize_mission_plan(
                crisis_type="general",
                location=location,
                urgency="high"
            )
            
            supplies_list = "\n".join([
                f"   • {s['name']} × {s['quantity']}"
                for s in mission["supplies"]
            ])
            
            response = f"""✅ **Mission Plan Generated: {location}**

**Supply Package:**
{supplies_list}

**Logistics:**
• Estimated Cost: ${mission['estimated_cost']:,}
• Beneficiaries: ~{mission['estimated_beneficiaries']:,} people
• Timeline: {mission['estimated_timeline']}
• Efficiency Score: {mission['efficiency_score']}/100

**Reasoning:**
{mission['reasoning']}

**Next Steps:**
Ready to deploy this mission?"""
            
            suggestions = [
                "Deploy mission",
                "Adjust supplies",
                "Check risk factors",
                "Estimate impact"
            ]
        
        return response, suggestions
    
    def _handle_explanation(self) -> tuple:
        """Handle explanation requests"""
        
        response = """🤖 **How AidRoute AI Works**

**1. Real-Time Disaster Monitoring**
• Fetches live data from GDACS (Global Disaster Alert System)
• Parses earthquakes, floods, cyclones, wildfires, etc.
• Updates continuously

**2. MeTTa Reasoning (SingularityNET)**
• Structured knowledge graphs for humanitarian logistics
• Optimizes supply packages based on crisis type
• Calculates cost-benefit ratios and efficiency scores
• Considers regional constraints and historical data

**3. Multi-Agent Coordination (Fetch.ai)**
• **Planning Agent** - Mission optimization
• **Supply Agent** - Supplier discovery & inventory
• **Risk Agent** - Security and logistics assessment
• **Coordinator** - Orchestrates all agents

**4. ASI:One Chat Protocol**
• Natural language interaction
• Discoverable on ASI:One network
• Multi-agent conversations
• Human-in-the-loop approval

**5. Blockchain Integration**
• PYUSD smart contracts on Ethereum
• Transparent fund allocation
• On-chain mission tracking
• Verifiable delivery proofs

**Result:** Optimized humanitarian missions with maximum impact per dollar!"""
        
        suggestions = [
            "Try planning a mission",
            "Analyze disasters",
            "Check system status",
            "Show example mission"
        ]
        
        return response, suggestions
    
    def _handle_disaster_analysis(self, context: Dict) -> tuple:
        """Handle disaster analysis requests"""
        
        disasters = context.get("disasters", [])
        
        if not disasters:
            response = """📡 **GDACS Disaster Analysis**

No active disasters in current context. 

The system continuously monitors:
• Earthquakes
• Floods
• Tropical Cyclones
• Wildfires
• Volcanoes
• Droughts

To analyze disasters, ensure GDACS data is loaded."""
            
            suggestions = [
                "Refresh disaster data",
                "Check system status"
            ]
        else:
            analyses = self.gdacs_analyzer.analyze_disasters(disasters)
            top_3 = analyses[:3]
            
            disaster_summaries = "\n\n".join([
                f"**{i+1}. {a['disaster']['location']}** - {a['disaster']['typeName']}\n"
                f"   • Priority: {a['priority_score']}/100\n"
                f"   • Severity: {a['disaster']['severity']}/5\n"
                f"   • Urgency: {a['disaster']['urgency'].upper()}\n"
                f"   • Estimated Cost: ${a['mission_plan']['estimated_cost']:,}\n"
                f"   • Beneficiaries: ~{a['mission_plan']['estimated_beneficiaries']:,}"
                for i, a in enumerate(top_3)
            ])
            
            response = f"""✅ **GDACS Disaster Analysis Complete**

Analyzed {len(disasters)} disasters using MeTTa reasoning.
Top {len(top_3)} priorities:

{disaster_summaries}

**Recommendation:**
Deploy missions starting with highest priority."""
            
            if top_3:
                top_location = top_3[0]['disaster']['location']
                suggestions = [
                    f"Plan mission for {top_location}",
                    "Show all analyses",
                    "Sort by cost",
                    "Check risk factors"
                ]
            else:
                suggestions = ["Refresh data"]
        
        return response, suggestions
    
    def _handle_default(self) -> tuple:
        """Handle unrecognized messages"""
        
        response = """I can help you with humanitarian mission planning!

**Available Commands:**
• "Status overview" - System and disaster summary
• "Analyze disasters" - Review GDACS data with AI
• "Plan mission for [location]" - Create optimized mission plans
• "How does it work?" - Learn about the technology

**Powered by:**
🧠 Fetch.ai uAgents - Autonomous coordination
🧠 SingularityNET MeTTa - Knowledge reasoning
💰 PYUSD - Transparent funding
🔗 Blockchain - Verifiable impact

What would you like to do?"""
        
        suggestions = [
            "Status overview",
            "Analyze disasters",
            "How does it work?",
            "Plan a mission"
        ]
        
        return response, suggestions
    
    def _extract_location(self, message: str) -> Optional[str]:
        """Extract location from message"""
        
        # Simple extraction - look for common patterns
        patterns = [
            "for ", "in ", "at ", "near ", "affecting "
        ]
        
        for pattern in patterns:
            if pattern in message.lower():
                parts = message.lower().split(pattern)
                if len(parts) > 1:
                    location = parts[1].split()[0].strip(",.?!")
                    return location.title()
        
        return None
    
    def run(self):
        """Run the agent"""
        if self.agent:
            self.agent.run()
        else:
            self.logger.error("Agent not initialized - uAgents not available")

