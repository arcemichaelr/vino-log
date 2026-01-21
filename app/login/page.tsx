import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to continue tracking your wine journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement login logic
                  window.location.href = "/dashboard";
                }}
              >
                Log In
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Link href="/dashboard">
              <Button
                variant="outline"
                className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Continue as Guest
              </Button>
            </Link>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/dashboard" className="text-purple-600 hover:underline">
                Get Started
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}