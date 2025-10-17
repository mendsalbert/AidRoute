"""
Flask API Bridge Server
Exposes AidRoute AI Agent functionality to Next.js frontend
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from metta_reasoner import MettaHumanitarianReasoner
from gdacs_analyzer import GDACSDisasterAnalyzer
from aidroute_agent import AidRouteCoordinator

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("APIBridge")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize AI components
logger.info("Initializing AI components...")
coordinator = AidRouteCoordinator(name="aidroute-api", port=8000, mailbox=False)
logger.info("✅ AI Coordinator initialized")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "services": {
            "reasoner": coordinator.metta_reasoner.metta is not None,
            "analyzer": coordinator.gdacs_analyzer is not None
        }
    })


@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint for natural language interaction
    
    Request body:
        {
            "message": str,
            "session_id": str (optional),
            "context": dict (optional)
        }
    
    Response:
        {
            "message": str,
            "suggestions": list[str] (optional),
            "mission_data": dict (optional)
        }
    """
    try:
        data = request.json
        message = data.get('message', '')
        context = data.get('context', {})
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        logger.info(f"💬 Chat request: '{message}'")
        
        # Process message with coordinator
        response_text, suggestions = coordinator.process_chat_message(message, context)
        
        # Check if this generated mission data
        mission_data = None
        if "mission plan generated" in response_text.lower():
            # Extract mission data from context if available
            if "location" in message.lower():
                location = coordinator._extract_location(message)
                if location:
                    mission = coordinator.metta_reasoner.optimize_mission_plan(
                        crisis_type="general",
                        location=location,
                        urgency="high"
                    )
                    mission_data = {
                        "location": location,
                        "supplies": mission["supplies"],
                        "estimated_cost": mission["estimated_cost"],
                        "estimated_beneficiaries": mission["estimated_beneficiaries"],
                        "estimated_timeline": mission["estimated_timeline"],
                        "efficiency_score": mission["efficiency_score"]
                    }
        
        response = {
            "message": response_text,
            "suggestions": suggestions
        }
        
        if mission_data:
            response["mission_data"] = mission_data
        
        logger.info("✅ Chat response generated")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Chat error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/analyze', methods=['POST'])
def analyze_disasters():
    """
    Analyze GDACS disasters endpoint
    
    Request body:
        {
            "disasters": list[dict]
        }
    
    Response:
        list[dict] - Analyzed disasters with mission plans
    """
    try:
        data = request.json
        disasters = data.get('disasters', [])
        
        if not disasters:
            return jsonify({"error": "Disasters list is required"}), 400
        
        logger.info(f"🧠 Analyzing {len(disasters)} disasters...")
        
        # Analyze disasters
        analyses = coordinator.gdacs_analyzer.analyze_disasters(disasters)
        
        logger.info(f"✅ Analysis complete: {len(analyses)} mission plans generated")
        return jsonify(analyses)
        
    except Exception as e:
        logger.error(f"❌ Analysis error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/plan-mission', methods=['POST'])
def plan_mission():
    """
    Generate mission plan endpoint
    
    Request body:
        {
            "crisis_type": str,
            "location": str,
            "urgency": str,
            "budget": float (optional)
        }
    
    Response:
        dict - Mission plan with supplies, costs, and estimates
    """
    try:
        data = request.json
        crisis_type = data.get('crisis_type', 'general')
        location = data.get('location', 'Unknown')
        urgency = data.get('urgency', 'medium')
        budget = data.get('budget')
        
        logger.info(f"📋 Planning mission: {crisis_type} in {location}")
        
        # Generate mission plan
        mission = coordinator.metta_reasoner.optimize_mission_plan(
            crisis_type=crisis_type,
            location=location,
            urgency=urgency,
            budget=budget
        )
        
        logger.info("✅ Mission plan generated")
        return jsonify(mission)
        
    except Exception as e:
        logger.error(f"❌ Planning error: {e}")
        return jsonify({"error": str(e)}), 500


def print_banner():
    """Print startup banner"""
    port = int(os.getenv('AI_SERVICE_PORT', '5001'))
    
    print()
    print("╔" + "═" * 66 + "╗")
    print("║" + " " * 18 + "AidRoute AI API Bridge Server" + " " * 19 + "║")
    print("║" + " " * 66 + "║")
    print("║" + "  Connects Next.js ↔ Python AI Agents" + " " * 28 + "║")
    print("║" + "  MeTTa Reasoning • GDACS Analysis • Multi-Agent Coordination" + " " * 5 + "║")
    print("╚" + "═" * 66 + "╝")
    print()
    print(f"🌐 Starting API server on port {port}...")
    print(f"   http://localhost:{port}")
    print()


if __name__ == "__main__":
    print_banner()
    
    # Get configuration from environment
    port = int(os.getenv('AI_SERVICE_PORT', '5001'))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    
    # Run Flask app
    app.run(
        host="0.0.0.0",
        port=port,
        debug=debug
    )
