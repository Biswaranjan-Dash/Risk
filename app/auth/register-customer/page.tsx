'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function RegisterCustomer() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/register-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleNumber, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to sign-in page after successful registration
      router.push('/auth/signin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Customer Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vehicleNumber" className="block text-sm font-medium">
              Vehicle Number
            </label>
            <Input
              id="vehicleNumber"
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
              placeholder="e.g., ABC123"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full">
            Register as Customer
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/auth/signin" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Register as an insurance company?{' '}
          <a href="/auth/register" className="text-blue-600 hover:underline">
            Click here
          </a>
        </p>
      </Card>
    </div>
  );
}