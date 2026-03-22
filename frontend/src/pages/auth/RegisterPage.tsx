import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Briefcase, ShoppingBag, Shield, Zap } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const ROLES = [
  {
    value: 'WORKER',
    label: 'Worker',
    desc: 'Complete tasks & earn',
    icon: Briefcase,
    gradient: 'gradient-success',
    glow: 'shadow-success',
    ring: 'ring-2 ring-success/40',
    text: 'text-success',
    bg: 'bg-success/10',
  },
  {
    value: 'BUYER',
    label: 'Buyer',
    desc: 'Post tasks & hire',
    icon: ShoppingBag,
    gradient: 'gradient-primary',
    glow: 'shadow-primary',
    ring: 'ring-2 ring-primary/40',
    text: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    value: 'CITIZEN',
    label: 'Citizen',
    desc: 'Report civic issues',
    icon: Shield,
    gradient: 'bg-gradient-to-br from-violet-500 to-purple-700',
    glow: 'shadow-[0_8px_25px_rgba(109,40,217,0.4)]',
    ring: 'ring-2 ring-violet-400/40',
    text: 'text-violet-600',
    bg: 'bg-violet-50',
  },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('WORKER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password, role });
      navigate('/');
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-background">
      {/* Gradient hero */}
      <div className="gradient-hero relative overflow-hidden" style={{ minHeight: '30vh' }}>
        <div className="absolute top-6 right-8 w-24 h-24 rounded-full bg-white/10 animate-float" />
        <div className="absolute top-14 right-4 w-10 h-10 rounded-full bg-white/20 animate-float-alt" style={{ animationDelay: '1s' }} />
        <div className="absolute -top-2 left-12 w-20 h-20 rounded-full bg-white/8 animate-float" style={{ animationDelay: '0.5s' }} />

        <div className="relative z-10 flex flex-col items-center pt-10 pb-4 px-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3 animate-scale-in">
            <Zap size={28} className="text-primary" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Join SwiftDo</h1>
          <p className="text-white/70 text-sm mt-1 font-medium">India's fastest task platform</p>
        </div>
      </div>

      {/* Form sheet */}
      <div className="relative z-10 flex-1 bg-white rounded-t-[32px] -mt-5 px-6 pt-6 pb-8 shadow-[0_-8px_40px_rgba(0,0,0,0.12)] animate-slide-up overflow-y-auto">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <h2 className="text-2xl font-black text-text mb-1">Create account ✨</h2>
        <p className="text-text-secondary text-sm mb-5">Fill in your details to get started</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorMsg error={error} />

          <Input
            type="text"
            label="Full Name"
            placeholder="Your name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User size={18} />}
          />

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
            placeholder="Min 8 chars, 1 upper, 1 digit"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
          />

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-bold text-text mb-3">I want to...</label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`
                      relative flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-all duration-200 overflow-hidden
                      ${isSelected
                        ? `border-transparent ${r.glow} ${r.ring} scale-[1.03]`
                        : 'border-border hover:border-gray-300 hover:shadow-card bg-gray-50/50'}
                    `}
                  >
                    {isSelected && <div className={`absolute inset-0 opacity-10 ${r.gradient}`} />}
                    <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isSelected ? `${r.gradient} shadow-sm` : r.bg}`}>
                      <Icon size={22} className={isSelected ? 'text-white' : r.text} />
                    </div>
                    <span className={`relative text-xs font-bold ${isSelected ? r.text : 'text-text-secondary'}`}>
                      {r.label}
                    </span>
                    <span className="relative text-[10px] text-text-muted leading-tight text-center">
                      {r.desc}
                    </span>
                    {isSelected && (
                      <div className={`absolute top-2 right-2 w-4 h-4 rounded-full ${r.gradient} flex items-center justify-center`}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-1">
            <Button type="submit" loading={loading} size="lg" icon={<ArrowRight size={20} />}>
              Create Account
            </Button>
          </div>
        </form>

        <p className="text-sm text-center mt-5 text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-gradient-primary font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
