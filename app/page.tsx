'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Building2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    // This will be handled by the auth middleware
    router.push('/auth/signin');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Vehicle Risk Analytics
          </h1>
          <p className="text-lg text-muted-foreground">
            Smart insurance decisions powered by real-time vehicle data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="p-8 h-auto flex flex-col items-center space-y-3"
            onClick={() => router.push('/auth/signin')}
          >
            <Car className="h-8 w-8" />
            <div className="text-center">
              <h2 className="font-semibold">Vehicle Owner</h2>
              <p className="text-sm text-muted-foreground">Track your vehicle risk score</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="p-8 h-auto flex flex-col items-center space-y-3"
            onClick={() => router.push('/auth/signin')}
          >
            <Building2 className="h-8 w-8" />
            <div className="text-center">
              <h2 className="font-semibold">Insurance Company</h2>
              <p className="text-sm text-muted-foreground">Manage vehicle policies</p>
            </div>
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Real-time monitoring and risk assessment for smarter insurance</p>
        </div>
      </Card>
    </div>
  );
}