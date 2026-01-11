import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Download,
    Loader2,
    LogOut,
    Video,
    Sparkles,
    CheckCircle2,
    XCircle,
    Clock,
    Zap,
    Settings,
    Film,
    Type,
    Palette,
    CreditCard,
    User,
    ExternalLink,
    Monitor,
    Layout,
    Layers,
    Music,
    Maximize,
    Globe,
    Globe2,
    Hash,
    Activity,
    ChevronDown,
    RefreshCw,
    Edit3,
    MousePointer2,
    Book,
    FileText,
    Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { startGeneration, getJobStatus, type JobResponse, type GenerateRequest } from '@/lib/api';

interface PlaygroundProps {
    user: any;
    onLogout: () => void;
}

const ANIMATIONS = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'pop', label: 'Pop' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'scale_up', label: 'Scale Up' },
    { value: 'karaoke', label: 'Karaoke' },
    { value: 'glow', label: 'Glow' },
    { value: 'highlight', label: 'Highlight' },
    { value: 'word_box', label: 'Word Box' },
];

const FONTS = ['Arial', 'Inter', 'Roboto', 'Montserrat', 'Impact', 'Verdana', 'Georgia', 'Courier New'];
const LANGUAGES = [
    { value: 'auto', label: 'Auto Detect' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'it', label: 'Italian' },
    { value: 'nl', label: 'Dutch' },
];

