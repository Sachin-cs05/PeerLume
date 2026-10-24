import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-foreground-secondary text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
            <span>Secure Password Reset</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Set New Password</h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Create a secure new password for your student account.
          </p>
        </div>

        <Card className="border-border bg-card shadow-sm p-6 sm:p-8">
          {error && (
            <Alert variant="error" className="mb-5" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!token && (
            <Alert variant="warning" className="mb-5">
              No reset token found in URL. Please check the reset link sent to your email.
            </Alert>
          )}

          {success ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-hover border border-border text-foreground flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">Password Reset Complete</h3>
                <p className="text-xs sm:text-sm text-foreground-secondary">
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
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-foreground-secondary">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-foreground-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white dark:bg-[#18181B] pl-10 pr-10 py-2 text-sm text-foreground placeholder:text-foreground-muted transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/25 dark:focus:ring-white/25 focus:border-foreground dark:focus:border-white hover:border-border-strong"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-foreground-muted hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-foreground-secondary">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-foreground-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white dark:bg-[#18181B] pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/25 dark:focus:ring-white/25 focus:border-foreground dark:focus:border-white hover:border-border-strong"
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
                <Link to="/login" className="text-xs text-foreground-muted hover:text-foreground transition-colors">
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
