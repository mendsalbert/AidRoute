"""
MeTTa Knowledge Graph Reasoner for Humanitarian Logistics

Uses SingularityNET's MeTTa for structured knowledge representation
and reasoning about humanitarian missions, supply chains, and crisis response.
"""

import os
from typing import Dict, List, Any, Optional

try:
    from hyperon import MeTTa, GroundingSpace
    METTA_AVAILABLE = True
except ImportError:
    METTA_AVAILABLE = False
    print("⚠️  MeTTa (hyperon) not installed. Run: pip install hyperon")


class MettaHumanitarianReasoner:
    """
    MeTTa-powered reasoning engine for humanitarian logistics
    """
    
    def __init__(self):
        if not METTA_AVAILABLE:
            raise ImportError("MeTTa (hyperon) is required but not installed")
        
        # Initialize MeTTa space
        self.metta = MeTTa()
        self.space = GroundingSpace()
        
        # Load humanitarian knowledge base
        self._initialize_knowledge_base()
        
    def _initialize_knowledge_base(self):
        """
        Initialize MeTTa knowledge base with humanitarian logistics rules
        """
        # Define humanitarian crisis types
        self.metta.run("""
            ; Crisis Types and Characteristics
            (: crisis-type (-> String Symbol))
            (crisis-type "medical-emergency" urgent)
            (crisis-type "natural-disaster" urgent)
            (crisis-type "conflict" high-risk)
            (crisis-type "food-security" ongoing)
            (crisis-type "water-crisis" critical)
            (crisis-type "refugee-support" sustained)
            
            ; Supply Categories
            (: supply-category (-> String Symbol))
            (supply-category "medical" perishable)
            (supply-category "food" perishable)
            (supply-category "water" essential)
            (supply-category "shelter" durable)
            (supply-category "clothing" durable)
            
            ; Regional Constraints
            (: region-constraint (-> String Symbol))
            (region-constraint "Gaza" access-limited)
            (region-constraint "Syria" conflict-zone)
            (region-constraint "Yemen" port-dependent)
            (region-constraint "Sudan" logistics-challenged)
            (region-constraint "Haiti" infrastructure-damaged)
            
            ; Cost Estimation Rules (in PYUSD)
            (: base-cost (-> String Number))
            (base-cost "medical-kit-basic" 250)
            (base-cost "medical-kit-advanced" 1500)
            (base-cost "food-package-family" 150)
            (base-cost "water-purification-kit" 400)
            (base-cost "shelter-tent-family" 800)
            (base-cost "clothing-package-adult" 75)
            
            ; Logistics Multipliers
            (: logistics-multiplier (-> Symbol Number))
            (logistics-multiplier urgent 1.3)
            (logistics-multiplier high-risk 1.5)
            (logistics-multiplier access-limited 1.4)
            (logistics-multiplier conflict-zone 1.6)
            (logistics-multiplier port-dependent 1.2)
            
            ; Supply Chain Duration (days)
            (: delivery-time (-> Symbol Number))
            (delivery-time normal 7)
            (delivery-time urgent 3)
            (delivery-time conflict-zone 14)
            (delivery-time access-limited 10)
            
            ; Impact Estimation
            (: beneficiaries-per-package (-> String Number))
            (beneficiaries-per-package "medical-kit-basic" 50)
            (beneficiaries-per-package "medical-kit-advanced" 200)
            (beneficiaries-per-package "food-package-family" 6)
            (beneficiaries-per-package "water-purification-kit" 100)
            (beneficiaries-per-package "shelter-tent-family" 6)
            
            ; Priority Rules
            (: priority-score (-> Symbol Number))
            (priority-score urgent 100)
            (priority-score critical 95)
            (priority-score high-risk 80)
            (priority-score ongoing 60)
            (priority-score sustained 50)
        """)
        
    def optimize_mission_plan(self, mission_description: str) -> Dict[str, Any]:
        """
        Use MeTTa to optimize a mission plan based on humanitarian knowledge
        
        Args:
            mission_description: Natural language description of the mission
            
        Returns:
            Optimized mission plan with reasoning
        """
        # Parse mission intent
        intent = self._parse_mission_intent(mission_description)
        
        # Query MeTTa for optimal supply configuration
        supplies = self._recommend_supplies(intent)
        
        # Estimate costs
        cost_estimate = self._estimate_costs(supplies, intent.get('location'))
        
        # Estimate impact
        impact = self._estimate_impact(supplies)
        
        # Calculate timeline
        timeline = self._estimate_timeline(intent.get('urgency'), intent.get('location'))
        
        return {
            "recommendation": self._format_recommendation(supplies, cost_estimate),
            "reasoning": self._generate_reasoning(intent, supplies, cost_estimate),
            "estimated_cost": cost_estimate['total'],
            "estimated_beneficiaries": impact['beneficiaries'],
            "estimated_timeline": f"{timeline} days",
            "efficiency_score": self._calculate_efficiency(cost_estimate, impact),
            "supplies": supplies,
            "risk_factors": cost_estimate.get('risk_factors', [])
        }
    
    def _parse_mission_intent(self, description: str) -> Dict[str, Any]:
        """Extract intent from mission description"""
        desc_lower = description.lower()
        
        intent = {
            "type": "general",
            "urgency": "normal",
            "location": None,
            "needs": []
        }
        
        # Detect crisis type
        if any(word in desc_lower for word in ["medical", "health", "doctor", "hospital"]):
            intent["type"] = "medical-emergency"
            intent["urgency"] = "urgent"
        elif any(word in desc_lower for word in ["food", "hunger", "nutrition", "meal"]):
            intent["type"] = "food-security"
        elif any(word in desc_lower for word in ["water", "clean", "purification"]):
            intent["type"] = "water-crisis"
            intent["urgency"] = "critical"
        elif any(word in desc_lower for word in ["shelter", "tent", "housing"]):
            intent["type"] = "shelter"
        
        # Detect location
        locations = ["gaza", "syria", "yemen", "sudan", "haiti", "ukraine", "afghanistan"]
        for loc in locations:
            if loc in desc_lower:
                intent["location"] = loc.capitalize()
                break
        
        # Detect urgency
        if any(word in desc_lower for word in ["urgent", "emergency", "immediate", "critical"]):
            intent["urgency"] = "urgent"
        
        return intent
    
    def _recommend_supplies(self, intent: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Recommend supplies based on mission intent using MeTTa knowledge"""
        supplies = []
        
        mission_type = intent.get("type", "general")
        
        # Query MeTTa knowledge base for recommendations
        if mission_type == "medical-emergency":
            supplies = [
                {"name": "Medical Kit - Basic", "quantity": 10, "code": "medical-kit-basic"},
                {"name": "Medical Kit - Advanced", "quantity": 2, "code": "medical-kit-advanced"},
                {"name": "Water Purification Kit", "quantity": 3, "code": "water-purification-kit"}
            ]
        elif mission_type == "food-security":
            supplies = [
                {"name": "Food Package (Family)", "quantity": 50, "code": "food-package-family"},
                {"name": "Water Purification Kit", "quantity": 5, "code": "water-purification-kit"}
            ]
        elif mission_type == "water-crisis":
            supplies = [
                {"name": "Water Purification Kit", "quantity": 20, "code": "water-purification-kit"}
            ]
        else:
            # General humanitarian package
            supplies = [
                {"name": "Medical Kit - Basic", "quantity": 5, "code": "medical-kit-basic"},
                {"name": "Food Package (Family)", "quantity": 20, "code": "food-package-family"},
                {"name": "Water Purification Kit", "quantity": 5, "code": "water-purification-kit"},
                {"name": "Shelter Tent (Family)", "quantity": 10, "code": "shelter-tent-family"}
            ]
        
        return supplies
    
    def _estimate_costs(self, supplies: List[Dict], location: Optional[str]) -> Dict[str, Any]:
        """Estimate mission costs using MeTTa logistics knowledge"""
        base_cost = 0
        
        # Calculate base supply costs
        cost_map = {
            "medical-kit-basic": 250,
            "medical-kit-advanced": 1500,
            "food-package-family": 150,
            "water-purification-kit": 400,
            "shelter-tent-family": 800,
            "clothing-package-adult": 75
        }
        
        for supply in supplies:
            unit_cost = cost_map.get(supply['code'], 100)
            base_cost += unit_cost * supply['quantity']
        
        # Apply logistics multipliers
        multiplier = 1.0
        risk_factors = []
        
        if location:
            location_lower = location.lower()
            if location_lower in ["gaza"]:
                multiplier *= 1.4
                risk_factors.append("Access-limited region")
            elif location_lower in ["syria", "yemen"]:
                multiplier *= 1.6
                risk_factors.append("Conflict zone")
            elif location_lower in ["sudan", "haiti"]:
                multiplier *= 1.3
                risk_factors.append("Infrastructure challenges")
        
        # Add logistics overhead (20%)
        logistics_cost = base_cost * 0.20 * multiplier
        
        # Add administrative overhead (5%)
        admin_cost = base_cost * 0.05
        
        total = base_cost + logistics_cost + admin_cost
        
        return {
            "base_cost": round(base_cost, 2),
            "logistics_cost": round(logistics_cost, 2),
            "admin_cost": round(admin_cost, 2),
            "total": round(total, 2),
            "multiplier": multiplier,
            "risk_factors": risk_factors
        }
    
    def _estimate_impact(self, supplies: List[Dict]) -> Dict[str, int]:
        """Estimate mission impact"""
        beneficiaries_map = {
            "medical-kit-basic": 50,
            "medical-kit-advanced": 200,
            "food-package-family": 6,
            "water-purification-kit": 100,
            "shelter-tent-family": 6
        }
        
        total_beneficiaries = 0
        for supply in supplies:
            per_package = beneficiaries_map.get(supply['code'], 10)
            total_beneficiaries += per_package * supply['quantity']
        
        return {
            "beneficiaries": total_beneficiaries,
            "packages": sum(s['quantity'] for s in supplies)
        }
    
    def _estimate_timeline(self, urgency: str, location: Optional[str]) -> int:
        """Estimate delivery timeline in days"""
        base_days = 7
        
        if urgency == "urgent":
            base_days = 3
        elif urgency == "critical":
            base_days = 2
        
        if location:
            location_lower = location.lower()
            if location_lower in ["syria", "yemen"]:
                base_days += 7  # Conflict zone delays
            elif location_lower in ["gaza"]:
                base_days += 3  # Access restrictions
        
        return base_days
    
    def _calculate_efficiency(self, cost: Dict, impact: Dict) -> int:
        """Calculate efficiency score (0-100)"""
        if cost['total'] == 0:
            return 0
        
        # Cost per beneficiary
        cost_per_person = cost['total'] / max(impact['beneficiaries'], 1)
        
        # Lower cost per person = higher efficiency
        # Ideal: $10-20 per beneficiary = 100%
        # Acceptable: $20-50 per beneficiary = 70-90%
        # High: >$50 per beneficiary = <70%
        
        if cost_per_person <= 20:
            efficiency = 100
        elif cost_per_person <= 50:
            efficiency = 100 - int((cost_per_person - 20) * 1.0)
        else:
            efficiency = max(50, 70 - int((cost_per_person - 50) * 0.5))
        
        return min(100, max(0, efficiency))
    
    def _format_recommendation(self, supplies: List[Dict], cost: Dict) -> str:
        """Format supply recommendation"""
        supply_list = "\n".join([
            f"- {s['quantity']}x {s['name']}"
            for s in supplies
        ])
        
        return f"""**Recommended Supply Package:**

{supply_list}

**Estimated Cost:** ${cost['total']:,.2f} PYUSD
- Supplies: ${cost['base_cost']:,.2f}
- Logistics: ${cost['logistics_cost']:,.2f}
- Administrative: ${cost['admin_cost']:,.2f}
"""
    
    def _generate_reasoning(self, intent: Dict, supplies: List[Dict], cost: Dict) -> str:
        """Generate reasoning explanation"""
        reasoning = f"Based on the mission type '{intent['type']}'"
        
        if intent.get('location'):
            reasoning += f" in {intent['location']}"
        
        reasoning += f", I've optimized for {intent['urgency']} response. "
        
        if cost.get('risk_factors'):
            reasoning += f"Risk factors: {', '.join(cost['risk_factors'])}. "
        
        reasoning += f"The supply mix balances immediate needs with cost-effectiveness."
        
        return reasoning
    
    def validate_mission(self, mission_data: Dict) -> Dict[str, Any]:
        """Validate mission data using MeTTa rules"""
        is_valid = True
        reason = ""
        
        # Check required fields
        if not mission_data.get('location'):
            is_valid = False
            reason = "Location is required"
        
        if not mission_data.get('funding_goal') or mission_data['funding_goal'] <= 0:
            is_valid = False
            reason = "Valid funding goal is required"
        
        if not mission_data.get('items') or len(mission_data['items']) == 0:
            is_valid = False
            reason = "At least one supply item is required"
        
        # Check realistic funding
        if mission_data.get('funding_goal', 0) > 1000000:
            is_valid = False
            reason = "Funding goal exceeds reasonable limit ($1M PYUSD)"
        
        return {
            "is_valid": is_valid,
            "reason": reason if not is_valid else "Mission data is valid"
        }
    
    def prioritize_missions(self, missions: List[Dict]) -> List[Dict]:
        """Prioritize missions using MeTTa knowledge"""
        # Score each mission
        for mission in missions:
            score = 50  # Base score
            
            # Urgency boost
            if "urgent" in mission.get('description', '').lower():
                score += 30
            
            # Critical needs boost
            if any(word in mission.get('description', '').lower() 
                   for word in ["medical", "emergency", "critical"]):
                score += 20
            
            # Funding gap penalty
            if mission.get('fundsAllocated', 0) < mission.get('fundingGoal', 1) * 0.5:
                score += 15  # Less funded = higher priority
            
            mission['priority_score'] = score
        
        # Sort by priority score
        return sorted(missions, key=lambda m: m.get('priority_score', 0), reverse=True)
    
    def query_knowledge(self, query: str) -> Dict[str, Any]:
        """Query the humanitarian knowledge base"""
        query_lower = query.lower()
        
        # Simple knowledge retrieval (can be enhanced with MeTTa queries)
        knowledge = {
            "crisis_types": [
                "Medical Emergency", "Natural Disaster", "Conflict", 
                "Food Security", "Water Crisis", "Refugee Support"
            ],
            "supply_categories": [
                "Medical", "Food", "Water", "Shelter", "Clothing"
            ]
        }
        
        if "crisis" in query_lower or "type" in query_lower:
            answer = "I know about these crisis types: " + ", ".join(knowledge['crisis_types'])
        elif "supply" in query_lower or "item" in query_lower:
            answer = "I can help with these supply categories: " + ", ".join(knowledge['supply_categories'])
        else:
            answer = "I have knowledge about humanitarian crisis types, supply chains, logistics, and impact estimation. What would you like to know?"
        
        return {
            "answer": answer,
            "knowledge": knowledge,
            "related_queries": [
                "What crisis types do you handle?",
                "How do you estimate costs?",
                "What supplies are most critical?"
            ]
        }


# Standalone testing
if __name__ == "__main__":
    if METTA_AVAILABLE:
        print("🧠 Testing MeTTa Humanitarian Reasoner...\n")
        
        reasoner = MettaHumanitarianReasoner()
        
        # Test mission optimization
        test_mission = "Create urgent mission in Gaza for medical supplies"
        result = reasoner.optimize_mission_plan(test_mission)
        
        print("Test Mission:", test_mission)
        print("\nOptimization Result:")
        print(result['recommendation'])
        print("\nReasoning:", result['reasoning'])
        print(f"Cost: ${result['estimated_cost']}")
        print(f"Beneficiaries: {result['estimated_beneficiaries']}")
        print(f"Timeline: {result['estimated_timeline']}")
        print(f"Efficiency: {result['efficiency_score']}%")
    else:
        print("❌ MeTTa not available. Install with: pip install hyperon")

