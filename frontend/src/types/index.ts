export interface PersonalProfile {
  id: number;
  user_id: number;
  noise_sensitivity: number;
  crowd_sensitivity: number;
  brightness_sensitivity: number;
  routine_change_sensitivity: number;
  unfamiliar_location_sensitivity: number;
  profile_version: number;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  created_at: string;
  profile?: PersonalProfile;
}

export interface ContextData {
  noise_level: number;
  crowd_level: number;
  brightness: number;
  activity_level: number;
  routine_change: boolean;
  unfamiliar_location: boolean;
  event_type?: string;
  location_type?: string;
}

export interface ContextResponse extends ContextData {
  id: number;
  user_id: number;
  timestamp: string;
  human_description?: string[];
}

export interface PredictionResponse {
  support_level: 'LOW' | 'MEDIUM' | 'HIGH';
  support_score: number;
  confidence: number;
  reasons: string[];
  contributing_factors: {
    noise: number;
    crowd: number;
    brightness: number;
    routine_change: number;
    unfamiliar_location: number;
  };
  context_summary: string[];
}

export interface RecommendationItem {
  recommendation_id?: number;
  intervention_id: number;
  intervention: string;
  description: string;
  category: 'sensory' | 'routine' | 'preparation' | 'social';
  score: number; // recommendation score 0.0 - 1.0
  rank: number;
  reason: string;
}

export interface RecommendResponse {
  user_id: number;
  context_id: number;
  support_level: 'LOW' | 'MEDIUM' | 'HIGH';
  support_score: number;
  confidence: number;
  recommendations: RecommendationItem[];
  explanation: string;
}

export interface FeedbackPayload {
  recommendation_id: number;
  rating: number; // 1, 2, 3, 4
  comment?: string;
}

export interface FeedbackResponse {
  id: number;
  recommendation_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_score: number;
  previous_score: number;
  learning_delta: number;
  message: string;
}

export interface ScenarioResult {
  name: string;
  intervention_keys: string[];
  support_score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  score_reduction: number;
  explanation: string;
}

export interface SimulationResponse {
  user_id: number;
  baseline_level: 'LOW' | 'MEDIUM' | 'HIGH';
  baseline_score: number;
  scenarios: ScenarioResult[];
  disclaimer: string;
}

export interface EventItem {
  id?: number;
  user_id: number;
  title: string;
  event_type: string;
  scheduled_time: string;
  location: string;
  notes?: string;
  expected_crowd?: number;
  expected_noise?: number;
  expected_brightness?: number;
  routine_change?: boolean;
  unfamiliar_location?: boolean;
}

export interface PrepPlanResponse {
  title: string;
  scheduled_time: string;
  estimated_support_requirement: 'LOW' | 'MEDIUM' | 'HIGH';
  support_score: number;
  confidence: number;
  reasons: string[];
  actionable_prep_steps: string[];
  recommended_interventions: RecommendationItem[];
  why_explanation: string;
}

export interface EffectivenessStat {
  id: number;
  name: string;
  category: string;
  effectiveness_percentage: number;
  sample_count: number;
  helpful_count: number;
}

export interface ContextDistributionItem {
  factor: string;
  occurrences: number;
  pct: number;
}

export interface PatternsData {
  user_id: number;
  user_name: string;
  is_demo_profile: boolean;
  profile_version: number;
  total_recorded_situations: number;
  sensitivities: {
    noise: number;
    crowd: number;
    brightness: number;
    routine_change: number;
    unfamiliar_location: number;
  };
  effectiveness: EffectivenessStat[];
  context_distribution: ContextDistributionItem[];
  summary: string;
}
