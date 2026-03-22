import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Briefcase, ShoppingBag, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const ROLES = [
  { value: 'WORKER', label: 'Worker', desc: 'I complete tasks', icon: Briefcase, color: 'blue' },
  { value: 'BUYER', label: 'Buyer', desc: 'I post tasks', icon: ShoppingBag, color: 'green' },
  { value: 'CITIZEN', label: 'Citizen', desc: 'I report issues', icon: Shield, color: 'purple' },
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <span className="text-2xl font-black text-white">S</span>
          </div>
          <h1 className="text-2xl font-black text-text">Join SwiftDo</h1>
          <p className="text-sm text-text-secondary mt-1">Create your account to get started</p>
        </div>

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
            label="Email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
          />

          {/* Role Selection Cards */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-light'
                        : 'border-border bg-surface hover:border-gray-300'
                    }`}
                  >
                    <Icon size={22} className={isSelected ? 'text-primary' : 'text-text-muted'} />
                    <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-text-secondary'}`}>
                      {r.label}
                    </span>
                    <span className="text-[10px] text-text-muted leading-tight">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" loading={loading} icon={<ArrowRight size={18} />}>
            Create Account
          </Button>
        </form>

        <p className="text-sm text-center mt-6 text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
