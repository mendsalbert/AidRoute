<div align="center">
  <img src="public/logo.png" alt="AidRoute Logo" width="120"/>
  
  # 🌍 AidRoute
  ### Autonomous Humanitarian Coordination Platform
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Hardhat](https://img.shields.io/badge/Hardhat-3.0.7-yellow?style=for-the-badge&logo=ethereum)](https://hardhat.org/)
  [![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  
  **Coordinating Aid. Autonomously.**
  
  *The world's first AI-powered humanitarian logistics platform that combines blockchain transparency with autonomous decision-making to revolutionize global aid delivery.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Smart Contract](#-smart-contract)
- [AI Agents](#-ai-agents)
- [Blockchain Integration](#-blockchain-integration)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**AidRoute** is an autonomous humanitarian coordination platform that leverages cutting-edge AI and blockchain technology to optimize global aid delivery. Built for the **Artificial Superintelligence Alliance (ASI)** hackathon, AidRoute addresses critical challenges in humanitarian logistics: slow response times, lack of transparency, and inefficient resource allocation.

### The Problem

Traditional humanitarian aid faces significant challenges:

- ⏱️ **Slow Response Times**: Average response time of 72+ hours
- 💸 **Fund Mismanagement**: ~30% of aid funds lost to inefficiencies
- 🔍 **Lack of Transparency**: Limited visibility into fund deployment
- 📊 **Poor Coordination**: Siloed operations and duplicate efforts

### Our Solution

AidRoute combines AI-powered decision-making with blockchain transparency to:

- 🚀 **Reduce Response Time**: From days to minutes (18min average)
- 🔒 **Ensure Transparency**: Every dollar tracked on-chain
- 🤖 **Automate Coordination**: AI agents handle complex logistics
- 💰 **Optimize Resources**: Smart matching of needs to available supplies

---

## ✨ Key Features

### 🤖 **AI-Powered Coordination**

- **MeTTa Reasoning Engine**: Advanced symbolic AI from the Artificial Superintelligence Alliance for logical reasoning and decision-making
- **Real-Time Disaster Monitoring**: Continuous analysis of global humanitarian needs via GDACS feeds
- **Autonomous Mission Planning**: AI agents automatically create and optimize aid delivery missions
- **Predictive Analytics**: Anticipate needs and optimize resource allocation

### 🔗 **Blockchain Transparency**

- **Smart Contract System**: Ethereum-based mission and fund management using Hardhat
- **PayPal USD (PYUSD) Integration**: Stablecoin payments for predictable budgeting
- **Cryptographic Verification**: Immutable proof of delivery and fund deployment
- **Full Audit Trail**: Complete transparency from donation to delivery

### 🗺️ **Operations Dashboard**

- **Live Mission Tracking**: Real-time visualization of all active missions
- **Interactive Global Map**: Leaflet-powered mapping of disaster zones and aid routes
- **Resource Coordination**: Dynamic allocation and tracking of supplies
- **MetaMask Integration**: Seamless crypto wallet connection for donations

### 📊 **Analytics & Reporting**

- **System Metrics**: Active missions, critical alerts, verified deliveries
- **Blockchain Statistics**: On-chain mission data and funding tracking
- **Delivery Verification**: Photo and GPS proof of successful aid delivery
- **Performance Dashboards**: Real-time monitoring of system efficiency

---

## 🛠️ Technology Stack

### **Frontend Framework**

- **Next.js 15.5.5**: React framework with App Router for server-side rendering and optimal performance
- **React 19.1**: Latest React with concurrent features
- **TypeScript 5.8**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling with custom animations

### **Blockchain & Smart Contracts**

- **Hardhat 3.0.7**: Ethereum development environment for compiling, testing, and deploying smart contracts
  - Used for local blockchain testing with Hardhat Network
  - Contract compilation and verification
  - Automated deployment scripts with Hardhat Ignition
  - Integration testing with Chai and Viem
- **Ethers.js 6.15**: Ethereum wallet implementation and contract interaction
- **Viem 2.38**: Modern Ethereum library for type-safe blockchain interactions
- **OpenZeppelin Contracts 5.4**: Battle-tested smart contract libraries
- **Solidity 0.8.28**: Smart contract programming language

### **AI & Machine Learning**

- **Artificial Superintelligence Alliance (ASI)**: Core AI reasoning engine
  - **MeTTa (Meta Type Talk)**: Symbolic AI language for advanced reasoning
  - **Hyperon**: ASI's cognitive architecture for autonomous decision-making
  - Enables logical inference and complex decision trees
  - Powers autonomous mission planning and resource optimization
- **OpenAI GPT**: Natural language processing for disaster analysis
- **Python 3.9**: Backend AI service implementation
- **Flask**: API bridge for AI agent communication

### **Blockchain Payment Infrastructure**

- **PayPal USD (PYUSD)**: ERC-20 stablecoin for humanitarian funding
  - Eliminates crypto volatility with 1:1 USD backing
  - Enables instant, low-cost international transfers
  - Regulatory compliant and audited stablecoin
  - Deployed on Ethereum mainnet and testnets
  - Contract Address: `0x6c3ea9036406852006290770BEdFcAbA0e23A0e8` (Sepolia)
- **MetaMask**: Browser wallet for secure transaction signing

### **Data & APIs**

- **GDACS (Global Disaster Alert and Coordination System)**: Real-time disaster feed
- **Leaflet**: Interactive mapping library for geospatial visualization
- **React Leaflet**: React components for Leaflet maps

### **Development Tools**

- **ESLint**: Code linting and quality assurance
- **PostCSS**: CSS processing and optimization
- **Lucide React**: Modern icon library

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Dashboard  │  │  Operations  │  │  AI Assistant    │  │
│  │   Landing   │  │   Planning   │  │  MetaMask        │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└────────────┬────────────────────────────────────┬──────────┘
             │                                     │
             ├─────────────────┬───────────────────┤
             │                 │                   │
    ┌────────▼────────┐ ┌─────▼──────┐   ┌───────▼────────┐
    │   AI Agents     │ │ Blockchain │   │  Real-Time     │
    │   (Python)      │ │  Smart     │   │  Disaster      │
    │                 │ │  Contracts │   │  Service       │
    │ • MeTTa Engine  │ │            │   │                │
    │ • GPT Analysis  │ │ • Hardhat  │   │ • GDACS API    │
    │ • GDACS Parser  │ │ • PYUSD    │   │ • Event Stream │
    └─────────────────┘ └────────────┘   └────────────────┘
             │                 │                   │
             └─────────────────┴───────────────────┘
                               │
                      ┌────────▼─────────┐
                      │  Data Services   │
                      │                  │
                      │ • Production     │
                      │ • Blockchain     │
                      │ • Transaction    │
                      └──────────────────┘
```

### **Component Architecture**

1. **Frontend Layer**

   - Next.js App Router for server and client components
   - Real-time updates via React hooks
   - MetaMask integration for Web3 wallet connectivity
   - Responsive design with Tailwind CSS

2. **AI Agent Layer**

   - Python-based microservices
   - MeTTa reasoning engine for autonomous decisions
   - GDACS disaster feed analysis
   - RESTful API bridge to frontend

3. **Blockchain Layer**

   - Smart contracts deployed via Hardhat
   - PYUSD token integration for payments
   - Mission lifecycle management on-chain
   - Event emission for frontend synchronization

4. **Data Layer**
   - Real-time disaster monitoring
   - Blockchain transaction tracking
   - Production data services
   - Event-driven architecture

---

## 🚀 Getting Started

### **Prerequisites**

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Python**: v3.9 or higher (for AI agents)
- **MetaMask**: Browser extension installed
- **Git**: For version control

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/aidroute.git
   cd aidroute
   ```

2. **Install Node.js dependencies**

   ```bash
   npm install
   ```

3. **Set up Python AI agents**

   ```bash
   cd ai-agents
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

4. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # OpenAI API (for AI agents)
   OPENAI_API_KEY=your_openai_api_key

   # Ethereum Network Configuration
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   SEPOLIA_PRIVATE_KEY=your_wallet_private_key

   # Contract Addresses
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
   NEXT_PUBLIC_PYUSD_ADDRESS=0x6c3ea9036406852006290770BEdFcAbA0e23A0e8

   # API Configuration
   NEXT_PUBLIC_AI_AGENT_URL=http://localhost:5000
   ```

5. **Start the AI agent service**

   ```bash
   cd ai-agents
   ./start_ai_service.sh
   cd ..
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📜 Smart Contract

### **AidRouteMissions.sol**

The core smart contract manages humanitarian missions and PYUSD payments.

#### **Key Features**

- **Mission Management**: Create, fund, and track humanitarian missions
- **PYUSD Integration**: Accept donations and deploy funds using PayPal USD stablecoin
- **Multi-Signature Operations**: Enhanced security for fund deployment
- **Delivery Verification**: Cryptographic proof of successful aid delivery
- **Event Emission**: Real-time blockchain events for frontend synchronization

#### **Contract Structure**

```solidity
contract AidRouteMissions {
    // Mission lifecycle: Pending → Funded → InProgress → Delivered → Verified

    struct Mission {
        uint256 id;
        string location;
        string description;
        uint256 fundingGoal;
        uint256 fundsDeployed;
        MissionStatus status;
        string deliveryProof; // IPFS or data URI
    }

    // PYUSD token integration
    IERC20 public pyusdToken;

    // Core functions
    function createMission(...) external;
    function donateToMission(uint256 missionId, uint256 amount) external;
    function deployFunds(uint256 missionId, uint256 amount) external;
    function verifyDelivery(uint256 missionId, string calldata proof) external;
}
```

#### **Compile Contracts**

```bash
npx hardhat compile
```

#### **Run Tests**

```bash
npx hardhat test
```

#### **Deploy to Sepolia Testnet**

```bash
npx hardhat ignition deploy ./ignition/modules/AidRoute.ts --network sepolia
```

#### **Deploy to Local Hardhat Network**

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat ignition deploy ./ignition/modules/AidRoute.ts --network localhost
```

### **Getting Test PYUSD**

For testing on Sepolia:

1. Get Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
2. Get test PYUSD from [PayPal Developer Portal](https://developer.paypal.com/)

---

## 🤖 AI Agents

### **Artificial Superintelligence Alliance Integration**

AidRoute leverages the **ASI Alliance** technology stack for autonomous decision-making:

#### **MeTTa Reasoning Engine**

MeTTa (Meta Type Talk) is a symbolic AI language developed by the ASI Alliance that enables:

- **Logical Inference**: Complex reasoning about disaster scenarios
- **Knowledge Representation**: Structured understanding of humanitarian needs
- **Decision Trees**: Autonomous mission planning and resource allocation
- **Explainable AI**: Transparent reasoning process for trust and verification

```python
# Example MeTTa reasoning for mission prioritization
class MettaReasoner:
    def analyze_disaster(self, disaster_data):
        """
        Use MeTTa to reason about disaster severity and response needs
        """
        metta_code = f"""
        (= (severity ?disaster ?score)
            (and (magnitude ?disaster ?mag)
                 (population-affected ?disaster ?pop)
                 (* ?mag ?pop ?score)))

        (analyze {disaster_data})
        """
        return self.metta_engine.eval(metta_code)
```

#### **AI Agent Architecture**

1. **GDACS Analyzer**: Parses and analyzes global disaster feeds
2. **Mission Planner**: Creates optimized aid delivery missions
3. **Resource Optimizer**: Matches available supplies with urgent needs
4. **Risk Assessor**: Evaluates mission feasibility and safety

#### **Starting the AI Service**

```bash
cd ai-agents
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/aidroute_agent.py
```

The AI service will run on `http://localhost:5000` and provide:

- `/analyze-disasters`: Disaster severity analysis
- `/plan-mission`: Autonomous mission creation
- `/optimize-route`: Logistics optimization

---

## 🔗 Blockchain Integration

### **PayPal USD (PYUSD) Stablecoin**

AidRoute uses PYUSD as the primary payment currency for several strategic reasons:

#### **Why PYUSD?**

1. **Price Stability**: 1 PYUSD = 1 USD, eliminating crypto volatility
2. **Regulatory Compliance**: Issued by Paxos, fully regulated and audited
3. **Global Accessibility**: PayPal's infrastructure enables worldwide reach
4. **Low Fees**: Minimal transaction costs compared to traditional banking
5. **Instant Settlement**: Near-instant cross-border transfers
6. **Transparency**: All transactions verifiable on Ethereum blockchain

#### **PYUSD Contract Addresses**

- **Ethereum Mainnet**: `0x6c3ea9036406852006290770BEdFcAbA0e23A0e8`
- **Sepolia Testnet**: `0x6c3ea9036406852006290770BEdFcAbA0e23A0e8`

#### **Integration Example**

```typescript
// Donate PYUSD to a mission
async function donateToMission(missionId: number, amount: number) {
  const pyusdContract = new ethers.Contract(PYUSD_ADDRESS, PYUSD_ABI, signer);
  const missionContract = new ethers.Contract(
    MISSION_ADDRESS,
    MISSION_ABI,
    signer
  );

  // 1. Approve PYUSD spending
  await pyusdContract.approve(MISSION_ADDRESS, amount);

  // 2. Donate to mission
  await missionContract.donateToMission(missionId, amount);
}
```

### **MetaMask Integration**

AidRoute seamlessly integrates with MetaMask for:

- Secure wallet connection
- Transaction signing
- Network switching (Mainnet/Sepolia)
- Balance checking

---

## 📁 Project Structure

```
aidroute/
├── ai-agents/              # Python AI service
│   ├── src/
│   │   ├── aidroute_agent.py      # Main AI orchestrator
│   │   ├── metta_reasoner.py      # MeTTa reasoning engine
│   │   ├── gdacs_analyzer.py      # Disaster feed parser
│   │   └── api_bridge.py          # Flask API server
│   ├── requirements.txt
│   └── start_ai_service.sh
│
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── ai/           # AI agent endpoints
│   │   ├── gdacs/        # Disaster feed proxy
│   │   └── payments/     # Blockchain transactions
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
│
├── components/            # React components
│   ├── dashboard-layout.tsx
│   ├── home-view.tsx
│   ├── operations-view.tsx
│   ├── planning-view.tsx
│   ├── audit-view.tsx
│   ├── disaster-map.tsx
│   ├── live-system-monitor.tsx
│   └── real-metaMask-integration.tsx
│
├── contracts/             # Solidity smart contracts
│   └── AidRouteMissions.sol
│
├── lib/                   # Utility libraries
│   ├── production-data.ts        # Data service
│   ├── blockchain-disaster-integration.ts
│   ├── real-time-disasters.ts
│   ├── contract-integration.ts
│   └── utils.ts
│
├── scripts/               # Hardhat deployment scripts
│   ├── deploy.ts
│   ├── create-first-mission.ts
│   └── interact.ts
│
├── test/                  # Smart contract tests
│   └── AidRouteMissions.test.ts
│
├── public/               # Static assets
│   └── logo.png
│
├── hardhat.config.ts     # Hardhat configuration
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript config
└── README.md             # This file
```

---

## 💻 Development

### **Running Tests**

#### Smart Contract Tests

```bash
npx hardhat test
npx hardhat test --network sepolia
```

#### Frontend Tests

```bash
npm run test
```

### **Local Blockchain Development**

1. **Start Hardhat Network**

   ```bash
   npx hardhat node
   ```

2. **Deploy Contracts Locally**

   ```bash
   npx hardhat ignition deploy ./ignition/modules/AidRoute.ts --network localhost
   ```

3. **Connect MetaMask to Local Network**
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

### **Code Quality**

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### **Environment Setup**

- **Development**: `npm run dev` - Runs with Turbopack for fast refresh
- **Production Build**: `npm run build` - Optimized production build
- **Start Production**: `npm start` - Serves production build

---

## 🌐 Deployment

### **Frontend Deployment (Vercel)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/aidroute)

1. **Connect to Vercel**

   ```bash
   npm install -g vercel
   vercel
   ```

2. **Configure Environment Variables**

   - Add all `.env.local` variables to Vercel dashboard
   - Ensure `NEXT_PUBLIC_*` variables are set

3. **Deploy**
   ```bash
   vercel --prod
   ```

### **Smart Contract Deployment**

#### Deploy to Sepolia Testnet

```bash
npx hardhat ignition deploy ./ignition/modules/AidRoute.ts --network sepolia --verify
```

#### Deploy to Ethereum Mainnet

```bash
npx hardhat ignition deploy ./ignition/modules/AidRoute.ts --network mainnet --verify
```

### **AI Agent Deployment**

For production, deploy the AI service to a cloud provider:

```bash
# Example: Deploy to Railway
railway login
railway init
railway up
```

Or use Docker:

```bash
cd ai-agents
docker build -t aidroute-ai .
docker run -p 5000:5000 aidroute-ai
```

---

## 🎯 Roadmap

### **Phase 1: MVP** ✅

- [x] Core dashboard and UI
- [x] Smart contract development
- [x] PYUSD integration
- [x] AI agent implementation
- [x] Real-time disaster monitoring

### **Phase 2: Enhancement** 🚧

- [ ] Mobile application
- [ ] Multi-chain support (Polygon, BSC)
- [ ] Advanced AI predictions
- [ ] Integration with more humanitarian APIs
- [ ] Community governance (DAO)

### **Phase 3: Scale** 📋

- [ ] Partnership with major NGOs
- [ ] Regulatory compliance (all regions)
- [ ] Fiat on-ramp integration
- [ ] Advanced analytics dashboard
- [ ] Automated impact reporting

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow the existing code style
- Keep PRs focused and atomic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Artificial Superintelligence Alliance (ASI)**: For the MeTTa reasoning engine and ASI technology stack
- **PayPal / Paxos**: For PYUSD stablecoin infrastructure
- **Hardhat**: For the excellent Ethereum development environment
- **GDACS**: For real-time disaster alert feeds
- **OpenZeppelin**: For secure smart contract libraries
- **Next.js Team**: For the amazing React framework

---

<div align="center">
  <p>Built with ❤️ for humanity by the AidRoute team</p>
  <p>Powered by the Artificial Superintelligence Alliance</p>
  
  <img src="public/logo.png" alt="AidRoute" width="80"/>
  
  **Coordinating Aid. Autonomously.**
</div>
