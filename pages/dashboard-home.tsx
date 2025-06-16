import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, DollarSign, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "2,543",
    description: "+12% from last month",
    icon: Users,
  },
  {
    title: "Active Sessions",
    value: "1,234",
    description: "+5% from last hour",
    icon: Activity,
  },
  {
    title: "Revenue",
    value: "$45,231",
    description: "+20% from last month",
    icon: DollarSign,
  },
  {
    title: "Growth Rate",
    value: "12.5%",
    description: "+2% from last quarter",
    icon: TrendingUp,
  },
]

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your SHFLI admin dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest activities in your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Activity {i}</p>
                    <p className="text-xs text-muted-foreground">{i} minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <p className="text-sm font-medium">Add New User</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <p className="text-sm font-medium">Generate Report</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <p className="text-sm font-medium">System Settings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
