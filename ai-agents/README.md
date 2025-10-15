# AidRoute AI Agents

**Autonomous Humanitarian Logistics Coordination**

Powered by the **Artificial Superintelligence Alliance**:

- 🤖 **Fetch.ai uAgents** - Autonomous agent framework
- 🧠 **SingularityNET MeTTa** - Knowledge graphs & reasoning
- 💰 **PYUSD Smart Contracts** - Transparent funding
- 💬 **ASI:One Chat Protocol** - Human-agent interaction

---

## 🌟 Overview

The AidRoute AI Agent is an autonomous coordinator for humanitarian missions that:

1. **Monitors** the blockchain for new missions and funding
2. **Reasons** about optimal resource allocation using MeTTa
3. **Interacts** with users via natural language (ASI:One)
4. **Coordinates** multi-agent systems for complex logistics
5. **Optimizes** mission plans based on humanitarian knowledge
6. **Verifies** deliveries and maintains transparency

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ASI:One Chat Interface                  │
│            (Human → Agent Natural Interaction)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              AidRoute Humanitarian Agent                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Fetch.ai uAgent Core                               │  │
│  │  • Autonomous behavior                              │  │
│  │  • Message protocols                                │  │
│  │  • Event handling                                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌────────────────┐          ┌─────────────────────────┐  │
│  │ MeTTa Reasoner │◄────────►│  Blockchain Interface   │  │
│  │                │          │                         │  │
│  │ • Knowledge    │          │  • Smart contract calls │  │
│  │ • Optimization │          │  • Event monitoring     │  │
│  │ • Validation   │          │  • Transaction signing  │  │
│  └────────────────┘          └─────────────────────────┘  │
└────────────────────┬───────────────────┬───────────────────┘
                     │                   │
         ┌───────────▼───────┐  ┌────────▼──────────┐
         │  MeTTa Knowledge  │  │  PYUSD Contract   │
         │   Graph Storage   │  │  (On Sepolia)     │
         └───────────────────┘  └───────────────────┘
```

---

## 🚀 Quick Start

### 1. Installation

```bash
cd ai-agents
pip install -r requirements.txt
```

### 2. Configuration

Create a `.env` file (see `.env.example`):

```env
AGENT_SEED="your_unique_seed_phrase"
AGENT_NAME="AidRoute Humanitarian Coordinator"
CONTRACT_ADDRESS=0x681735982373ae65a8f8b2074922a924780ba360
PYUSD_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_here
```

### 3. Run the Agent

```bash
python src/aidroute_agent.py
```

### 4. Register on Agentverse

```bash
python register_agentverse.py
```

### 5. Connect via ASI:One

1. Go to https://asi1.ai/
2. Search for "AidRoute"
3. Start chatting with the agent!

---

## 💬 Chat Examples

### Ask the Agent

**You:** "Create a mission in Gaza for medical supplies"

**Agent:** "I can help you create a humanitarian mission! 🌍..."

---

**You:** "Show me active missions"

**Agent:** "📊 AidRoute System Status

- Active Missions: 3
- Total Donations: 12,500 PYUSD
  ..."

---

**You:** "Optimize my mission plan for Syria"

**Agent:** "🧠 AI-Optimized Mission Plan

Based on conflict zone dynamics and supply chain analysis..."

---

## 🧠 MeTTa Knowledge Graph

The agent uses MeTTa for structured reasoning about:

### Crisis Types

- Medical Emergency
- Natural Disaster
- Conflict Zones
- Food Security
- Water Crisis
- Refugee Support

### Supply Categories

- Medical (Perishable)
- Food (Perishable)
- Water (Essential)
- Shelter (Durable)
- Clothing (Durable)

### Regional Constraints

- Access limitations
- Conflict zones
- Infrastructure status
- Logistics multipliers

### Cost Estimation

- Base supply costs
- Logistics multipliers
- Regional adjustments
- Timeline estimates

---

## 📡 Agent Protocols

### Chat Protocol

**Purpose:** Human-agent interaction via ASI:One

**Messages:**

- `ChatRequest` - User message
- `ChatResponse` - Agent response with suggestions

**Capabilities:**

- Mission creation assistance
- Status queries
- Donation guidance
- Plan optimization
- General queries

### Mission Management Protocol

**Purpose:** Blockchain mission operations

**Messages:**

- `MissionRequest` - Create new mission
- `MissionResponse` - Creation result
- `MissionQuery` - Query missions
- `MissionInfo` - Mission data

**Operations:**

- Create missions on-chain
- Query mission status
- Monitor funding
- Track deployments

---

## 🔄 Agent Behavior

### On Startup

1. Connect to Sepolia blockchain
2. Initialize MeTTa knowledge base
3. Register protocols
4. Start listening for messages

### Periodic Tasks (Every 5 min)

1. Monitor pending missions
2. Check funding status
3. Prioritize urgent needs
4. Update knowledge base

### On Message

1. Parse intent
2. Query MeTTa for reasoning
3. Execute blockchain calls if needed
4. Respond with suggestions

---

## 🎯 Use Cases

### 1. Mission Creation

"I need to send medical supplies to Gaza"
→ Agent optimizes supply list, estimates costs, creates mission

### 2. Donation Guidance

"How can I help?"
→ Agent shows urgent missions, guides donation process

### 3. Status Monitoring

"What's the status of Mission #5?"
→ Agent queries blockchain, shows real-time data

### 4. Logistics Optimization

"Suggest the best route for delivering to Yemen"
→ MeTTa reasons about constraints, suggests optimal plan

### 5. Multi-Agent Coordination

Supplier Agent + Logistics Agent + Verification Agent
→ Coordinate complex delivery workflows

---

## 🔗 Integration Points

### Agentverse

- **Discovery**: Search "AidRoute" on Agentverse
- **Hosting**: Agent can be hosted on Agentverse cloud
- **Orchestration**: Multi-agent coordination

### ASI:One

- **Chat Protocol**: Natural language interface
- **Agent Discovery**: Find AidRoute via chat
- **Function Calling**: Execute mission operations

### Smart Contract

- **Read**: Query missions, stats, funding
- **Write**: Create missions, deploy funds
- **Events**: Listen for on-chain updates

### MeTTa Knowledge

- **Reasoning**: Optimize mission plans
- **Validation**: Check mission data
- **Prioritization**: Rank urgent needs

---

## 📊 Agent Metrics

The agent tracks:

- **Missions Created**: Total missions initiated
- **Funds Coordinated**: Total PYUSD deployed
- **Beneficiaries**: People helped
- **Response Time**: Average query response
- **Optimization Score**: Plan efficiency

---

## 🛠️ Development

### Project Structure

```
ai-agents/
├── src/
│   ├── __init__.py
│   ├── aidroute_agent.py          # Main agent
│   ├── metta_reasoner.py          # MeTTa integration
│   └── blockchain_interface.py    # Smart contract interface
├── metta-knowledge/
│   └── humanitarian.metta         # Knowledge base
├── requirements.txt
├── README.md
└── register_agentverse.py         # Registration script
```

### Testing

```bash
# Test MeTTa reasoner
python src/metta_reasoner.py

