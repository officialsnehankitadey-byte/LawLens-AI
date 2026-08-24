import axios from "axios";
import {
  HealthStatus,
  ProblemRequest,
  SituationAnalysisResponse,
  DocumentAnalysisResponse,
  DraftRequest,
  DraftResponse,
  SchemeCheckRequest,
  SchemeCheckResponse,
  InterviewStartRequest,
  InterviewStartResponse,
  InterviewSubmitRequest,
  AuthorityRouting,
  LawyerSearchResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

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
  });
  return res.data;
};

export const generateDraft = async (data: DraftRequest): Promise<DraftResponse> => {
  const res = await api.post<DraftResponse>("/draft/generate", data);
  return res.data;
};

export const parseApiError = (err: any): string => {
  if (err?.response?.data?.detail) {
    if (typeof err.response.data.detail === "string") {
      return err.response.data.detail;
    }
    if (Array.isArray(err.response.data.detail)) {
      return err.response.data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
    }
  }
  return err?.message || "An unexpected error occurred. Please try again.";
};

export const checkScheme = async (data: SchemeCheckRequest): Promise<SchemeCheckResponse> => {
  const res = await api.post<SchemeCheckResponse>("/schemes/check", data);
  return res.data;
};

export const startInterview = async (data: InterviewStartRequest): Promise<InterviewStartResponse> => {
  const res = await api.post<InterviewStartResponse>("/interview/start", data);
  return res.data;
};

export const submitInterview = async (data: InterviewSubmitRequest): Promise<DraftResponse> => {
  const res = await api.post<DraftResponse>("/interview/submit", data);
  return res.data;
};

export const searchRights = async (query?: string, category?: string): Promise<any[]> => {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (category) params.set("category", category);
  const res = await api.get<any[]>(`/rights/search?${params.toString()}`);
  return res.data;
};

export const routeAuthority = async (category: string, text: string, location?: string): Promise<AuthorityRouting> => {
  const params = new URLSearchParams();
  params.set("category", category);
  if (text) params.set("text", text);
  if (location) params.set("location", location);
  const res = await api.get<AuthorityRouting>(`/authority/route?${params.toString()}`);
  return res.data;
};

export const generateActionPlan = async (data: Record<string, any>): Promise<any> => {
  const res = await api.post("/action-plan/generate", data);
  return res.data;
};

export default api;