/**
 * Timeline Context - Clean state management for Timeline-first interface
 * Following the successful OnboardingContext pattern
 */
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { authFetch, getAuthToken } from '../utils/authFetch';

const TimelineContext = createContext();

// Timeline state reducer
const timelineReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        ...action.payload
      };
    case 'LOAD_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'UPDATE_ALIGNMENT': {
      const payload = action.payload;
      // Accept either a numeric score or an object with details
      const score = typeof payload === 'number' ? payload : (payload?.score ?? state.alignmentScore);
      const trend = typeof payload === 'object' && payload !== null ? (payload.trend ?? state.alignmentTrend) : state.alignmentTrend;
      const status = typeof payload === 'object' && payload !== null ? (payload.status ?? state.alignmentStatus) : state.alignmentStatus;
      const recommendations = typeof payload === 'object' && payload !== null ? (payload.recommendations ?? state.alignmentRecommendations) : state.alignmentRecommendations;
      return {
        ...state,
        alignmentScore: score,
        alignmentTrend: trend,
        alignmentStatus: status,
        alignmentRecommendations: recommendations
      };
    }
    case 'ADD_MILESTONE':
      return {
        ...state,
        milestones: [...(state.milestones || []), action.payload]
      };
    case 'UPDATE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.map(m => 
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        )
      };
    case 'SET_PERSONA':
      return {
        ...state,
        persona: action.payload
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  // User context
  persona: null,
  currentAge: null,
  currentPhase: null,
  // Timeline data
  milestones: [],
  timelineSpan: null,
  confidenceBands: null,
  // Alignment data
  alignmentScore: null,
  alignmentTrend: null,
  alignmentStatus: null,
  alignmentRecommendations: null,
  // Dashboard data
  nextMilestone: null,
  quickActions: [],
  personaInsights: []
};

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const TimelineProvider = ({ children }) => {
  const [state, dispatch] = useReducer(timelineReducer, initialState);

  // Token helper comes from utils/authFetch

  // Load Timeline journey data
  const loadTimelineJourney = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    dispatch({ type: 'LOADING' });

    try {
      // Add a timeout to prevent indefinite spinners if the API hangs
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 10000);

      const response = await authFetch(`${API_BASE}/api/v1/timeline/journey`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(t);

      if (!response.ok) {
        throw new Error(`Failed to load Timeline: ${response.status}`);
      }

      const journeyData = await response.json();
      
      dispatch({
        type: 'LOAD_SUCCESS',
        payload: {
          persona: journeyData.persona,
          currentAge: journeyData.current_age,
          currentPhase: journeyData.current_phase,
          milestones: journeyData.milestones || [],
          timelineSpan: journeyData.timeline_span,
          confidenceBands: journeyData.confidence_bands,
          alignmentScore: journeyData.alignment_score,
          nextMilestone: journeyData.next_milestone
        }
      });

    } catch (error) {
      console.error('Timeline journey loading failed:', error);
      dispatch({
        type: 'LOAD_ERROR',
        payload: error.name === 'AbortError' ? 'Request timed out' : (error.message || 'Failed to load')
      });
    }
  }, []);

  // Load alignment details
  const loadAlignmentDetails = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await authFetch(`${API_BASE}/api/v1/timeline/alignment`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load alignment: ${response.status}`);
      }

      const alignmentData = await response.json();
      
      dispatch({
        type: 'UPDATE_ALIGNMENT',
        payload: {
          score: alignmentData.daily_score,
          trend: alignmentData.score_trend,
          status: alignmentData.status,
          recommendations: alignmentData.recommendations
        }
      });

    } catch (error) {
      console.error('Alignment loading failed:', error);
    }
  }, []);

  // Load dashboard overview
  const loadDashboardOverview = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await authFetch(`${API_BASE}/api/v1/timeline/dashboard-overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load dashboard: ${response.status}`);
      }

      const dashboardData = await response.json();
      
      if (dashboardData.timeline_ready) {
        dispatch({
          type: 'LOAD_SUCCESS',
          payload: {
            persona: dashboardData.user_context.persona,
            currentAge: dashboardData.user_context.age,
            currentPhase: dashboardData.user_context.life_phase,
            quickActions: dashboardData.quick_actions || [],
            personaWelcome: dashboardData.persona_welcome
          }
        });
      }

    } catch (error) {
      console.error('Dashboard overview loading failed:', error);
    }
  }, []);

  // Add new milestone
  const addMilestone = useCallback(async (milestoneData) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await authFetch(`${API_BASE}/api/v1/timeline/milestone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(milestoneData)
      });

      if (!response.ok) {
        throw new Error(`Failed to add milestone: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        dispatch({
          type: 'ADD_MILESTONE',
          payload: result.milestone
        });
        
        // Update alignment score
        if (result.updated_alignment_score) {
          dispatch({
            type: 'UPDATE_ALIGNMENT',
            payload: result.updated_alignment_score
          });
        }
      }

      return result;

    } catch (error) {
      console.error('Milestone creation failed:', error);
      // Local-first fallback
      try {
        const loc = { ...(milestoneData || {}), id: `local_ms_${Date.now()}` };
        const raw = localStorage.getItem('milestones_local') || '[]';
        const arr = JSON.parse(raw);
        localStorage.setItem('milestones_local', JSON.stringify([...arr, loc]));
        dispatch({ type: 'ADD_MILESTONE', payload: loc });
        return { success: true, milestone: loc, fallback: true };
      } catch (_) {}
      throw error;
    }
  }, []);

  // Initialize Timeline on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      loadTimelineJourney();
      loadDashboardOverview();
    }
  }, [loadTimelineJourney, loadDashboardOverview]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    loadTimelineJourney,
    loadAlignmentDetails,
    loadDashboardOverview,
    addMilestone,
    
    // Computed values
    isTimelineReady: !state.loading && state.persona && state.milestones.length > 0,
    personaTheme: getPersonaTheme(state.persona),
    nextMilestoneDistance: calculateMilestoneDistance(state.nextMilestone, state.currentAge)
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};

// Hook to use Timeline context
export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within TimelineProvider');
  }
  return context;
};

// Helper functions
const getPersonaTheme = (persona) => {
  const themes = {
    'Jamal': {
      primary: '#2563eb',
      secondary: '#dbeafe',
      accent: '#1d4ed8',
      name: 'Investment Blue'
    },
    'Aisha': {
      primary: '#7c3aed',
      secondary: '#ede9fe',
      accent: '#5b21b6',
      name: 'Family Purple'
    },
    'Samuel': {
      primary: '#059669',
      secondary: '#d1fae5',
      accent: '#047857',
      name: 'Stability Green'
    }
  };
  
  return themes[persona] || themes['Jamal'];
};

const calculateMilestoneDistance = (nextMilestone, currentAge) => {
  if (!nextMilestone || !currentAge) return null;
  
  const yearsAway = nextMilestone.age - currentAge;
  if (yearsAway <= 1) {
    return `${Math.round(yearsAway * 12)} months away`;
  }
  return `${yearsAway.toFixed(1)} years away`;
};

export default TimelineContext;
