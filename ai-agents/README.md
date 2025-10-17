# 🤖 AidRoute AI Agents

Humanitarian logistics coordination powered by:

- **Fetch.ai uAgents** - Multi-agent coordination framework
- **SingularityNET MeTTa** - Knowledge reasoning engine
- **ASI:One Chat Protocol** - Natural language interaction
- **GDACS Integration** - Real-time disaster monitoring

## 🏗️ Architecture

```
AidRoute AI System
├── MeTTa Reasoner (SingularityNET)
│   ├── Knowledge base for humanitarian logistics
│   ├── Supply optimization algorithms
│   └── Cost-benefit analysis
│
├── GDACS Analyzer
│   ├── Real-time disaster event processing
│   ├── Priority scoring
│   └── Risk assessment
│
├── AidRoute Coordinator (Fetch.ai uAgent)
│   ├── Chat Protocol implementation (ASI:One compatible)
│   ├── Natural language processing
│   ├── Multi-agent orchestration
│   └── Mission planning coordination
│
└── Flask API Bridge
    ├── /health - Health check
    ├── /chat - Natural language chat
    ├── /analyze - Disaster analysis
    └── /plan-mission - Mission planning
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ai-agents
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)

Create a `.env` file:

```bash
# API Keys (optional)
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Blockchain (optional)
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your_key
PRIVATE_KEY=your_private_key_here

# Service Configuration
AI_SERVICE_PORT=5001
FLASK_DEBUG=false
```

### 3. Start the Service

**Option A: Using the startup script (recommended)**

```bash
./start_ai_service.sh
```

**Option B: Manual start**

```bash
source venv/bin/activate
cd src
python api_bridge.py
```

The service will be available at `http://localhost:5001`

## 📡 API Endpoints

### Health Check

```bash
GET /health

Response:
{
  "status": "healthy",
  "services": {
    "reasoner": true,
    "analyzer": true
  }
}
```

### Chat (Natural Language)

```bash
POST /chat

Request:
{
  "message": "Plan a mission for Gaza",
  "context": {
    "disasters": [...],
    "analyses": [...]
  }
}

Response:
{
  "message": "✅ Mission Plan Generated...",
  "suggestions": ["Deploy mission", "Adjust supplies"],
  "mission_data": {
    "location": "Gaza",
    "supplies": [...],
    "estimated_cost": 15000,
    "estimated_beneficiaries": 800,
    "estimated_timeline": "5-7 days",
    "efficiency_score": 85
  }
}
```

### Analyze Disasters

```bash
POST /analyze

Request:
{
  "disasters": [
    {
      "eventType": "EQ",
      "typeName": "Earthquake",
      "location": "Turkey",
      "severity": 5,
      "urgency": "critical",
      "title": "Magnitude 7.8 Earthquake",
      "description": "..."
    }
  ]
}

Response: Array of analyzed disasters with mission plans
```

### Plan Mission

```bash
POST /plan-mission

Request:
{
  "crisis_type": "earthquake",
  "location": "Turkey",
  "urgency": "critical",
  "budget": 50000
}

Response:
{
  "supplies": [...],
  "estimated_cost": 15000,
  "estimated_beneficiaries": 800,
  "efficiency_score": 85,
  "estimated_timeline": "3-5 days",
  "reasoning": "...",
  "crisis_category": "natural-disaster"
}
```

## 🧠 MeTTa Knowledge Base

The MeTTa reasoning engine includes:

### Crisis Types

- `earthquake` - Natural disaster, urgent
- `flood` - Natural disaster, high
- `cyclone` - Natural disaster, critical
- `wildfire` - Natural disaster, high
- `volcano` - Natural disaster, critical
- `drought` - Food insecurity, medium
- `medical-emergency` - Health crisis, urgent

### Supply Packages

- `medical-kit-basic` - $250, 50 beneficiaries
- `medical-kit-advanced` - $800, 100 beneficiaries
- `shelter-tent-family` - $800, 6 beneficiaries
- `water-purification-kit` - $400, 100 beneficiaries
- `food-package-family` - $150, 6 beneficiaries
- `hygiene-family-kit` - $80, 5 beneficiaries

### Regional Factors

- Gaza: 1.5x (restricted access)
- Syria: 1.8x (conflict zone)
- Yemen: 1.6x (restricted)
- Haiti: 1.3x (logistics challenge)
- Afghanistan: 1.7x (conflict zone)

