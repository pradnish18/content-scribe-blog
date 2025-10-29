import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/auth/${mode === 'signup' ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Authentication failed');
      } else {
        const data = await res.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminAuth', 'true');
        if (Array.isArray(data.favorites)) localStorage.setItem('favorites', JSON.stringify(data.favorites));
        navigate('/admin/dashboard');
      }
    } catch {
      setError('Network error');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-slate-900">{mode === 'signup' ? 'Create Account' : 'Sign In'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Please wait…' : (mode === 'signup' ? 'Sign Up' : 'Sign In')}
            </Button>
            <div className="text-center text-sm text-slate-600">
              {mode === 'signup' ? (
                <button type="button" onClick={() => setMode('signin')} className="underline">Have an account? Sign in</button>
              ) : (
                <button type="button" onClick={() => setMode('signup')} className="underline">New here? Create account</button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
