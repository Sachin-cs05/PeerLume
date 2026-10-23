import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 py-20">
      <Card className="max-w-md w-full text-center space-y-6 border-slate-800 bg-slate-900/90 p-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
          <Compass className="w-8 h-8 animate-pulse-slow" />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-400">Error 404</span>
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-sm text-slate-400">
            The page or study resource you are looking for does not exist or has not been deployed in this phase.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to PeerLume
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
