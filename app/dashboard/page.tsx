import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

// Mock data for wine logs
const mockWineLogs = [
  {
    id: 1,
    name: "Domaine de la Romanée-Conti",
    vintage: "2018",
    type: "Pinot Noir",
    rating: 9,
    tastingNote: "Exquisite balance of fruit and earth. Notes of cherry, rose petals, and subtle spice. Incredible depth and complexity.",
    date: "2024-03-15",
  },
  {
    id: 2,
    name: "Château Margaux",
    vintage: "2015",
    type: "Cabernet Sauvignon",
    rating: 10,
    tastingNote: "A perfect wine. Rich, full-bodied with dark fruit flavors. Tannins are perfectly integrated. Absolutely stunning.",
    date: "2024-03-10",
  },
  {
    id: 3,
    name: "Cloudy Bay Sauvignon Blanc",
    vintage: "2023",
    type: "Sauvignon Blanc",
    rating: 8,
    tastingNote: "Bright and crisp with tropical fruit notes. Perfect for a summer day. Refreshing acidity.",
    date: "2024-03-05",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-900">🍷 Vino Log</h1>
          <Link href="/log-wine">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Log Wine
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Wine Log</h2>
          <p className="text-gray-600">Recent wine experiences</p>
        </div>

        {/* Wine Logs Feed */}
        <div className="space-y-4">
          {mockWineLogs.map((wine) => (
            <Card key={wine.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{wine.name}</CardTitle>
                    <CardDescription>
                      {wine.vintage} • {wine.type}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-2xl font-bold text-purple-600">
                      {wine.rating}
                    </span>
                    <span className="text-gray-400">/10</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{wine.tastingNote}</p>
                <p className="text-sm text-gray-500">Logged on {new Date(wine.date).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (if no logs) */}
        {mockWineLogs.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🍷</div>
              <h3 className="text-xl font-semibold mb-2">No wine logs yet</h3>
              <p className="text-gray-600 mb-6">Start tracking your wine experiences</p>
              <Link href="/log-wine">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Wine
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}