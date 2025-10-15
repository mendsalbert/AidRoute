;;;
;;; AidRoute Humanitarian Logistics Knowledge Base
;;; 
;;; MeTTa knowledge representation for crisis response,
;;; supply chain optimization, and impact estimation
;;;

;;; ============================================================
;;; CRISIS TYPES AND URGENCY LEVELS
;;; ============================================================

(: crisis-type (-> String Symbol Symbol))
(crisis-type "medical-emergency" urgent critical)
(crisis-type "natural-disaster" urgent high-priority)
(crisis-type "conflict-zone" sustained high-risk)
(crisis-type "food-insecurity" ongoing moderate)
(crisis-type "water-crisis" urgent critical)
(crisis-type "refugee-situation" sustained high-priority)
(crisis-type "infrastructure-collapse" urgent high-priority)

;;; ============================================================
;;; REGIONAL CHARACTERISTICS
;;; ============================================================

(: region-data (-> String Symbol Number Number))
;; (region-data location access-level risk-multiplier lead-time-days)
(region-data "Gaza" restricted 1.5 10)
(region-data "Syria" conflict-zone 1.6 14)
(region-data "Yemen" port-limited 1.4 12)
(region-data "Sudan" logistics-challenged 1.3 9)
(region-data "Haiti" infrastructure-damaged 1.3 8)
(region-data "Ukraine" conflict-zone 1.5 11)
(region-data "Afghanistan" access-limited 1.6 15)
(region-data "Somalia" high-risk 1.5 13)

;;; ============================================================
;;; SUPPLY PACKAGES AND COSTS
;;; ============================================================

(: supply-package (-> String Symbol Number Number String))
;; (supply-package name category unit-cost-usd beneficiaries-per-unit urgency)
(supply-package "medical-kit-basic" medical 250 50 urgent)
(supply-package "medical-kit-advanced" medical 1500 200 urgent)
(supply-package "medical-trauma-kit" medical 800 30 critical)
(supply-package "food-family-package" food 150 6 moderate)
(supply-package "food-bulk-grains" food 500 50 moderate)
(supply-package "water-purification-kit" water 400 100 critical)
(supply-package "water-storage-system" water 600 200 high)
(supply-package "shelter-tent-family" shelter 800 6 high)
(supply-package "shelter-tarp-basic" shelter 50 4 moderate)
(supply-package "clothing-winter-package" clothing 120 5 seasonal)
(supply-package "hygiene-family-kit" hygiene 80 5 moderate)
(supply-package "blankets-thermal" shelter 40 2 urgent)

;;; ============================================================
;;; LOGISTICS RULES
;;; ============================================================

(: logistics-factor (-> Symbol Number))
;; Cost multipliers based on various factors
(logistics-factor urgent 1.3)
(logistics-factor critical 1.4)
(logistics-factor high-risk 1.5)
(logistics-factor conflict-zone 1.6)
(logistics-factor restricted 1.5)
(logistics-factor port-limited 1.2)
(logistics-factor infrastructure-damaged 1.3)

(: transport-mode (-> Symbol Number Number))
;; (transport-mode type cost-per-kg days)
(transport-mode air 15 2)
(transport-mode sea 3 30)
(transport-mode land 5 7)
(transport-mode emergency-air 25 1)

;;; ============================================================
;;; SUPPLY CHAIN OPTIMIZATION RULES
;;; ============================================================

(: optimal-package (-> String String (List String)))
;; Optimal supply combinations for different crisis types

(optimal-package "medical-emergency" "urgent"
  (List "medical-kit-basic" "medical-trauma-kit" "water-purification-kit"))

(optimal-package "natural-disaster" "immediate"
  (List "shelter-tent-family" "food-family-package" "water-purification-kit" "medical-kit-basic"))

(optimal-package "food-insecurity" "sustained"
  (List "food-bulk-grains" "food-family-package" "water-purification-kit"))

(optimal-package "water-crisis" "critical"
  (List "water-purification-kit" "water-storage-system" "hygiene-family-kit"))

(optimal-package "refugee-situation" "sustained"
  (List "shelter-tent-family" "food-family-package" "clothing-winter-package" "hygiene-family-kit"))

;;; ============================================================
;;; IMPACT ESTIMATION
;;; ============================================================

(: impact-multiplier (-> String Number))
;; Regional impact multipliers based on need severity
(impact-multiplier "Gaza" 1.5)
(impact-multiplier "Syria" 1.4)
(impact-multiplier "Yemen" 1.6)
(impact-multiplier "Sudan" 1.3)
(impact-multiplier "Haiti" 1.2)

