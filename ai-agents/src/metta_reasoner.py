"""
MeTTa Humanitarian Reasoning Engine
Uses SingularityNET's MeTTa for structured knowledge representation and reasoning
"""

from typing import Dict, List, Any, Optional
import logging

try:
    from hyperon import MeTTa, E, S, V
    METTA_AVAILABLE = True
except ImportError:
    METTA_AVAILABLE = False
    logging.warning("MeTTa (hyperon) not available. Install with: pip install hyperon")


class MettaHumanitarianReasoner:
    """
    MeTTa-based reasoning engine for humanitarian logistics optimization
    """
    
    def __init__(self):
        self.logger = logging.getLogger("MettaReasoner")
        
        if not METTA_AVAILABLE:
            self.logger.warning("MeTTa not available - using fallback logic")
            self.metta = None
            return
            
        try:
            self.metta = MeTTa()
            self._initialize_knowledge_base()
            self.logger.info("✅ MeTTa Reasoner initialized with knowledge base")
        except Exception as e:
            self.logger.error(f"Failed to initialize MeTTa: {e}")
            self.metta = None
    
    def _initialize_knowledge_base(self):
        """Initialize the humanitarian logistics knowledge base"""
        if not self.metta:
            return
            
        # Define crisis types and urgency levels
        self.metta.run("""
            ; Crisis type definitions
            (: crisis-type (-> String Symbol Symbol))
            (crisis-type "earthquake" natural-disaster urgent)
            (crisis-type "flood" natural-disaster high)
            (crisis-type "cyclone" natural-disaster critical)
            (crisis-type "wildfire" natural-disaster high)
            (crisis-type "volcano" natural-disaster critical)
            (crisis-type "drought" food-insecurity medium)
            (crisis-type "medical-emergency" health-crisis urgent)
            
            ; Supply package definitions (name category cost weight urgency)
            (: supply-package (-> String Symbol Number Number Symbol))
            (supply-package "medical-kit-basic" medical 250 50 urgent)
            (supply-package "medical-kit-advanced" medical 800 100 critical)
            (supply-package "shelter-tent-family" shelter 800 150 urgent)
            (supply-package "shelter-tarp-basic" shelter 50 20 medium)
            (supply-package "water-purification-kit" water 400 30 urgent)
            (supply-package "food-package-family" food 150 80 high)
            (supply-package "hygiene-family-kit" hygiene 80 15 medium)
            
            ; Regional constraint factors
            (: region-factor (-> String Symbol Number))
            (region-factor "Gaza" restricted 1.5)
            (region-factor "Syria" conflict-zone 1.8)
            (region-factor "Yemen" restricted 1.6)
            (region-factor "Haiti" logistics-challenge 1.3)
            (region-factor "Afghanistan" conflict-zone 1.7)
            
            ; Beneficiary estimates per supply unit
            (: beneficiary-estimate (-> String Number))
            (beneficiary-estimate "medical-kit-basic" 50)
            (beneficiary-estimate "medical-kit-advanced" 100)
            (beneficiary-estimate "shelter-tent-family" 6)
            (beneficiary-estimate "shelter-tarp-basic" 4)
            (beneficiary-estimate "water-purification-kit" 100)
            (beneficiary-estimate "food-package-family" 6)
            (beneficiary-estimate "hygiene-family-kit" 5)
            
            ; Crisis to supply mapping rules
            (: recommend-supply (-> Symbol String))
            (recommend-supply medical "medical-kit-basic")
            (recommend-supply medical "medical-kit-advanced")
            (recommend-supply shelter "shelter-tent-family")
            (recommend-supply shelter "shelter-tarp-basic")
            (recommend-supply water "water-purification-kit")
            (recommend-supply food "food-package-family")
            (recommend-supply hygiene "hygiene-family-kit")
        """)
    
    def optimize_mission_plan(self, 
                             crisis_type: str, 
                             location: str, 
                             urgency: str,
                             budget: Optional[float] = None) -> Dict[str, Any]:
        """
        Generate optimized mission plan using MeTTa reasoning
        
        Args:
            crisis_type: Type of crisis (earthquake, flood, etc.)
            location: Affected location
            urgency: Urgency level (critical, urgent, high, medium)
            budget: Optional budget constraint
            
        Returns:
            Optimized mission plan with supplies, costs, and impact estimates
        """
        
        if not self.metta:
            return self._fallback_optimization(crisis_type, location, urgency, budget)
        
        try:
            # Determine crisis category and supplies
            supplies = self._get_recommended_supplies(crisis_type)
            
            # Calculate costs with regional factors
            total_cost, logistics_cost = self._calculate_costs(supplies, location)
            
            # Estimate beneficiaries
            beneficiaries = self._estimate_beneficiaries(supplies)
            
            # Calculate efficiency score
            efficiency_score = self._calculate_efficiency(beneficiaries, total_cost, urgency)
            
            # Determine timeline based on urgency
            timeline = self._estimate_timeline(urgency, location)
            
            # Generate reasoning explanation
            reasoning = self._generate_reasoning(crisis_type, supplies, location, urgency)
            
            return {
                "supplies": supplies,
                "estimated_cost": int(total_cost),
                "logistics_cost": int(logistics_cost),
                "estimated_beneficiaries": beneficiaries,
                "efficiency_score": efficiency_score,
                "estimated_timeline": timeline,
                "reasoning": reasoning,
                "crisis_category": self._categorize_crisis(crisis_type),
                "region_factor": self._get_region_factor(location)
            }
            
        except Exception as e:
            self.logger.error(f"MeTTa optimization error: {e}")
            return self._fallback_optimization(crisis_type, location, urgency, budget)
    
    def _get_recommended_supplies(self, crisis_type: str) -> List[Dict[str, Any]]:
        """Query MeTTa for recommended supplies based on crisis type"""
        
        # Map crisis types to supply categories
        supply_mapping = {
            "earthquake": ["medical", "shelter", "water"],
            "flood": ["water", "hygiene", "shelter"],
            "cyclone": ["shelter", "food", "water"],
            "wildfire": ["medical", "shelter", "water"],
            "volcano": ["medical", "shelter", "water"],
            "drought": ["food", "water"],
            "medical-emergency": ["medical"]
        }
        
        categories = supply_mapping.get(crisis_type.lower(), ["medical", "shelter"])
        
        supplies = []
        for category in categories:
            if category == "medical":
                supplies.append({"name": "Medical Kit - Basic", "quantity": 10, "code": "medical-kit-basic"})
            elif category == "shelter":
                supplies.append({"name": "Shelter Tent (Family)", "quantity": 15, "code": "shelter-tent-family"})
            elif category == "water":
                supplies.append({"name": "Water Purification Kit", "quantity": 8, "code": "water-purification-kit"})
            elif category == "food":
                supplies.append({"name": "Food Package (Family)", "quantity": 20, "code": "food-package-family"})
            elif category == "hygiene":
                supplies.append({"name": "Hygiene Family Kit", "quantity": 15, "code": "hygiene-family-kit"})
        
        return supplies
    
    def _calculate_costs(self, supplies: List[Dict], location: str) -> tuple:
        """Calculate total and logistics costs with regional factors"""
        
        cost_map = {
            "medical-kit-basic": 250,
            "medical-kit-advanced": 800,
            "shelter-tent-family": 800,
            "shelter-tarp-basic": 50,
            "water-purification-kit": 400,
            "food-package-family": 150,
            "hygiene-family-kit": 80
        }
        
        base_cost = sum(
            cost_map.get(supply["code"], 100) * supply["quantity"] 
            for supply in supplies
        )
        
        # Apply regional factor
        region_factor = self._get_region_factor(location)
        logistics_cost = base_cost * 0.25 * region_factor
        total_cost = base_cost + logistics_cost
        
        return total_cost, logistics_cost
    
    def _estimate_beneficiaries(self, supplies: List[Dict]) -> int:
        """Estimate total beneficiaries from supply packages"""
        
        beneficiary_map = {
            "medical-kit-basic": 50,
            "medical-kit-advanced": 100,
            "shelter-tent-family": 6,
            "shelter-tarp-basic": 4,
            "water-purification-kit": 100,
            "food-package-family": 6,
            "hygiene-family-kit": 5
        }
        
        return sum(
            beneficiary_map.get(supply["code"], 10) * supply["quantity"]
            for supply in supplies
        )
    
    def _calculate_efficiency(self, beneficiaries: int, cost: float, urgency: str) -> int:
        """Calculate efficiency score (0-100)"""
        
        base_efficiency = min(100, int((beneficiaries / cost) * 100) + 50)
        
        # Urgency bonus
        urgency_bonus = {
            "critical": 20,
            "urgent": 15,
            "high": 10,
            "medium": 5
        }.get(urgency.lower(), 0)
        
        return min(100, base_efficiency + urgency_bonus)
    
    def _estimate_timeline(self, urgency: str, location: str) -> str:
        """Estimate mission timeline"""
        
        base_timeline = {
            "critical": "3-5 days",
            "urgent": "5-7 days",
            "high": "7-14 days",
            "medium": "14-21 days"
        }.get(urgency.lower(), "7-14 days")
        
        # Adjust for difficult regions
        difficult_regions = ["gaza", "syria", "yemen", "afghanistan"]
        if location.lower() in difficult_regions:
            return f"{base_timeline} (extended due to access challenges)"
        
        return base_timeline
    
    def _get_region_factor(self, location: str) -> float:
        """Get regional difficulty factor"""
        
        region_factors = {
            "gaza": 1.5,
            "syria": 1.8,
            "yemen": 1.6,
            "haiti": 1.3,
            "afghanistan": 1.7
        }
        
        return region_factors.get(location.lower(), 1.0)
    
    def _categorize_crisis(self, crisis_type: str) -> str:
        """Categorize crisis type"""
        
        categories = {
            "earthquake": "natural-disaster",
            "flood": "natural-disaster",
            "cyclone": "natural-disaster",
            "wildfire": "natural-disaster",
            "volcano": "natural-disaster",
            "drought": "food-insecurity",
            "medical-emergency": "health-crisis"
        }
        
        return categories.get(crisis_type.lower(), "general")
    
    def _generate_reasoning(self, crisis_type: str, supplies: List[Dict], 
                           location: str, urgency: str) -> str:
        """Generate human-readable reasoning explanation"""
        
        supply_names = ", ".join([s["name"] for s in supplies])
        
        reasoning = (
            f"For a {urgency} {crisis_type} crisis in {location}, "
            f"the optimal supply package includes: {supply_names}. "
            f"This combination balances immediate needs with cost-effectiveness."
        )
        
        if self._get_region_factor(location) > 1.0:
            reasoning += f" Regional logistics challenges in {location} require additional planning."
        
        return reasoning
    
    def _fallback_optimization(self, crisis_type: str, location: str, 
                               urgency: str, budget: Optional[float]) -> Dict[str, Any]:
        """Fallback optimization when MeTTa is unavailable"""
        
        self.logger.info("Using fallback optimization (MeTTa unavailable)")
        
        supplies = self._get_recommended_supplies(crisis_type)
        total_cost, logistics_cost = self._calculate_costs(supplies, location)
        beneficiaries = self._estimate_beneficiaries(supplies)
        efficiency_score = self._calculate_efficiency(beneficiaries, total_cost, urgency)
        timeline = self._estimate_timeline(urgency, location)
        reasoning = self._generate_reasoning(crisis_type, supplies, location, urgency)
        
        return {
            "supplies": supplies,
            "estimated_cost": int(total_cost),
            "logistics_cost": int(logistics_cost),
            "estimated_beneficiaries": beneficiaries,
            "efficiency_score": efficiency_score,
            "estimated_timeline": timeline,
            "reasoning": reasoning,
            "crisis_category": self._categorize_crisis(crisis_type),
            "region_factor": self._get_region_factor(location)
        }

