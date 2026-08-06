import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAuth } from '../contexts/AuthContext';
import { STOYANGU_LOGO } from '../lib/brand';
import Seo from '../components/Seo';

export default function Login() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user && profile) {
      navigate(profile.role === 'founder' ? '/management' : '/my-store', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        setError('Account created. If you are a store owner, use the login details from your StoYangu team.');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 relative overflow-hidden flex items-center justify-center px-4 py-10">
      <Seo
        title="Owner login | StoYangu"
        description="Sign in to manage your StoYangu store."
        path="/login"
        noindex
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img
            src={STOYANGU_LOGO}
            alt="StoYangu"
            className="mx-auto h-28 w-28 object-contain drop-shadow-[0_0_24px_rgba(30,200,165,0.45)]"
          />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Sto<span className="text-teal-400">Yangu</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Internal hub for free online stores across Kenya
          </p>
        </div>

        <div className="glass-card p-6 sm:p-7">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isSignUp
                ? 'Founders and invited owners only.'
                : 'Sign in to manage stores or your products.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-5">
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="input pl-10"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@stoyangu.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="input pl-10 pr-11"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Please wait…
                </>
              ) : isSignUp ? (
                'Sign up'
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
            <div className="h-px flex-1 bg-white/10" />
            or
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle('StoYangu')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-navy-950 font-medium text-sm hover:bg-slate-100 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp((v) => !v);
              setError('');
            }}
            className="mt-5 w-full text-center text-sm text-slate-400 hover:text-teal-300 transition"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>

          <div className="mt-5 rounded-2xl bg-teal-500/5 border border-teal-400/10 p-3 text-xs text-slate-400 leading-relaxed">
            <span className="text-teal-300 font-medium">Demo founder:</span>{' '}
            founder@stoyangu.com / StoYangu2024!
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Built for Kenyan small businesses ·{' '}
          <Link to="/login" className="text-slate-500 hover:text-teal-400">
            stoyangu.com
          </Link>
        </p>
        <p className="text-center text-[10px] text-slate-700 mt-2">System Update v2.1</p>
      </motion.div>
    </div>
  );
}
