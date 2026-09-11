export interface ThesisIdeaSummary {
  problem: string;
  solution: string;
  target_customer: string;
  value_proposition: string;
}

export interface ThesisFeasibilityAssessment {
  rating: "Low" | "Medium" | "High";
  rationale: string;
}

export interface ThesisMarketAnalysis {
  market_description: string;
  target_segment: string;
  competitors: string[];
  differentiation: string;
}

export interface ThesisMvpPhase {
  phase: string;
  description: string;
  estimated_timeframe: string;
}

export interface ThesisFinancialEvaluation {
  estimated_cost_categories: string[];
  revenue_model: string;
  runway_notes: string;
}

export interface ThesisRequiredSkillset {
  skill_tag: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

export interface ThesisParsedData {
  idea_summary: ThesisIdeaSummary;
  feasibility_assessment: ThesisFeasibilityAssessment;
  market_analysis: ThesisMarketAnalysis;
  licensing_notes: string;
  mvp_roadmap: ThesisMvpPhase[];
  financial_evaluation: ThesisFinancialEvaluation;
  required_resources: string[];
  required_skillsets: ThesisRequiredSkillset[];
}

export interface ThesisSummary {
  id: string;
  sessionId?: string;
  mode?: string;
  version: number;
  status: "draft" | "confirmed";
  parsedData: ThesisParsedData;
  confirmedAt: string | null;
  createdAt: string;
}
