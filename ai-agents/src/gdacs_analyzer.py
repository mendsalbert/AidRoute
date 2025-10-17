"""
GDACS Disaster Event Analyzer
Analyzes real-time disaster data from GDACS and generates mission recommendations
"""

from typing import Dict, List, Any
import logging
from metta_reasoner import MettaHumanitarianReasoner


class GDACSDisasterAnalyzer:
    """
    Analyzes GDACS disaster events using MeTTa reasoning
    """
    
    def __init__(self, metta_reasoner: MettaHumanitarianReasoner):
        self.logger = logging.getLogger("GDACSAnalyzer")
        self.metta_reasoner = metta_reasoner
        self.logger.info("✅ GDACS Disaster Analyzer initialized")
    
    def analyze_disasters(self, disasters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze multiple GDACS disasters and generate mission plans
        
        Args:
            disasters: List of disaster events from GDACS
            
        Returns:
            List of disaster analyses with mission recommendations
        """
        
        analyses = []
        
        for disaster in disasters[:10]:  # Limit to top 10
            try:
                analysis = self.analyze_single_disaster(disaster)
                analyses.append(analysis)
            except Exception as e:
                self.logger.error(f"Failed to analyze disaster: {e}")
                continue
        
        # Sort by priority score (highest first)
        analyses.sort(key=lambda x: x.get("priority_score", 0), reverse=True)
        
        return analyses
    
    def analyze_single_disaster(self, disaster: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a single disaster event and generate mission plan
        
        Args:
            disaster: Disaster event data
            
        Returns:
            Complete analysis with mission plan
        """
        
        # Extract disaster information
        event_type = disaster.get("eventType", "DR")
        type_name = disaster.get("typeName", "Disaster")
        location = disaster.get("location", "Unknown")
        severity = disaster.get("severity", 3)
        urgency = disaster.get("urgency", "medium")
        title = disaster.get("title", "Disaster Event")
        description = disaster.get("description", "")
        
        # Map GDACS event types to crisis types
        crisis_type = self._map_event_to_crisis(event_type, type_name)
        
        # Generate mission plan using MeTTa reasoning
        mission_plan = self.metta_reasoner.optimize_mission_plan(
            crisis_type=crisis_type,
            location=location,
            urgency=urgency
        )
        
        # Calculate priority score
        priority_score = self._calculate_priority_score(severity, urgency, mission_plan)
        
        # Generate recommendation
        recommendation = self._generate_recommendation(
            type_name, location, urgency, mission_plan
        )
        
        # Add risk factors
        risk_factors = self._identify_risk_factors(location, urgency, severity)
        
        return {
            "disaster": {
                "title": title,
                "location": location,
                "eventType": event_type,
                "typeName": type_name,
                "severity": severity,
                "urgency": urgency,
                "description": description
            },
            "mission_plan": {
                "location": location,
                "crisis_type": mission_plan["crisis_category"],
                "urgency": urgency,
                "supplies": mission_plan["supplies"],
                "estimated_cost": mission_plan["estimated_cost"],
                "estimated_beneficiaries": mission_plan["estimated_beneficiaries"],
                "estimated_timeline": mission_plan["estimated_timeline"],
                "efficiency_score": mission_plan["efficiency_score"],
                "reasoning": mission_plan["reasoning"],
                "recommendation": recommendation,
                "risk_factors": risk_factors
            },
            "priority_score": priority_score
        }
    
    def _map_event_to_crisis(self, event_type: str, type_name: str) -> str:
        """Map GDACS event type to crisis type for MeTTa reasoning"""
        
        mapping = {
            "EQ": "earthquake",
            "TC": "cyclone",
            "FL": "flood",
            "VO": "volcano",
            "WF": "wildfire",
            "DR": "drought"
        }
        
        return mapping.get(event_type, type_name.lower().replace(" ", "-"))
    
    def _calculate_priority_score(self, severity: int, urgency: str, 
                                  mission_plan: Dict) -> int:
        """
        Calculate priority score (0-100) for disaster response
        
        Higher score = higher priority
        """
        
        # Base score from severity (0-50)
        severity_score = severity * 10
        
        # Urgency bonus (0-30)
        urgency_bonus = {
            "critical": 30,
            "urgent": 25,
            "high": 15,
            "medium": 10
        }.get(urgency.lower(), 5)
        
        # Efficiency bonus (0-20)
        efficiency_bonus = int(mission_plan["efficiency_score"] * 0.2)
        
        total_score = min(100, severity_score + urgency_bonus + efficiency_bonus)
        
        return total_score
    
    def _generate_recommendation(self, type_name: str, location: str, 
                                urgency: str, mission_plan: Dict) -> str:
        """Generate mission recommendation text"""
        
        beneficiaries = mission_plan["estimated_beneficiaries"]
        cost = mission_plan["estimated_cost"]
        timeline = mission_plan["estimated_timeline"]
        
        recommendation = (
            f"Recommended emergency response for {type_name} in {location}. "
            f"Deploy within {timeline} to reach approximately {beneficiaries:,} beneficiaries. "
            f"Estimated cost: ${cost:,}."
        )
        
        if urgency.lower() in ["critical", "urgent"]:
            recommendation += " IMMEDIATE ACTION REQUIRED."
        
        return recommendation
    
    def _identify_risk_factors(self, location: str, urgency: str, severity: int) -> List[str]:
        """Identify risk factors for the mission"""
        
        risks = []
        
        # Urgency-based risks
        if urgency.lower() in ["critical", "urgent"]:
            risks.append("High urgency requires expedited delivery")
        
        # Severity-based risks
        if severity >= 4:
            risks.append("High severity crisis with potential access challenges")
        
        # Location-based risks
        challenging_regions = {
            "gaza": "Restricted access zone with security concerns",
            "syria": "Active conflict zone requiring security protocols",
            "yemen": "Restricted access with logistics challenges",
            "haiti": "Infrastructure damage may affect delivery",
            "afghanistan": "Security clearance required"
        }
        
        for region, risk in challenging_regions.items():
            if region in location.lower():
                risks.append(risk)
                break
        
        # Default risk
        if not risks:
            risks.append("Standard logistics challenges")
        
        return risks

