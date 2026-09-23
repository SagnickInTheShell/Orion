import {
  User,
  PersonalProfile,
  ContextData,
  PredictionResponse,
  RecommendResponse,
  FeedbackPayload,
  FeedbackResponse,
  SimulationResponse,
  EventItem,
  PrepPlanResponse,
  PatternsData,
  ContextResponse
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      errMsg = errorJson.detail || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Users & Profiles
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/users`);
    return handleResponse<User[]>(res);
  },

  getUser: async (id: number): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/${id}`);
    return handleResponse<User>(res);
  },

  getProfile: async (userId: number): Promise<PersonalProfile> => {
    const res = await fetch(`${API_BASE}/users/${userId}/profile`);
    return handleResponse<PersonalProfile>(res);
  },

  updateProfile: async (userId: number, profile: Partial<PersonalProfile>): Promise<PersonalProfile> => {
    const res = await fetch(`${API_BASE}/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    return handleResponse<PersonalProfile>(res);
  },

  // Prediction (Support Requirement)
  predictSupport: async (userId: number, context: ContextData): Promise<PredictionResponse> => {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        context: {
          user_id: userId,
          ...context
        }
      })
    });
    return handleResponse<PredictionResponse>(res);
  },

  // Recommendation & Interventions
  getRecommendations: async (userId: number, context: ContextData): Promise<RecommendResponse> => {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        context: {
          user_id: userId,
          ...context
        }
      })
    });
    return handleResponse<RecommendResponse>(res);
  },

  // Learning Feedback Loop
  submitFeedback: async (payload: FeedbackPayload): Promise<FeedbackResponse> => {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<FeedbackResponse>(res);
  },

  // What-If Simulator
  runSimulation: async (
    userId: number,
    context: Partial<ContextData>,
    interventions: string[]
  ): Promise<SimulationResponse> => {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        context,
        interventions
      })
    });
    return handleResponse<SimulationResponse>(res);
  },

  // Prep Mode & Events
  getEvents: async (userId: number): Promise<EventItem[]> => {
    const res = await fetch(`${API_BASE}/events?user_id=${userId}`);
    return handleResponse<EventItem[]>(res);
  },

  createEvent: async (event: EventItem): Promise<EventItem> => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    return handleResponse<EventItem>(res);
  },

  generatePrepPlan: async (event: EventItem): Promise<PrepPlanResponse> => {
    const res = await fetch(`${API_BASE}/events/prep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    return handleResponse<PrepPlanResponse>(res);
  },

  // Patterns & Analytics
  getPatterns: async (userId: number): Promise<PatternsData> => {
    const res = await fetch(`${API_BASE}/patterns?user_id=${userId}`);
    return handleResponse<PatternsData>(res);
  },

  // Context History
  getContextHistory: async (userId: number): Promise<ContextResponse[]> => {
    const res = await fetch(`${API_BASE}/context/history?user_id=${userId}&limit=20`);
    return handleResponse<ContextResponse[]>(res);
  },

  // Seed / Reset
  resetDemoData: async (): Promise<{ status: string; message: string; user_id: number }> => {
    const res = await fetch(`${API_BASE}/seed/reset`, { method: 'POST' });
    return handleResponse<{ status: string; message: string; user_id: number }>(res);
  }
};
