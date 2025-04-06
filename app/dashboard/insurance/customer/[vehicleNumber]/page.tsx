'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
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
  AreaChart,
  Area,
} from 'recharts';
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  ThermometerSun,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface VehicleData {
  riskScore: number;
  speed: number;
  brakeForce: number;
  acceleration: number;
  timestamp: string;
}

interface CustomerDetails {
  name: string;
  vehicleNumber: string;
  createdAt: string;
}

export default function CustomerDetails({
  params,
}: {
  params: { vehicleNumber: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([]);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [riskScore, setRiskScore] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customer details
        const customerResponse = await fetch(`/api/customers/${params.vehicleNumber}`);
        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customer details');
        }
        const customerData = await customerResponse.json();
        setCustomer(customerData);

        // Fetch vehicle data
        const vehicleResponse = await fetch(`/api/vehicle-data/${params.vehicleNumber}`);
        if (!vehicleResponse.ok) {
          throw new Error('Failed to fetch vehicle data');
        }
        const data = await vehicleResponse.json();
        setVehicleData(data);
        
        if (data.length > 0) {
          const avgRisk = vehicleData.reduce((acc: number, curr: VehicleData) => acc + curr.riskScore, 0) / data.length;
          setRiskScore(Math.round(avgRisk));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/dashboard/insurance');
      }
    };

    if (session?.user?.role === 'insurance') {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    } else {
      router.push('/dashboard/insurance');
    }
  }, [session, params.vehicleNumber, router]);

  const getLatestMetrics = () => {
    if (vehicleData.length === 0) return null;
    const latest = vehicleData[0];
    return {
      speed: latest.speed,
      brakeForce: latest.brakeForce,
      acceleration: latest.acceleration,
    };
  };

  const latestMetrics = getLatestMetrics();

  const getRiskLevelColor = (score: number) => {
    if (score < 30) return 'bg-green-100 text-green-800';
    if (score < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/dashboard/insurance')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <p className="text-muted-foreground">Vehicle: {customer.vehicleNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Customer since</p>
              <p className="font-medium">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
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
              <h3 className="text-2xl font-bold">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(riskScore)}`}>
                  {riskScore}% Risk
                </span>
              </h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Speed</p>
              <h3 className="text-2xl font-bold">
                {latestMetrics?.speed || 0} km/h
              </h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ThermometerSun className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Brake Force</p>
              <h3 className="text-2xl font-bold">
                {latestMetrics?.brakeForce || 0}%
              </h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Acceleration</p>
              <h3 className="text-2xl font-bold">
                {latestMetrics?.acceleration || 0} m/s²
              </h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Risk Score Trend</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vehicleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="riskScore"
                    stroke="#2563eb"
                    fill="#93c5fd"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Speed Analysis</h2>
            <div className="h-[300px]">
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
                    dataKey="speed"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity Log</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Brake Force</TableHead>
                <TableHead>Acceleration</TableHead>
                <TableHead>Risk Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicleData.slice(0, 10).map((data, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(data.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{data.speed} km/h</TableCell>
                  <TableCell>{data.brakeForce}%</TableCell>
                  <TableCell>{data.acceleration} m/s²</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(data.riskScore)}`}>
                      {data.riskScore}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
}