export default function Playground({ user, onLogout }: PlaygroundProps) {
    // --- Form State ---
    const [sourceUrl, setSourceUrl] = useState('');

    // Video Config
    const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
    const [clipsCount, setClipsCount] = useState(1);
    const [minDuration, setMinDuration] = useState(15);
    const [maxDuration, setMaxDuration] = useState(60);
    const [qualityPreset, setQualityPreset] = useState<'balanced' | 'best'>('balanced');
    const [hardware, setHardware] = useState<'cpu' | 'gpu'>('cpu');

    // Captions
    const [captionsEnabled, setCaptionsEnabled] = useState(true);
    const [captionFont, setCaptionFont] = useState('Inter');
    const [captionFontSize, setCaptionFontSize] = useState(40);
    const [captionBold, setCaptionBold] = useState(true);
    const [captionItalic, setCaptionItalic] = useState(false);
    const [captionColor, setCaptionColor] = useState('#FFFFFF');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(3.0);
    const [captionPosition, setCaptionPosition] = useState<'top' | 'center' | 'bottom'>('center');
    const [positionX, setPositionX] = useState<number | null>(null);
    const [positionY, setPositionY] = useState<number | null>(null);
    const [captionAnimation, setCaptionAnimation] = useState<'none' | 'fade' | 'pop' | 'bounce' | 'scale_up' | 'karaoke' | 'glow' | 'highlight' | 'word_box'>('word_box');
    const [textCase, setTextCase] = useState<'uppercase' | 'lowercase' | 'original'>('uppercase');
    const [wordsPerCaption, setWordsPerCaption] = useState(3);
    const [highlightColor, setHighlightColor] = useState('#3b82f6');

    // Visuals
    const [faceTracking, setFaceTracking] = useState(true);
    const [cropStrategy, setCropStrategy] = useState<'smart_center' | 'center'>('smart_center');

    // Audio
    const [bgMusicUrl, setBgMusicUrl] = useState('');
    const [bgMusicVolume, setBgMusicVolume] = useState(0.15);
    const [bgMusicLoop, setBgMusicLoop] = useState(true);
    const [voiceoverVolume, setVoiceoverVolume] = useState(1.0);

    // Content
    const [promptStyle, setPromptStyle] = useState('viral_hook');
    const [customPrompt, setCustomPrompt] = useState('');
    const [language, setLanguage] = useState('auto');

    // Webhook
    const [webhookUrl, setWebhookUrl] = useState('');

    // Effects
    const [selectedEffects, setSelectedEffects] = useState<string[]>([]);

    // --- Job State ---
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentJob, setCurrentJob] = useState<JobResponse | null>(null);
    const [liveElapsed, setLiveElapsed] = useState(0);
    const [error, setError] = useState('');
    const [selectedClip, setSelectedClip] = useState<{ url: string; id: string } | null>(null);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearTimeout(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const pollJobStatus = useCallback(async (jobId: string) => {
        try {
            const status = await getJobStatus(jobId);
            setCurrentJob(status);
            if (status.elapsed) setLiveElapsed(Math.floor(status.elapsed));

            if (status.status === 'completed' || status.status === 'failed') {
                stopPolling();
                setIsGenerating(false);
                // Auto-select first clip if available
                if (status.status === 'completed' && status.result?.clips?.length) {
                    setSelectedClip({
                        url: status.result.clips[0].download_url,
                        id: status.result.clips[0].clip_id
                    });
                }
                return;
            }

            // Schedule next poll
            pollingRef.current = setTimeout(() => pollJobStatus(jobId), 15000);
        } catch (e) {
            // Retry after delay on error
            pollingRef.current = setTimeout(() => pollJobStatus(jobId), 5000);
        }
    }, [stopPolling]);

    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isGenerating && currentJob && (currentJob.status === 'queued' || currentJob.status === 'processing')) {
            timer = setInterval(() => {
                setLiveElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isGenerating, currentJob?.status]);

    const handleGenerate = async () => {
        if (!sourceUrl.trim()) {
            setError('Source URL is required');
            return;
        }

        setError('');
        setIsGenerating(true);
        setCurrentJob(null);
        setLiveElapsed(0);

        const request: GenerateRequest = {
            source_url: sourceUrl,
            config: {
                resolution,
                clips_count: clipsCount,
                min_duration: minDuration,
                max_duration: maxDuration,
                quality_preset: qualityPreset,
            },
            content: {
                prompt_style: promptStyle,
                custom_prompt: customPrompt || undefined,
                language: language,
            },
            visuals: {
                face_tracking: faceTracking,
                crop_strategy: cropStrategy,
                effects: selectedEffects,
                captions: {
                    enabled: captionsEnabled,
                    font: captionFont,
                    fontsize: captionFontSize,
                    bold: captionBold,
                    italic: captionItalic,
                    color: captionColor,
                    stroke_color: strokeColor,
                    stroke_width: strokeWidth,
                    position: captionPosition,
                    position_x: positionX !== null ? positionX : undefined,
                    position_y: positionY !== null ? positionY : undefined,
                    animation: captionAnimation,
                    text_case: textCase,
                    words_per_caption: wordsPerCaption,
                    highlight_color: highlightColor,
                },
            },
            audio: {
                voiceover_volume: voiceoverVolume,
                background_music: bgMusicUrl ? {
                    source_url: bgMusicUrl,
                    volume: bgMusicVolume,
                    loop: bgMusicLoop,
                } : undefined,
            },
            webhook_url: webhookUrl || undefined,
        };

        try {
            const response = await startGeneration(request);
            setCurrentJob(response);
            pollJobStatus(response.job_id);
        } catch (e: any) {
            setError(e.response?.data?.detail || 'Operation failed');
            setIsGenerating(false);
        }
    };

    const formatElapsed = (seconds?: number) => {
        if (!seconds) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
            {/* Navbar */}
            <nav className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center sticky top-0 z-50">
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Video className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold tracking-tight text-slate-900 uppercase italic">Autoshorts AI</span>
                        </div>
                        <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Engine Playground</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end mr-1 hidden sm:flex">
                                <span className="text-[10px] font-bold text-slate-900 leading-none">{user?.email || 'N/A'}</span>
                                <span className="text-[9px] text-slate-500 font-medium mt-1 uppercase tracking-tight">{user?.tier || 'Pro'} Tier</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-500" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-600 tracking-tight">{user?.credits?.toLocaleString() ?? 0}</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 px-3 border-emerald-200 hover:bg-emerald-50 text-emerald-600 font-bold text-[9px] gap-2 rounded-xl uppercase tracking-widest transition-all"
                        >
                            <a href="https://monzed.com/client/api" target="_blank" rel="noopener noreferrer">
                                <Rocket className="w-3 h-3" />
                                Upgrade
                            </a>
                        </Button>

                        <Button
                            variant="default"
                            size="sm"
                            asChild
                            className="hidden lg:flex h-9 px-4 bg-primary hover:bg-primary/90 text-white font-bold text-[10px] gap-2 rounded-xl uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            <a href="https://monzed.com/products" target="_blank" rel="noopener noreferrer">
                                <Rocket className="w-3.5 h-3.5" />
                                Contact sales
                            </a>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="hidden md:flex h-9 px-3 hover:bg-slate-100 font-bold text-[10px] gap-2 text-slate-500 rounded-xl uppercase tracking-widest"
                        >
                            <a href="https://monzed.com/apis/autoshorts" target="_blank" rel="noopener noreferrer">
                                <Book className="w-3.5 h-3.5 opacity-60" />
                                API Docs
                            </a>
                        </Button>

                        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 py-10 flex-1">
                <div className="grid gap-10 lg:grid-cols-12">

                    {/* Controls - 5 Columns */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="space-y-1 mb-2">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">Generation Console</h2>
                            <p className="text-xs text-slate-500">Fine-tune every aspect of your video asset.</p>
                        </div>

                        <Tabs defaultValue="core" className="w-full">
                            <TabsList className="grid w-full grid-cols-5 mb-6 bg-slate-100 p-1 rounded-xl">
                                <TabsTrigger value="core" className="flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Core</TabsTrigger>
                                <TabsTrigger value="subs" className="flex items-center gap-2"><Type className="w-3.5 h-3.5" /> Caps</TabsTrigger>
                                <TabsTrigger value="visual" className="flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> Visual</TabsTrigger>
                                <TabsTrigger value="audio" className="flex items-center gap-2"><Music className="w-3.5 h-3.5" /> Audio</TabsTrigger>
                                <TabsTrigger value="more" className="flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> More</TabsTrigger>
                            </TabsList>

                            {/* Core Options */}
                            <TabsContent value="core" className="space-y-6 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Film className="w-3 h-3" /> Input Source</Label>
                                        <p className="text-[9px] text-slate-400 font-medium leading-tight">Direct link to source video. We support all major social platforms like YouTube, TikTok, and Twitch.</p>
                                        <div className="relative">
                                            <Input
                                                placeholder="YouTube, TikTok, Twitch, or Direct URL..."
                                                value={sourceUrl}
                                                onChange={(e) => setSourceUrl(e.target.value)}
                                                disabled={isGenerating}
                                                className="h-11 bg-white border-slate-200 pl-10 text-sm rounded-xl focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                            />
                                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-[9px] text-slate-400 font-medium">Supports: YouTube, Twitch, TikTok, IG, & Direct Links</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> AI Content Focus</Label>
                                        <p className="text-[9px] text-slate-400 font-medium leading-tight">Influences how AI selects highlights. Storytelling focuses on narrative, Viral Hooks on high energy.</p>
                                        <select
                                            value={promptStyle}
                                            onChange={(e) => setPromptStyle(e.target.value)}
                                            className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium appearance-none"
                                        >
                                            <option value="viral_hook">🔥 Viral Hooks (High Energy)</option>
                                            <option value="storytelling">📖 Storytelling (Deep Context)</option>
                                            <option value="educational">🎓 Educational (Facts/Tutorials)</option>
                                            <option value="aggressive">⚡ Hype/Growth (Aggressive)</option>
                                            <option value="funny">😂 Funny (Jokes/Comedy)</option>
                                            <option value="inspirational">💡 Inspirational (Motivation)</option>
                                            <option value="news">📰 News & Events (Factual)</option>
                                            <option value="custom">✨ Custom Prompt...</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/60 shadow-sm">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-bold text-slate-900 flex items-center gap-2"><User className="w-3.5 h-3.5 text-primary" /> Auto Face Tracking</Label>
                                            <p className="text-[10px] text-slate-500 font-medium">AI centered framing on the person speaking</p>
                                        </div>
                                        <Switch checked={faceTracking} onCheckedChange={setFaceTracking} />
                                    </div>

                                    <AnimatePresence>
                                        {promptStyle === 'custom' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                                                <Textarea
                                                    placeholder="Describe exactly what the AI should find (e.g., 'Focus only on technical jokes'...)"
                                                    value={customPrompt}
                                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                                    className="min-h-[100px] bg-white border-slate-200 text-sm rounded-xl focus:ring-primary/10 transition-all shadow-sm"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Monitor className="w-3 h-3" /> Resolution</Label>
                                        <p className="text-[9px] text-slate-400 font-medium leading-tight">Output dimensions. 1080p is recommended for TikTok/Reels.</p>
                                        <select
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value as any)}
                                            className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium appearance-none"
                                        >
                                            <option value="1080p">1080p High</option>
                                            <option value="720p">720p Standard</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Activity className="w-3 h-3" /> Output Quality</Label>
                                        <p className="text-[9px] text-slate-400 font-medium leading-tight">Encoding intensity. Maximum uses higher bitrate for better visual clarity.</p>
                                        <select
                                            value={qualityPreset}
                                            onChange={(e) => setQualityPreset(e.target.value as any)}
                                            className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium appearance-none"
                                        >
                                            <option value="balanced">Balanced</option>
                                            <option value="best">Maximum</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Zap className="w-3 h-3" /> Compute Engine</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setHardware('cpu')}
                                            className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${hardware === 'cpu'
                                                ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${hardware === 'cpu' ? 'bg-primary' : 'bg-slate-300'}`} />
                                                <span className={`text-[11px] font-bold ${hardware === 'cpu' ? 'text-primary' : 'text-slate-700'}`}>Standard CPU</span>
                                                <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">Slow</span>
                                            </div>
                                            <span className="text-[9px] text-slate-500 font-medium leading-tight">Shared infrastructure. Slower processing speed (Best for non-urgent tasks).</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (user?.tier === 'Pro' || user?.tier === 'Premium' || user?.tier === 'Scale' || user?.tier === 'Enterprise') {
                                                    setHardware('gpu');
                                                }
                                            }}
                                            disabled={!(user?.tier === 'Pro' || user?.tier === 'Premium' || user?.tier === 'Scale' || user?.tier === 'Enterprise')}
                                            className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${hardware === 'gpu'
                                                ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                                                : 'bg-white border-slate-200'
                                                } ${!(user?.tier === 'Pro' || user?.tier === 'Premium' || user?.tier === 'Scale' || user?.tier === 'Enterprise') ? 'opacity-60 grayscale-[0.5]' : 'hover:border-slate-300'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${hardware === 'gpu' ? 'bg-primary' : 'bg-slate-300'}`} />
                                                <span className={`text-[11px] font-bold ${hardware === 'gpu' ? 'text-primary' : 'text-slate-700'}`}>GPU Cluster</span>
                                                <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">10x Faster</span>
                                                {!(user?.tier === 'Pro' || user?.tier === 'Premium' || user?.tier === 'Scale' || user?.tier === 'Enterprise') && (
                                                    <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter ml-auto">Pro</span>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-slate-500 font-medium leading-tight">Instant generation utilizing NVIDIA T4 GPUs. No wait times.</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Layers className="w-3 h-3" /> Clips Count: {clipsCount}</Label>
                                        <p className="text-[9px] text-slate-400 font-medium leading-tight">Total number of viral segments the AI will attempt to extract.</p>
                                    </div>
                                    <Slider
                                        value={[clipsCount]}
                                        min={1} max={10} step={1}
                                        onValueChange={(v) => setClipsCount(v[0])}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> Min Dur: {minDuration}s</Label>
                                        <p className="text-[9px] text-slate-400 font-medium leading-tight">Minimum length for each clip.</p>
                                        <Slider value={[minDuration]} min={5} max={300} step={5} onValueChange={(v) => setMinDuration(v[0])} />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> Max Dur: {maxDuration}s</Label>
                                        <p className="text-[9px] text-slate-400 font-medium leading-tight">Maximum length for each clip.</p>
                                        <Slider value={[maxDuration]} min={10} max={300} step={10} onValueChange={(v) => setMaxDuration(v[0])} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Captions Options */}
                            <TabsContent value="subs" className="space-y-6 animate-in fade-in slide-in-from-left-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-slate-900">Enable Subtitles</Label>
                                        <p className="text-[10px] text-slate-500 font-medium">Auto-generate AI transcribed captions</p>
                                    </div>
                                    <Switch checked={captionsEnabled} onCheckedChange={setCaptionsEnabled} />
                                </div>

                                {captionsEnabled && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Font Family</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight text-justify">Selection of premium, highly legible fonts optimized for short-form mobile viewing.</p>
                                                <select
                                                    value={captionFont}
                                                    onChange={(e) => setCaptionFont(e.target.value)}
                                                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium appearance-none"
                                                >
                                                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Animation</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight text-justify">Dynamic reveal effects. "Word Box" and "Highlight" are proven to increase viewer retention.</p>
                                                <select
                                                    value={captionAnimation}
                                                    onChange={(e) => setCaptionAnimation(e.target.value as any)}
                                                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium appearance-none"
                                                >
                                                    {ANIMATIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Size: {captionFontSize}</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight">Scale of the text.</p>
                                                <Slider value={[captionFontSize]} min={20} max={80} step={2} onValueChange={(v) => setCaptionFontSize(v[0])} />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Position</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight">Vertical anchor.</p>
                                                <select value={captionPosition} onChange={(e) => setCaptionPosition(e.target.value as any)} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-2 text-xs font-medium appearance-none">
                                                    <option value="top">Top</option>
                                                    <option value="center">Center</option>
                                                    <option value="bottom">Bottom</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Text Style</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight">Casing format.</p>
                                                <select value={textCase} onChange={(e) => setTextCase(e.target.value as any)} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-2 text-xs font-medium appearance-none">
                                                    <option value="uppercase">ALL CAPS</option>
                                                    <option value="lowercase">lowercase</option>
                                                    <option value="original">Standard</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offset X (Optional)</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight">Precise horizontal push from center.</p>
                                                <Input
                                                    type="number"
                                                    placeholder="Center"
                                                    value={positionX ?? ''}
                                                    onChange={(e) => setPositionX(e.target.value ? parseInt(e.target.value) : null)}
                                                    className="h-10 text-xs rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offset Y (Optional)</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight">Precise vertical push from anchor.</p>
                                                <Input
                                                    type="number"
                                                    placeholder="Center"
                                                    value={positionY ?? ''}
                                                    onChange={(e) => setPositionY(e.target.value ? parseInt(e.target.value) : null)}
                                                    className="h-10 text-xs rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Fill</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight">Primary text color.</p>
                                                <div className="flex gap-2">
                                                    <div className="w-9 h-9 rounded-lg border border-slate-200 relative overflow-hidden bg-slate-100 shrink-0">
                                                        <input type="color" value={captionColor} onChange={(e) => setCaptionColor(e.target.value)} className="absolute inset-0 scale-150 cursor-pointer" />
                                                    </div>
                                                    <Input value={captionColor} onChange={(e) => setCaptionColor(e.target.value)} className="h-9 text-[10px] font-mono uppercase bg-transparent p-1 border-slate-200" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stroke</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight">Outer border color.</p>
                                                <div className="flex gap-2">
                                                    <div className="w-9 h-9 rounded-lg border border-slate-200 relative overflow-hidden bg-slate-100 shrink-0">
                                                        <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="absolute inset-0 scale-150 cursor-pointer" />
                                                    </div>
                                                    <Input value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="h-9 text-[10px] font-mono uppercase bg-transparent p-1 border-slate-200" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Word</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight">The "Follow-Along" color.</p>
                                                <div className="flex gap-2">
                                                    <div className="w-9 h-9 rounded-lg border border-slate-200 relative overflow-hidden bg-slate-100 shrink-0">
                                                        <input type="color" value={highlightColor} onChange={(e) => setHighlightColor(e.target.value)} className="absolute inset-0 scale-150 cursor-pointer" />
                                                    </div>
                                                    <Input value={highlightColor} onChange={(e) => setHighlightColor(e.target.value)} className="h-9 text-[10px] font-mono uppercase bg-transparent p-1 border-slate-200" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 items-end">
                                            <div className="space-y-3 flex-1">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stroke Width: {strokeWidth}</Label>
                                                <p className="text-[9px] text-slate-400 font-medium leading-tight">Outline thickness for punchy visuals.</p>
                                                <Slider value={[strokeWidth]} min={0} max={10} step={0.5} onValueChange={(v) => setStrokeWidth(v[0])} />
                                            </div>
                                            <div className="flex flex-col items-center gap-2 pb-1">
                                                <Switch checked={captionBold} onCheckedChange={setCaptionBold} />
                                                <Label className="text-[9px] font-bold uppercase text-slate-400">Bold</Label>
                                            </div>
                                            <div className="flex flex-col items-center gap-2 pb-1">
                                                <Switch checked={captionItalic} onCheckedChange={setCaptionItalic} />
                                                <Label className="text-[9px] font-bold uppercase text-slate-400">Italic</Label>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-right">Cadence: {wordsPerCaption} words</Label>
                                            <p className="text-[9px] text-slate-400 font-medium leading-tight text-right">Words per frame. Lower values increase the "TikTok speed" feel.</p>
                                            <Slider value={[wordsPerCaption]} min={1} max={10} step={1} onValueChange={(v) => setWordsPerCaption(v[0])} />
                                        </div>
                                    </>
                                )}
                            </TabsContent>

                            {/* Visual Options */}
                            <TabsContent value="visual" className="space-y-6 animate-in fade-in slide-in-from-left-4">
                                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold text-slate-900">Auto Face Tracking</Label>
                                            <p className="text-[11px] text-slate-500 font-medium">Detects and centers on human subjects</p>
                                        </div>
                                        <Switch checked={faceTracking} onCheckedChange={setFaceTracking} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cinematic Effects</Label>
                                    <p className="text-[9px] text-slate-400 font-medium leading-tight">Post-processing overlays to enhance the visual style of your clips.</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'vignette', label: '🎬 Vignette', desc: 'Dark Corners' },
                                            { id: 'glitch', label: '👾 Glitch', desc: 'RGB Split' },
                                            { id: 'shake', label: '📹 Shake', desc: 'Handheld look' },
                                            { id: 'vintage', label: '📽️ Vintage', desc: 'Sepia/Old' },
                                            { id: 'blackwhite', label: '◻️ B&W', desc: 'Classic Look' },
                                            { id: 'soft_glow', label: '✨ Glow', desc: 'Soft Bloom' },
                                            { id: 'sharpen', label: '🔲 Sharpen', desc: 'Edge Detail' },
                                            { id: 'blur', label: '🌫️ Blur', desc: 'Gaussian' },
                                            { id: 'slow_zoom_in', label: '🔍 Zoom In', desc: 'Slow Creep' },
                                        ].map(effect => (
                                            <button
                                                key={effect.id}
                                                onClick={() => {
                                                    setSelectedEffects(prev =>
                                                        prev.includes(effect.id)
                                                            ? prev.filter(e => e !== effect.id)
                                                            : [...prev, effect.id]
                                                    );
                                                }}
                                                className={`flex flex-col items-start p-3 rounded-2xl border transition-all text-left ${selectedEffects.includes(effect.id)
                                                    ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <span className={`text-[11px] font-bold ${selectedEffects.includes(effect.id) ? 'text-primary' : 'text-slate-700'}`}>{effect.label}</span>
                                                <span className="text-[9px] text-slate-400 font-medium">{effect.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utility Filters</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'fadein', label: '🌅 Fade In' },
                                            { id: 'fadeout', label: '🌆 Fade Out' },
                                            { id: 'mirror', label: '↔️ Mirror' },
                                            { id: 'invert_colors', label: '💎 Invert' },
                                            { id: 'speed_up', label: '⏩ Speed 1.5x' },
                                            { id: 'slow_down', label: '🐌 Slow 0.75x' },
                                        ].map(effect => (
                                            <button
                                                key={effect.id}
                                                onClick={() => {
                                                    setSelectedEffects(prev =>
                                                        prev.includes(effect.id)
                                                            ? prev.filter(e => e !== effect.id)
                                                            : [...prev, effect.id]
                                                    );
                                                }}
                                                className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${selectedEffects.includes(effect.id)
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                    : 'bg-white border-slate-200 text-slate-500'
                                                    }`}
                                            >
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{effect.label}</span>
                                                {selectedEffects.includes(effect.id) && <CheckCircle2 className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Audio Options */}
                            <TabsContent value="audio" className="space-y-6 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Voice Gain: {Math.round(voiceoverVolume * 100)}%</Label>
                                    <p className="text-[9px] text-slate-400 font-medium leading-tight">Master volume offset for the original video speech. Boost if the source is quiet.</p>
                                    <Slider value={[voiceoverVolume]} min={0} max={2} step={0.05} onValueChange={(v) => setVoiceoverVolume(v[0])} />
                                </div>

                                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Music className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">Background Music</span>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Music URL (.mp3)</Label>
                                        <p className="text-[9px] text-slate-400 font-medium leading-tight">Overlay custom music. The engine will auto-duck the volume during speech.</p>
                                        <Input
                                            placeholder="Paste direct audio link"
                                            value={bgMusicUrl}
                                            onChange={(e) => setBgMusicUrl(e.target.value)}
                                            className="h-11 bg-slate-50 border-slate-200 text-sm rounded-xl"
                                        />
                                    </div>

                                    {bgMusicUrl && (
                                        <div className="animate-in fade-in slide-in-from-top-2 space-y-5 pt-2">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Music Volume: {Math.round(bgMusicVolume * 100)}%</Label>
                                                <Slider value={[bgMusicVolume]} min={0} max={1} step={0.01} onValueChange={(v) => setBgMusicVolume(v[0])} />
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                <Label className="text-[11px] font-bold text-slate-700 uppercase">Seamless Looping</Label>
                                                <Switch checked={bgMusicLoop} onCheckedChange={setBgMusicLoop} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* More (Content/Webhook) */}
                            <TabsContent value="more" className="space-y-6 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transcription Language</Label>
                                    <p className="text-[9px] text-slate-400 font-medium leading-tight">Source language of the video. 'Auto' uses AI detection (suggested).</p>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium appearance-none"
                                    >
                                        {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Callback Webhook (POST)</Label>
                                    <p className="text-[9px] text-slate-400 font-medium leading-tight">Advanced: Send a POST request to your server when generation is finished.</p>
                                    <div className="relative">
                                        <Input
                                            placeholder="https://api.yourbrand.com/events"
                                            value={webhookUrl}
                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                            className="h-11 bg-white border-slate-200 pl-10 text-sm rounded-xl focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                        />
                                        <Globe2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <div className="flex gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-primary/80 font-bold uppercase tracking-tight leading-relaxed">
                                            Developer Tip: Use webhooks to receive high-fidelity asset notifications instantly when processing hits 100%.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-xs text-rose-600 font-bold shadow-sm">
                                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* CTA */}
                        <Button
                            className="w-full h-14 font-bold text-sm tracking-wide rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] group"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Provisioning Engine...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                                    <span>Initialize Pipeline Job</span>
                                    <ChevronDown className="w-4 h-4 opacity-40 ml-1" />
                                </div>
                            )}
                        </Button>
                    </div>

                    {/* Result Console - 7 Columns */}
                    <div className="lg:col-span-7">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between gap-2 mb-6">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-slate-400" />
                                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">Infrastructure Logs</h3>
                                </div>
                            </div>

                            <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden shadow-sm">
                                {!currentJob ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 animate-in fade-in">
                                        <div className="w-24 h-24 rounded-[2.5rem] border border-slate-100 flex items-center justify-center mb-10 bg-slate-50/50">
                                            <Video className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">Pipeline Standby</h4>
                                        <p className="text-xs mt-3 max-w-[280px] font-medium leading-relaxed text-slate-500">
                                            Configure your asset parameters on the left to trigger the automated production sequence.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
                                        {/* Status Grid */}
                                        <div className="grid grid-cols-2 gap-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Process ID</span>
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-sm font-mono font-bold text-slate-900 tracking-tight">{currentJob.job_id.slice(0, 16)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-right">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Execution Time</span>
                                                <p className="text-sm font-mono font-bold text-slate-900">{formatElapsed(currentJob.status === 'completed' ? currentJob.elapsed : liveElapsed)}</p>
                                            </div>
                                        </div>

                                        {/* Status Pulse */}
                                        <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${currentJob.status === 'completed' ? 'bg-emerald-50 border-emerald-100' :
                                            currentJob.status === 'failed' ? 'bg-rose-50 border-rose-100' :
                                                'bg-blue-50 border-blue-100'
                                            }`}>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`w-3.5 h-3.5 rounded-full ${currentJob.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                                                    currentJob.status === 'failed' ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' :
                                                        'bg-primary animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                                    }`} />
                                                <span className={`text-md font-bold uppercase tracking-wider ${currentJob.status === 'completed' ? 'text-emerald-700' :
                                                    currentJob.status === 'failed' ? 'text-rose-700' :
                                                        'text-blue-700'
                                                    }`}>{currentJob.status}</span>
                                            </div>
                                            <p className={`text-lg font-bold leading-relaxed italic ${currentJob.status === 'completed' ? 'text-emerald-900' :
                                                currentJob.status === 'failed' ? 'text-rose-900' :
                                                    'text-blue-900'
                                                }`}>
                                                "{currentJob.message || 'Connecting to compute infrastructure...'}"
                                            </p>
                                        </div>

                                        {/* Processing Skeleton (Gradio-style) */}
                                        {currentJob.status === 'processing' && (
                                            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                                                <div className="aspect-[9/16] max-h-[500px] mx-auto rounded-[2.5rem] bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 relative overflow-hidden group">
                                                    {/* Shimmer Effect */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                                                    <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-8 shadow-sm">
                                                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                                    </div>

                                                    <div className="space-y-4 w-full max-w-[240px]">
                                                        <div className="h-3 bg-slate-200 rounded-full w-full mx-auto" />
                                                        <div className="h-3 bg-slate-200 rounded-full w-3/4 mx-auto opacity-60" />
                                                        <div className="h-3 bg-slate-200 rounded-full w-1/2 mx-auto opacity-30" />
                                                    </div>

                                                    <div className="mt-12 flex flex-col items-center gap-4">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">Rendering Pixel Buffers</span>
                                                        <div className="flex gap-1.5">
                                                            {[0, 1, 2].map(i => (
                                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    {[1, 2].map(i => (
                                                        <div key={i} className="h-28 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                                <div className="w-8 h-8 rounded-xl bg-slate-200" />
                                                                <div className="h-2 w-16 bg-slate-200 rounded-full" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Delivery Section */}
                                        {currentJob.status === 'completed' && currentJob.result?.clips && (
                                            <div className="space-y-8 animate-in zoom-in-95">
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Validated Production Assets</span>
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold uppercase">Ready</span>
                                                    </div>
                                                </div>

                                                {/* Main Video Player */}
                                                {selectedClip && (
                                                    <div className="aspect-[9/16] max-h-[600px] mx-auto rounded-[2rem] bg-black overflow-hidden shadow-2xl relative group border-4 border-slate-900">
                                                        <video
                                                            key={selectedClip.url}
                                                            src={selectedClip.url}
                                                            controls
                                                            className="w-full h-full object-contain"
                                                            autoPlay
                                                        />
                                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button asChild size="sm" className="rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white border-0">
                                                                <a href={selectedClip.url} download={`clip-${selectedClip.id}.mp4`}>
                                                                    <Download className="w-4 h-4" />
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {currentJob.result.clips.map((clip, i) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            key={clip.clip_id}
                                                            onClick={() => setSelectedClip({ url: clip.download_url, id: clip.clip_id })}
                                                            className={`cursor-pointer group flex flex-col p-4 rounded-3xl border transition-all ${selectedClip?.id === clip.clip_id
                                                                ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5'
                                                                : 'bg-white border-slate-100 hover:border-primary/30'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-3 mb-4">
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${selectedClip?.id === clip.clip_id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-primary border border-slate-100'
                                                                        }`}>
                                                                        {selectedClip?.id === clip.clip_id ? <Play className="w-4 h-4 fill-current" /> : <Maximize className="w-4 h-4" />}
                                                                    </div>
                                                                    {clip.virality_score && (
                                                                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${clip.virality_score >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                                            }`}>
                                                                            {Math.round(clip.virality_score)}% Viral
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                                                                    <a href={clip.download_url} download={`clip-${clip.clip_id}.mp4`} onClick={(e) => e.stopPropagation()}>
                                                                        <Download className="w-4 h-4" />
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-bold text-slate-900 tracking-tight line-clamp-1">{clip.summary || `Clip #${i + 1}`}</p>
                                                                    {clip.reasoning && <p className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-2 italic">"{clip.reasoning}"</p>}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1.5">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{Math.round(clip.duration)}s</span>
                                                                    </div>
                                                                    <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{resolution}</span>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Error Analytics */}
                                        {currentJob.status === 'failed' && (
                                            <div className="p-8 rounded-3xl bg-rose-50 border border-rose-100 text-rose-700 space-y-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                                                        <XCircle className="w-6 h-6" />
                                                    </div>
                                                    <h5 className="font-bold text-md uppercase tracking-tight">Compute Engine Error</h5>
                                                </div>
                                                <p className="text-sm font-bold opacity-90 leading-relaxed pl-1">
                                                    {currentJob.message}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Professional Footer */}
            <footer className="border-t border-slate-200 bg-white py-10 mt-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-12">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.2em]">Operational</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Distributed GPU Node</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-10">
                            <a href="https://monzed.com/support" target="_blank" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors">Contact Support</a>
                            <a href="https://monzed.com" target="_blank" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors">Cloud Portal</a>
                            <div className="h-5 w-[1px] bg-slate-100" />
                            <div className="flex items-center gap-2 group cursor-default">
                                <RefreshCw className="w-3 h-3 text-slate-300 group-hover:rotate-180 transition-transform duration-700" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest tracking-tighter">© Monzed Labs OU 2026</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}
