const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export interface FaceDescriptorResponse {
  success: boolean;
  descriptor: number[] | null;
  message: string;
  faces_detected: number;
}

export interface ScanMatch {
  person_id: string;
  person_name: string;
  confidence: number;
  case_number?: string;
  photo_url?: string;
  last_seen_location?: string;
  bbox?: number[];
}

export interface ScanVideoResponse {
  success: boolean;
  matches: ScanMatch[];
  frames_processed: number;
  total_faces_detected: number;
  message: string;
}

export async function generateFaceDescriptor(file: File): Promise<FaceDescriptorResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/generate-descriptor`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate face descriptor');
  }

  return response.json();
}

export async function scanVideo(
  file: File,
  databasePersons: Array<{
    id: string;
    name: string;
    descriptor: number[];
    case_number?: string;
    photo_url?: string;
    last_seen_location?: string;
  }>
): Promise<ScanVideoResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('database_persons', JSON.stringify(databasePersons));

  const response = await fetch(`${API_URL}/scan-video`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to scan video');
  }

  return response.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
