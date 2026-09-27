// @ts-nocheck
import React, { ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    const { hasError, error } = this.state;
    if (hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (error?.message) {
          const parsed = JSON.parse(error.message);
          if (parsed.operationType && parsed.authInfo) {
            errorMessage = `Database error: ${parsed.error}. Operation: ${parsed.operationType} on ${parsed.path}`;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        // Not a JSON error
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
          <Card className="max-w-md w-full rounded-2xl border-none shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-zinc-50 rounded-xl text-sm text-zinc-600 font-mono break-all">
                {errorMessage}
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReset} className="w-full rounded-xl">
                  Reload Application
                </Button>
                {isFirestoreError && (
                  <p className="text-xs text-zinc-400 text-center">
                    This might be a permission issue. Please check if you are logged in correctly.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
