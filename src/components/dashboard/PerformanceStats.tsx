
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from "recharts";

const performanceData = [
  { time: "00:00", tasks: 5, efficiency: 76 },
  { time: "04:00", tasks: 2, efficiency: 82 },
  { time: "08:00", tasks: 8, efficiency: 73 },
  { time: "12:00", tasks: 12, efficiency: 68 },
  { time: "16:00", tasks: 15, efficiency: 65 },
  { time: "20:00", tasks: 10, efficiency: 72 },
  { time: "23:59", tasks: 7, efficiency: 75 },
];

const agentUsageData = [
  { name: "Chat GPT", usage: 42 },
  { name: "Calendar", usage: 28 },
  { name: "Email", usage: 18 },
  { name: "Home Assistant", usage: 12 },
];

export const PerformanceStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>AI Task Efficiency</CardTitle>
          <CardDescription>24-hour performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorEfficiency)"
                name="Efficiency (%)"
              />
              <CartesianGrid stroke="#555" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Agent Usage</CardTitle>
          <CardDescription>Distribution of agent interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agentUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="usage" name="Usage %" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
