import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Alert } from '../../components/ui/Alert.js';
import { apiService } from '../../services/api.js';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your student email address');
      return;
    }

    setLoading(true);
    const result = await apiService.auth.forgotPassword(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Reset Password</h1>
          <p className="text-sm text-slate-400">
            Enter your email to receive a single-use, secure password recovery link.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8">
          {error && (
            <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {submitted ? (
            <div className="space-y-6 text-center">
              <Alert variant="success" title="Recovery Link Dispatched">
                If an account exists with <strong>{email}</strong>, a password reset link has been dispatched. The link is valid for 15 minutes.
              </Alert>
              <p className="text-xs text-slate-400">
                In local development mode, the reset token is safely logged to the backend console.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="secondary" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Student Email Address"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoFocus
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Send Recovery Link
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
