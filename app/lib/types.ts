export interface UploadResponse {
  success: boolean;
  url?: string;
  fileName?: string;
  message?: string;
  error?: string;
  details?: string;
}

export interface UploadOptions {
  personalityType: string;
  fileName?: string;
  quality?: number;
}

export interface CloudflareR2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
} 