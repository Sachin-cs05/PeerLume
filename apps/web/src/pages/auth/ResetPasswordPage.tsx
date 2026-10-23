import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Alert } from '../../components/ui/Alert.js';
import { apiService } from '../../services/api.js';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Password reset token is missing from the URL. Please use the link sent to your email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    const result = await apiService.auth.resetPassword({
      token,
      password,
      confirmPassword,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Set New Password</h1>
          <p className="text-sm text-slate-400">
            Create a secure new password for your student account.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8">
          {error && (
            <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!token && (
            <Alert variant="warning" className="mb-6">
              No reset token found in URL. Please check the reset link sent to your email.
            </Alert>
          )}

          {success ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Password Reset Complete</h3>
                <p className="text-sm text-slate-300">
                  Your password has been securely updated and previous sessions invalidated.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In with New Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-800/80 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-slate-600"
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
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-800/80 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                  disabled={!token}
                >
                  Update Password
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200">
                  Cancel and return to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
