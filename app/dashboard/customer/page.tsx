"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertCircle,
  TrendingUp,
  Activity,
  ThermometerSun,
  LogOut,
  MessageSquare,
  Send,
} from "lucide-react";

interface VehicleData {
  riskScore: number;
  speed: number;
  brakeForce: number;
  timestamp: string;
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! How can I assist you today?", isUser: false },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.vehicleNumber) {
        const response = await fetch(
          `/api/vehicle-data/${session.user.vehicleNumber}`
        );
        const data = await response.json();
        const sortedData = data.sort(
          (a: VehicleData, b: VehicleData) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setVehicleData(sortedData);

        if (sortedData.length > 0) {
          const avgRisk =
            sortedData.reduce((acc: number, curr: VehicleData) => acc + curr.riskScore, 0) /
            sortedData.length;
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
    router.push("/auth/signin");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Add user's message
    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      isUser: true,
    };
    setMessages([...messages, userMessage]);
    
    // Simulate bot response (you can replace this with an actual API call)
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: `I received: "${newMessage}". How can I help you with your vehicle data?`,
        isUser: false,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);

    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Vehicle Risk Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right mr-4">
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">
                Vehicle: {session?.user?.vehicleNumber}
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
                      vehicleData.reduce((acc: number, curr: VehicleData) => acc + curr.speed, 0) /
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
                      vehicleData.reduce((acc: number, curr: VehicleData) => acc + curr.brakeForce, 0) /
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
                  ? "Low"
                  : riskScore < 70
                  ? "Medium"
                  : "High"}
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

        {/* Chat Bot Section */}
        <div className="fixed bottom-4 right-4">
          {!isChatOpen && (
            <Button
              className="rounded-full w-12 h-12 p-0"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          )}

          {isChatOpen && (
            <Card className="w-96 h-[500px] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Vehicle Assistant</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                >
                  ×
                </Button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.isUser
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}