## 🌐 Fetch.ai uAgent Integration

The AidRoute Coordinator is a fully-functional Fetch.ai uAgent that:

### 1. Implements Chat Protocol (ASI:One Compatible)

```python
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    chat_protocol_spec,
)

# Agent can communicate with other agents using standard protocol
coordinator = AidRouteCoordinator(
    name="aidroute-coordinator",
    port=8000,
    mailbox=True  # For Agentverse integration
)
```

### 2. Discoverable on Agentverse

- The agent can be registered on Agentverse
- Accessible via ASI:One chat interface
- Supports mailbox communication

### 3. Multi-Agent Ready

- Can coordinate with other uAgents
- Supports agent-to-agent messaging
- Implements standard Fetch.ai protocols

## 🔗 Frontend Integration

The Next.js frontend connects via these API routes:

### `/app/api/ai/chat/route.ts`

```typescript
const response = await fetch("http://localhost:5001/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message, context }),
});
```

### `/app/api/ai/analyze-disasters/route.ts`

```typescript
const response = await fetch("http://localhost:5001/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ disasters }),
});
```

## 📊 Chat Commands

The AI agent understands natural language. Try these commands:

### Greetings

- "Hello"
- "Hi there"
- "Hey AI"

### Status Queries

- "Status overview"
- "System status"
- "Show summary"

### Planning Requests

- "Plan a mission for Gaza"
- "Create mission for earthquake in Turkey"
- "Plan urgent medical response"

### Disaster Analysis

- "Analyze current disasters"
- "Show GDACS events"
- "Check active crises"

### Explanations

- "How does AI planning work?"
- "What is MeTTa?"
- "Explain the system"

## 🧪 Testing

### Test Health Endpoint

```bash
curl http://localhost:5001/health
```

### Test Chat

```bash
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what can you do?"}'
```

### Test Mission Planning

```bash
curl -X POST http://localhost:5001/plan-mission \
  -H "Content-Type: application/json" \
  -d '{
    "crisis_type": "earthquake",
    "location": "Turkey",
    "urgency": "critical"
  }'
```

## 🔧 Development

### Project Structure

```
ai-agents/
├── src/
│   ├── __init__.py
│   ├── metta_reasoner.py       # MeTTa reasoning engine
│   ├── gdacs_analyzer.py        # GDACS disaster analyzer
│   ├── aidroute_agent.py        # Fetch.ai uAgent
│   └── api_bridge.py            # Flask API server
├── requirements.txt
├── start_ai_service.sh
└── README.md
```

### Adding New Crisis Types

Edit `metta_reasoner.py`:

```python
def _initialize_knowledge_base(self):
    self.metta.run("""
        (crisis-type "new-crisis" category urgency)
        (supply-package "new-supply" category cost weight urgency)
    """)
```

### Extending Chat Capabilities

Edit `aidroute_agent.py`:

```python
def process_chat_message(self, message: str, context: Optional[Dict]):
    # Add new intent detection
    if self._is_custom_intent(message):
        return self._handle_custom_intent(context)
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or use different port
AI_SERVICE_PORT=5002 python src/api_bridge.py
```

### MeTTa Not Available

```bash
# Install hyperon
pip install hyperon>=0.2.0
```

### uAgents Not Available

```bash
# Install uAgents
pip install uagents>=0.17.0 uagents-core>=0.8.0
```

### Import Errors

```bash
# Make sure you're in the right directory
cd ai-agents/src
python api_bridge.py
```

## 🚀 Deployment Options

### 1. Local Development

- Run `./start_ai_service.sh`
- Service at `http://localhost:5001`

### 2. Agentverse Mailbox Agent

```python
coordinator = AidRouteCoordinator(
    name="aidroute",
    port=8000,
    mailbox=True,  # Enable mailbox
    publish_agent_details=True,
    readme_path="README.md"
)
coordinator.run()
```

### 3. Docker Deployment

```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ ./src/
CMD ["python", "src/api_bridge.py"]
```

## 📚 Learn More

- **Fetch.ai Docs**: https://fetch.ai/docs
- **SingularityNET MeTTa**: https://metta-lang.dev
- **ASI:One**: https://asi1.ai
- **GDACS**: https://gdacs.org

## 📝 License

MIT License - See project root for details

## 🤝 Contributing

Contributions welcome! This is a hackathon project showcasing ASI Alliance technologies.

---

**Built with 💙 for the ASI Alliance Hackathon**
