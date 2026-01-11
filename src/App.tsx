import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { validateApiKey } from '@/lib/api';
import Playground from '@/components/playground/Playground';
import './index.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('monzed_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      handleValidate(storedKey);
    }
  }, []);

  const handleValidate = async (keyToValidate?: string) => {
    const key = keyToValidate || apiKey;
    if (!key.trim()) {
      setError('Please enter your API key');
      return;
    }

    setIsValidating(true);
    setError('');
    localStorage.setItem('monzed_api_key', key.trim());

    const result = await validateApiKey();
    setIsValidating(false);

    if (result.valid) {
      setUser(result.user);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('monzed_api_key');
      setError(result.error || 'Invalid API Key');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('monzed_api_key');
    setIsAuthenticated(false);
    setUser(null);
    setApiKey('');
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary/10">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center min-h-screen p-6 animated-gradient"
          >
            <div className="absolute top-6 right-6 z-50">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-9 px-4 bg-white/80 backdrop-blur-md border-slate-200 hover:bg-white text-slate-900 font-bold text-[10px] gap-2 rounded-xl uppercase tracking-widest shadow-sm transition-all"
              >
                <a href="https://monzed.com/products" target="_blank" rel="noopener noreferrer">
                  <Rocket className="w-3.5 h-3.5 text-primary" />
                  Contact sales
                </a>
              </Button>
            </div>
            <div className="w-full max-w-[400px] space-y-8">
              {/* Minimal Branding */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm mb-2"
                >
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Autoshorts AI</h1>
                <p className="text-sm text-slate-500">High-performance video generation engine</p>
              </div>

              {/* Login Card */}
              <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative bg-white">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-primary/20" />

                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-lg font-bold tracking-tight text-slate-900">API Authentication</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Connect your production key to access the playground
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Secret Key
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="monzed_sk_..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                      disabled={isValidating}
                      className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-primary/10 transition-all text-sm font-mono placeholder:text-slate-300"
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2 text-xs text-rose-600 font-medium"
                      >
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    className="w-full h-11 font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                    onClick={() => handleValidate()}
                    disabled={isValidating}
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-3.5 w-3.5" />
                        Connect Backend
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-4 py-2">
                    <div className="h-[1px] flex-1 bg-slate-100" />
                    <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">or</span>
                    <div className="h-[1px] flex-1 bg-slate-100" />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-11 text-xs border-slate-200 hover:bg-slate-50 font-bold transition-all text-slate-600"
                    asChild
                  >
                    <a
                      href="https://monzed.com/client/api"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-3.5 w-3.5 opacity-60" />
                      Get API key free here
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Status Info */}
              <div className="flex items-center justify-center gap-6 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm mx-auto w-fit">
                <div className="flex items-center gap-1.5 opacity-60">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-slate-900">AI Optimised</span>
                </div>
                <div className="w-[1px] h-3 bg-slate-200" />
                <div className="flex items-center gap-1.5 opacity-60">
                  <Loader2 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-slate-900">Ultra Low-Lat</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="playground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Playground user={user} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
