import axios from "axios";
import { HealthStatus, ProblemRequest, SituationAnalysisResponse, DocumentAnalysisResponse, DraftRequest, DraftResponse } from "./types";

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

export default api;
