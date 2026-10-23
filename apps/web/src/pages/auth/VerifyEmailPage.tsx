import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MailCheck, AlertCircle, ArrowRight, RefreshCw, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Alert } from '../../components/ui/Alert.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { apiService } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user, refreshUser } = useAuth();

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Resend state
  const [resendEmail, setResendEmail] = useState(user?.email || '');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      setVerifying(true);
      apiService.auth
        .verifyEmail(token)
        .then((result) => {
          if (result.error) {
            setVerifyError(result.error);
          } else {
            setVerified(true);
            refreshUser();
          }
        })
        .finally(() => {
          setVerifying(false);
        });
    }
  }, [token, refreshUser]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    setResendMessage(null);

    if (!resendEmail.trim()) {
      setResendError('Please enter your email address');
      return;
    }

    setResending(true);
    const result = await apiService.auth.resendVerification(resendEmail);
    setResending(false);

    if (result.error) {
      setResendError(result.error);
    } else {
      setResendMessage('A new verification email has been dispatched. Please check your inbox or dev logs.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Email Verification</h1>
          <p className="text-sm text-slate-400">
            Confirm your student email address to protect the peer network.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8">
          {verifying ? (
            <div className="text-center py-8 space-y-4">
              <Spinner size="lg" />
              <p className="text-sm text-slate-300">Validating your email verification token...</p>
            </div>
          ) : verified ? (
            <div className="text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <MailCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Email Successfully Verified!</h3>
                <p className="text-sm text-slate-300">
                  Your student account is now verified. You can access all peer features and discovery tools.
                </p>
              </div>
              <Link to="/dashboard">
                <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {verifyError && (
                <Alert variant="error" title="Verification Failed">
                  {verifyError}
                </Alert>
              )}

              {user?.isEmailVerified ? (
                <Alert variant="success" title="Already Verified">
                  Your email address is already verified.
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      If you haven’t clicked the link sent to your inbox, you can request a new verification token below.
                    </span>
                  </div>

                  {resendMessage && (
                    <Alert variant="success" onClose={() => setResendMessage(null)}>
                      {resendMessage}
                    </Alert>
                  )}

                  {resendError && (
                    <Alert variant="error" onClose={() => setResendError(null)}>
                      {resendError}
                    </Alert>
                  )}

                  <form onSubmit={handleResend} className="space-y-4">
                    <Input
                      label="Student Email Address"
                      type="email"
                      placeholder="you@university.edu"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />

                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full"
                      isLoading={resending}
                      leftIcon={<Send className="w-4 h-4" />}
                    >
                      Resend Verification Link
                    </Button>
                  </form>
                </div>
              )}

              <div className="text-center pt-2 border-t border-slate-800">
                <Link to="/dashboard" className="text-xs text-brand-400 hover:text-brand-300 inline-flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" /> Continue to Student Dashboard
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
