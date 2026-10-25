import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 py-20">
      <Card className="max-w-md w-full text-center space-y-6 border-border bg-card shadow-xl p-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-surface border border-border flex items-center justify-center text-foreground">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase font-mono font-medium tracking-widest text-foreground-muted">Error 404</span>
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-sm text-foreground-secondary">
            The page or study resource you are looking for does not exist.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to PeerLearn
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
