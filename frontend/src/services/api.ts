const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function checkBackendHealth(): Promise<{
  status: string;
}> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("Backend health check failed");
  }

  return response.json();
}
export type InterviewStatus =
  | "CREATED"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface Interview {
  id: string;
  candidate_name: string;
  role: string;
  status: InterviewStatus;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface InterviewCreate {
  candidate_name: string;
  role: string;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const data = await response.json();
      message =
        typeof data.detail === "string"
          ? data.detail
          : message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  return response.json();
}

export async function createInterview(
  data: InterviewCreate
): Promise<Interview> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/interviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function getInterview(
  interviewId: string
): Promise<Interview> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/interviews/${interviewId}`
  );

  return handleResponse(response);
}

export async function startInterview(
  interviewId: string
): Promise<Interview> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/interviews/${interviewId}/start`,
    {
      method: "POST",
    }
  );

  return handleResponse(response);
}

export async function endInterview(
  interviewId: string
): Promise<Interview> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/interviews/${interviewId}/end`,
    {
      method: "POST",
    }
  );

  return handleResponse(response);
}