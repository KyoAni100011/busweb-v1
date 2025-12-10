'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GoogleIcon } from '@/core/icons/google';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

import { SignInSchema, type SignIn } from './validation';
import { useZodForm } from '@/lib/useZodForm';
import { Link } from 'react-router-dom';

export function LoginForm() {
  const form = useZodForm(SignInSchema);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: SignIn) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[LoginForm] Starting login...');
      const authData = await login(data.email, data.password);
      console.log('[LoginForm] Login successful, navigating...');

      const isAdmin = authData.user?.role === 'ADMIN' || authData.user?.roles?.includes?.('ADMIN');
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    } catch (err: any) {
      console.error('[LoginForm] Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-xl font-semibold text-foreground">
            Log in or create account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Welcome back! Sign in or register to continue.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <FormControl>
                      <Input placeholder="you@mail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label>Password</Label>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="mt-4 w-full py-2 font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full py-2 font-medium"
                onClick={() => navigate('/register')}
              >
                Create account
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="flex w-full items-center justify-center space-x-2 py-2"
            onClick={handleGoogleLogin}
            type="button"
          >
            <GoogleIcon className="size-5" aria-hidden />
            <span className="text-sm font-medium">Sign in with Google</span>
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="#" className="underline underline-offset-4">
              terms of service
            </a>{' '}
            and{' '}
            <a href="#" className="underline underline-offset-4">
              privacy policy
            </a>
            .
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
