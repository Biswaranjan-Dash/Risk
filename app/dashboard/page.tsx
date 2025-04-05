'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AlertCircle, TrendingUp, Activity, ThermometerSun, LogOut } from 'lucide-react';

interface VehicleData {
  riskScore: number;
  speed: number;
  brakeForce: number;
  timestamp: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.vehicleNumber) {
        const response = await fetch(`/api/vehicle-data/${session.user.vehicleNumber}`);
        const data = await response.json();
        setVehicleData(data);
        
        if (data.length > 0) {
          const avgRisk = data.reduce((acc, curr) => acc + curr.riskScore, 0) / data.length;
          setRiskScore(Math.round(avgRisk));
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [session]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-background ">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Vehicle Risk Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right mr-4">
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">
                {session?.user?.role === 'customer' 
                  ? `Vehicle: ${session?.user?.vehicleNumber}`
                  : 'Insurance Company Portal'}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
              <h3 className="text-2xl font-bold">{riskScore}%</h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Speed</p>
              <h3 className="text-2xl font-bold">
                {vehicleData.length > 0
                  ? Math.round(
                      vehicleData.reduce((acc, curr) => acc + curr.speed, 0) /
                        vehicleData.length
                    )
                  : 0}
                km/h
              </h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ThermometerSun className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Brake Usage</p>
              <h3 className="text-2xl font-bold">
                {vehicleData.length > 0
                  ? Math.round(
                      vehicleData.reduce((acc, curr) => acc + curr.brakeForce, 0) /
                        vehicleData.length
                    )
                  : 0}%
              </h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
              <h3 className="text-2xl font-bold">
                {riskScore < 30
                  ? 'Low'
                  : riskScore < 70
                  ? 'Medium'
                  : 'High'}
              </h3>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Risk Score Trend</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vehicleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </main>
    </div>
  );
}