(: beneficiary-reach (-> String Number))
;; Average beneficiaries per $1000 PYUSD in different regions
(beneficiary-reach "medical" 80)
(beneficiary-reach "food" 120)
(beneficiary-reach "water" 200)
(beneficiary-reach "shelter" 40)
(beneficiary-reach "clothing" 60)

;;; ============================================================
;;; PRIORITY SCORING
;;; ============================================================

(: priority-weight (-> Symbol Number))
;; Weights for priority calculation
(priority-weight urgency 40)
(priority-weight impact 30)
(priority-weight cost-effectiveness 20)
(priority-weight feasibility 10)

(: urgency-score (-> Symbol Number))
(urgency-score critical 100)
(urgency-score urgent 80)
(urgency-score high 60)
(urgency-score moderate 40)
(urgency-score low 20)

;;; ============================================================
;;; SEASONAL FACTORS
;;; ============================================================

(: seasonal-need (-> String String Number))
;; (seasonal-need region season multiplier)
(seasonal-need "Syria" "winter" 1.4)
(seasonal-need "Ukraine" "winter" 1.5)
(seasonal-need "Afghanistan" "winter" 1.6)
(seasonal-need "Yemen" "summer" 1.2)
(seasonal-need "Haiti" "hurricane-season" 1.3)

;;; ============================================================
;;; SUPPLY CHAIN CONSTRAINTS
;;; ============================================================

(: constraint (-> String Symbol String))
;; Known constraints for specific regions
(constraint "Gaza" access "border-restrictions")
(constraint "Syria" security "conflict-active")
(constraint "Yemen" infrastructure "port-capacity-limited")
(constraint "Afghanistan" terrain "mountainous-difficult")
(constraint "Somalia" security "piracy-risk")

;;; ============================================================
;;; HISTORICAL SUCCESS PATTERNS
;;; ============================================================

(: successful-mission (-> String String Number Number))
;; (successful-mission location type cost-pyusd beneficiaries)
(successful-mission "Gaza" "medical" 5000 450)
(successful-mission "Syria" "food" 8000 800)
(successful-mission "Yemen" "water" 6000 1200)
(successful-mission "Haiti" "shelter" 12000 200)

;;; ============================================================
;;; EFFICIENCY BENCHMARKS
;;; ============================================================

(: efficiency-benchmark (-> String Number))
;; Cost per beneficiary benchmarks (PYUSD)
(efficiency-benchmark "excellent" 12)
(efficiency-benchmark "good" 25)
(efficiency-benchmark "acceptable" 40)
(efficiency-benchmark "review-needed" 60)

;;; ============================================================
;;; REASONING RULES
;;; ============================================================

;; Rule: Calculate total mission cost
(: calc-mission-cost (-> (List String) Number String Number))
(= (calc-mission-cost supplies base-cost region)
  (let ((logistics-mult (region-multiplier region)))
    (* (+ base-cost (* base-cost 0.2)) logistics-mult)))

;; Rule: Estimate delivery timeline
(: estimate-timeline (-> String String Number))
(= (estimate-timeline region urgency)
  (if (== urgency "critical")
    3
    (if (== urgency "urgent")
      7
      14)))

;; Rule: Validate mission feasibility
(: validate-mission (-> String Number String Bool))
(= (validate-mission location cost crisis-type)
  (and
    (> cost 0)
    (< cost 1000000)
    (not (== location ""))))

;;; ============================================================
;;; OPTIMIZATION HEURISTICS
;;; ============================================================

;; Prefer multi-purpose supplies
(: supply-versatility (-> String Number))
(supply-versatility "water-purification-kit" 0.9)
(supply-versatility "medical-kit-basic" 0.85)
(supply-versatility "shelter-tent-family" 0.7)

;; Maximize beneficiaries per dollar
(: cost-benefit-ratio (-> String Number))
(cost-benefit-ratio "water-purification-kit" 4.0)  ;; 100 people / $400 = 0.25 cost per person
(cost-benefit-ratio "medical-kit-basic" 5.0)       ;; 50 people / $250 = 5 cost per person
(cost-benefit-ratio "food-family-package" 25.0)    ;; 6 people / $150 = 25 cost per person

;;; ============================================================
;;; KNOWLEDGE BASE COMPLETE
;;; ============================================================

;; This MeTTa knowledge base powers the AidRoute AI agent's
;; reasoning about humanitarian logistics, enabling:
;; - Intelligent mission planning
;; - Cost optimization
;; - Impact maximization
;; - Risk assessment
;; - Supply chain optimization
;; - Priority-based resource allocation

