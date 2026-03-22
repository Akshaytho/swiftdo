import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-background">
      {/* Gradient hero background */}
      <div className="gradient-hero relative overflow-hidden" style={{ minHeight: '42vh' }}>
        {/* Decorative floating circles */}
        <div className="absolute top-8 right-6 w-32 h-32 rounded-full bg-white/10 animate-float" />
        <div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-white/15 animate-float-alt" style={{ animationDelay: '1.2s' }} />
        <div className="absolute -top-4 left-8 w-24 h-24 rounded-full bg-white/8 animate-float" style={{ animationDelay: '0.6s' }} />
        <div className="absolute top-16 left-1/3 w-10 h-10 rounded-full bg-white/20 animate-float-alt" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-8 left-6 w-20 h-20 rounded-full bg-white/10 animate-float" style={{ animationDelay: '1.8s' }} />

        {/* Logo and brand */}
        <div className="relative z-10 flex flex-col items-center pt-14 pb-6 px-6">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl-colored flex items-center justify-center mb-5 animate-scale-in">
            <Zap size={36} className="text-primary" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">SwiftDo</h1>
          <p className="text-white/70 text-sm mt-2 font-medium">Earn fast. Work smart. Get verified.</p>

          {/* Stats row */}
          <div className="flex gap-6 mt-5">
            <div className="text-center">
              <div className="text-xl font-black text-white">12K+</div>
              <div className="text-white/60 text-xs">Workers</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-xl font-black text-white">50K+</div>
              <div className="text-white/60 text-xs">Tasks Done</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-xl font-black text-white">4.9★</div>
              <div className="text-white/60 text-xs">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form sheet — slides up */}
      <div className="relative z-10 flex-1 bg-white rounded-t-[32px] -mt-6 px-6 pt-7 pb-8 shadow-[0_-8px_40px_rgba(0,0,0,0.12)] animate-slide-up">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

        <h2 className="text-2xl font-black text-text mb-1">Welcome back 👋</h2>
        <p className="text-text-secondary text-sm mb-6">Sign in to your SwiftDo account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorMsg error={error} />

          <Input
            type="email"
            label="Email address"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
          />

          <div className="pt-1">
            <Button type="submit" loading={loading} size="lg" icon={<ArrowRight size={20} />}>
              Sign In
            </Button>
          </div>
        </form>

        <p className="text-sm text-center mt-6 text-text-secondary">
          New to SwiftDo?{' '}
          <Link to="/register" className="text-gradient-primary font-bold">
            Create account
          </Link>
        </p>

        <p className="text-xs text-center mt-4 text-text-muted">
          By signing in you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
