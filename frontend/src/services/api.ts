const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type InterviewStatus = "CREATED" | "IN_PROGRESS" | "COMPLETED";
export interface Interview { id: string; candidate_name: string; role: string; status: InterviewStatus; created_at: string; started_at: string | null; ended_at: string | null; }
export interface InterviewCreate { candidate_name: string; role: string; }
export interface AudioMetadata { id: string; interview_id: string; original_filename: string | null; content_type: string; file_size: number; created_at: string; }

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = "Something went wrong";
    try { const data = await response.json(); if (typeof data.detail === "string") message = data.detail; } catch {}
    throw new Error(message);
  }
  return response.json();
}

export async function checkBackendHealth(): Promise<{ status: string }> { return handleResponse(await fetch(`${API_BASE_URL}/health`)); }
export async function createInterview(data: InterviewCreate): Promise<Interview> { return handleResponse(await fetch(`${API_BASE_URL}/api/v1/interviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })); }
export async function getInterview(interviewId: string): Promise<Interview> { return handleResponse(await fetch(`${API_BASE_URL}/api/v1/interviews/${interviewId}`)); }
export async function startInterview(interviewId: string): Promise<Interview> { return handleResponse(await fetch(`${API_BASE_URL}/api/v1/interviews/${interviewId}/start`, { method: "POST" })); }
export async function endInterview(interviewId: string): Promise<Interview> { return handleResponse(await fetch(`${API_BASE_URL}/api/v1/interviews/${interviewId}/end`, { method: "POST" })); }

export async function uploadInterviewAudio(interviewId: string, file: Blob, filename = "recording.webm"): Promise<AudioMetadata> {
  const form = new FormData();
  form.append("file", file, filename);
  return handleResponse(await fetch(`${API_BASE_URL}/api/v1/interviews/${interviewId}/audio`, { method: "POST", body: form }));
}

export async function getInterviewAudio(interviewId: string): Promise<AudioMetadata> {
  return handleResponse(await fetch(`${API_BASE_URL}/api/v1/interviews/${interviewId}/audio`));
}