# Test blockchain interface
python src/blockchain_interface.py

# Test full agent (local)
python src/aidroute_agent.py
```

---

## 🏆 Hackathon Alignment

### Qualification Criteria

#### 1. Functionality & Technical Implementation (25%)

✅ Agent system works as intended  
✅ Real-time communication & reasoning  
✅ Blockchain integration functional

#### 2. Use of ASI Alliance Tech (20%)

✅ Registered on Agentverse  
✅ Chat Protocol live for ASI:One  
✅ uAgents framework utilized  
✅ MeTTa Knowledge Graphs integrated

#### 3. Innovation & Creativity (20%)

✅ Novel application to humanitarian logistics  
✅ Multi-agent coordination for crisis response  
✅ AI-optimized resource allocation

#### 4. Real-World Impact & Usefulness (20%)

✅ Solves actual humanitarian challenges  
✅ Transparent, blockchain-verified aid  
✅ Scalable to global crisis response

#### 5. User Experience & Presentation (15%)

✅ Natural language chat interface  
✅ Clear mission guidance  
✅ Comprehensive documentation

---

## 🎁 Prize Categories

### 🥇 First Place - $3,500

**Best use of ASI:One + MeTTa**

- ✅ ASI:One chat interface for human-agent interaction
- ✅ MeTTa structured reasoning for mission optimization
- ✅ Real-world impact: Humanitarian aid coordination
- ✅ Creative problem-solving with AI

### 🥈 Second Place - $2,500

**Best Agentverse Launch**

- ✅ Clear agent listing on Agentverse
- ✅ Discoverable via ASI:One
- ✅ MeTTa powers logic and reasoning
- ✅ High usability and adoption potential

### 🥉 Third Place - $1,750

**Best Multi-Agent System**

- ✅ Ready for multi-agent coordination
- ✅ Fetch.ai agents + MeTTa knowledge
- ✅ Cross-chain communication (PYUSD on Ethereum)
- ✅ Complex task coordination

---

## 📚 Resources

### Documentation

- [Fetch.ai Docs](https://innovationlab.fetch.ai/resources/docs/intro)
- [MeTTa Integration](https://github.com/fetchai/innovation-lab-examples/tree/main/web3/singularity-net-metta)
- [MeTTa Knowledge Graphs](https://metta-lang.dev/docs/learn/tutorials/python_use/metta_python_basics.html)
- [Agentverse](https://innovationlab.fetch.ai/resources/docs/agentverse/)
- [ASI:One](https://asi1.ai/)

### Links

- **Agentverse**: https://agentverse.ai
- **ASI:One**: https://asi1.ai/
- **Fetch.ai**: https://fetch.ai
- **SingularityNET**: https://singularitynet.io

---

## 🤝 Contributing

Want to enhance the AidRoute agent?

1. Fork the repository
2. Add new MeTTa knowledge
3. Implement new protocols
4. Test with Agentverse
5. Submit PR

---

## 📜 License

MIT License - See LICENSE file

---

## 🌍 Impact

**AidRoute** + **ASI Alliance** = **Autonomous Humanitarian Logistics**

By combining blockchain transparency (PYUSD), AI reasoning (MeTTa), and autonomous coordination (uAgents), we're revolutionizing how humanitarian aid reaches those who need it most.

**Every mission. Every donation. Every delivery. Verified. Optimized. Transparent.**

---

Built with ❤️ for the Artificial Superintelligence Alliance Hackathon
