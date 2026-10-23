import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, GraduationCap, BookOpen, Layers, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Alert } from '../../components/ui/Alert.js';
import { useAuth } from '../../context/AuthContext.js';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    degree: '',
    branch: '',
    semester: '',
    acceptedTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!form.acceptedTerms) {
      setError('You must accept the terms of service and privacy policy');
      return;
    }

    setLoading(true);
    const result = await register({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      college: form.college,
      degree: form.degree,
      branch: form.branch,
      semester: form.semester,
      acceptedTerms: form.acceptedTerms,
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Failed to create student account');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Join the Student Learning Network</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Student Account</h1>
          <p className="text-sm text-slate-400">
            Connect with friends, discover learning partners, and share skills without administrative bottlenecks.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8">
          {error && (
            <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="fullName"
                label="Full Name"
                placeholder="Alex Morgan"
                value={form.fullName}
                onChange={handleChange}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                name="email"
                type="email"
                label="Student Email"
                placeholder="alex@college.edu"
                value={form.email}
                onChange={handleChange}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-slate-600"
                  required
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 block mb-3">
                Academic Background
              </span>

              <div className="space-y-4">
                <Input
                  name="college"
                  label="College or University"
                  placeholder="e.g. Stanford University / IIT Delhi"
                  value={form.college}
                  onChange={handleChange}
                  leftIcon={<GraduationCap className="w-4 h-4" />}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    name="degree"
                    label="Degree"
                    placeholder="e.g. B.Tech / B.S."
                    value={form.degree}
                    onChange={handleChange}
                    leftIcon={<BookOpen className="w-4 h-4" />}
                    required
                  />

                  <Input
                    name="branch"
                    label="Branch"
                    placeholder="e.g. CSE / ECE"
                    value={form.branch}
                    onChange={handleChange}
                    leftIcon={<Layers className="w-4 h-4" />}
                    required
                  />

                  <Input
                    name="semester"
                    label="Semester / Year"
                    placeholder="e.g. 5th Sem / 3rd Year"
                    value={form.semester}
                    onChange={handleChange}
                    leftIcon={<Calendar className="w-4 h-4" />}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="acceptedTerms"
                  checked={form.acceptedTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I agree to the{' '}
                  <span className="text-brand-400 underline">Terms of Service</span> and{' '}
                  <span className="text-brand-400 underline">Privacy Policy</span>. I understand PeerLume is an autonomous, peer-governed student platform without administrative oversight.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Complete Registration
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
