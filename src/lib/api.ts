import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/autoshorts/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const apiKey = localStorage.getItem('monzed_api_key');
    if (apiKey) {
        config.headers.Authorization = `Bearer ${apiKey}`;
    }
    return config;
});

// --- API Types ---

export interface VideoConfig {
    resolution: '1080p' | '720p';
    min_duration: number;
    max_duration: number;
    clips_count: number;
    quality_preset: 'balanced' | 'best';
}

export interface ContentConfig {
    prompt_style: string;
    custom_prompt?: string;
    language?: string;
}

export interface CaptionConfig {
    enabled: boolean;
    font: string;
    fontsize: number;
    bold: boolean;
    italic: boolean;
    color: string;
    stroke_color: string;
    stroke_width: number;
    position: 'top' | 'center' | 'bottom';
    position_x?: number;
    position_y?: number;
    animation: 'none' | 'fade' | 'pop' | 'bounce' | 'scale_up' | 'karaoke' | 'glow' | 'highlight' | 'word_box';
    text_case: 'uppercase' | 'lowercase' | 'original';
    words_per_caption: number;
    highlight_color: string;
}

export interface BackgroundMusicConfig {
    source_url?: string;
    volume: number;
    loop: boolean;
}

export interface VisualConfig {
    face_tracking: boolean;
    crop_strategy: 'smart_center' | 'center';
    captions: CaptionConfig;
    effects: string[];
}

export interface AudioConfig {
    background_music?: BackgroundMusicConfig;
    voiceover_volume: number;
}

export interface GenerateRequest {
    source_url: string;
    config?: VideoConfig;
    content?: ContentConfig;
    visuals?: VisualConfig;
    audio?: AudioConfig;
    webhook_url?: string;
}

export interface JobResponse {
    job_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    message?: string;
    result?: {
        clips?: Array<{
            clip_id: string;
            download_url: string;
            title?: string;
            summary?: string;
            duration: number;
            virality_score?: number;
            reasoning?: string;
        }>;
    };
    elapsed?: number;
}

// --- API Functions ---

export async function startGeneration(request: GenerateRequest): Promise<JobResponse> {
    const response = await api.post<JobResponse>('/generate', request);
    return response.data;
}

export async function getJobStatus(jobId: string): Promise<JobResponse> {
    const response = await api.get<JobResponse>(`/jobs/${jobId}`);
    return response.data;
}

export async function validateApiKey(): Promise<{ valid: boolean; user?: any; error?: string }> {
    try {
        const response = await api.get('/me');
        return { valid: true, user: response.data };
    } catch (error: any) {
        return { valid: false, error: error.response?.data?.detail || 'Invalid API Key' };
    }
}

export default api;
