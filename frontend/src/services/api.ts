import axios, { AxiosInstance } from 'axios';
import {
  ClassesResponse,
  FramePredictionResponse,
  StaticPredictionResponse,
  SystemStatusResponse,
} from '../types/api';

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = localStorage.getItem('isl_api_base_url') || DEFAULT_API_BASE;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
    localStorage.setItem('isl_api_base_url', this.baseUrl);
    this.client.defaults.baseURL = this.baseUrl;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Health and model status check: GET /api/status
   */
  async getSystemStatus(): Promise<SystemStatusResponse> {
    const response = await this.client.get<SystemStatusResponse>('/api/status');
    return response.data;
  }

  /**
   * Supported sign vocabulary: GET /api/classes
   */
  async getClasses(): Promise<ClassesResponse> {
    const response = await this.client.get<ClassesResponse>('/api/classes');
    return response.data;
  }

  /**
   * Predict normalized 128-d feature vector: POST /api/predict/static
   */
  async predictStatic(features: number[]): Promise<StaticPredictionResponse> {
    if (features.length !== 128) {
      throw new Error(`Expected exactly 128 features, got ${features.length}`);
    }
    const response = await this.client.post<StaticPredictionResponse>('/api/predict/static', {
      features,
    });
    return response.data;
  }

  /**
   * Predict single video/image frame using server-side MediaPipe: POST /api/predict/frame
   */
  async predictFrame(
    file: Blob | File,
    mode: 'STATIC' | 'DYNAMIC' = 'STATIC'
  ): Promise<FramePredictionResponse> {
    const formData = new FormData();
    const filename = file instanceof File ? file.name : 'frame.jpg';
    formData.append('file', file, filename);
    formData.append('mode', mode);

    const response = await this.client.post<FramePredictionResponse>('/api/predict/frame', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 15000,
    });
    return response.data;
  }
}

export const apiService = new ApiClient();

