<<<<<<< HEAD
import axios, { AxiosError } from "axios";
import { HealthStatus, ProblemRequest, SituationAnalysisResponse, DocumentAnalysisResponse, DraftRequest, DraftResponse } from "./types";
=======
import axios from "axios";
import {
  HealthStatus,
  ProblemRequest,
  SituationAnalysisResponse,
  DocumentAnalysisResponse,
  DraftRequest,
  DraftResponse,
  LawyerSearchResponse
} from "./types";
>>>>>>> 57e6df32de2413c62cf3a6f6a6b0e12d3c9da57a

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
<<<<<<< HEAD
  timeout: 60000, // 60s — AI calls can take time
=======
  timeout: 120000,
>>>>>>> 57e6df32de2413c62cf3a6f6a6b0e12d3c9da57a
});

/**
 * Converts raw Axios errors into safe, user-facing diagnostic messages.
 * Never exposes API keys, secrets, or raw stack traces.
 */
export function parseApiError(err: unknown): string {
  const axiosErr = err as AxiosError<{ detail?: string }>;
  if (axiosErr.code === "ECONNREFUSED" || axiosErr.code === "ERR_NETWORK" || axiosErr.message === "Network Error") {
    return "Unable to reach the backend server.\n\nTechnical details: Connection refused on http://localhost:8000 — make sure the backend is running (`uvicorn app.main:app --reload --port 8000`).";
  }
  if (axiosErr.code === "ECONNABORTED" || axiosErr.message?.includes("timeout")) {
    return "The analysis request timed out.\n\nTechnical details: No response received from backend within 60 seconds. Try again.";
  }
  if (axiosErr.response) {
    const status = axiosErr.response.status;
    const detail = axiosErr.response.data?.detail;
    if (status === 400) return `Invalid request: ${detail || "Please check your input."}`;
    if (status === 422) return `Validation error: ${detail || "The request format is incorrect."}`;
    if (status === 500) return `Server error: ${detail || "An internal server error occurred. Check backend logs."}`;
    if (status === 503) return "The AI service is temporarily unavailable. Please try again in a moment.";
    return `Server returned HTTP ${status}: ${detail || axiosErr.response.statusText}`;
  }
  return `Unexpected error: ${axiosErr.message || "Unknown error. Check the browser console for details."}`;
}

export const checkHealth = async (): Promise<HealthStatus> => {
  const res = await api.get<HealthStatus>("/health");
  return res.data;
};

export const analyzeProblem = async (data: ProblemRequest): Promise<SituationAnalysisResponse> => {
  const res = await api.post<SituationAnalysisResponse>("/analyze/problem", data);
  return res.data;
};

export const getSuggestedLawyers = async (category: string, location?: string): Promise<LawyerSearchResponse> => {
  const params: Record<string, string> = { category };
  if (location && location.trim()) {
    params.location = location.trim();
  }
  const res = await api.get<LawyerSearchResponse>("/lawyers/suggest", { params });
  return res.data;
};

export const analyzeDocument = async (file: File): Promise<DocumentAnalysisResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post<DocumentAnalysisResponse>("/analyze/document", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 90000, // 90s for document processing
  });
  return res.data;
};

export const generateDraft = async (data: DraftRequest): Promise<DraftResponse> => {
  const res = await api.post<DraftResponse>("/draft/generate", data);
  return res.data;
};

export default api;
