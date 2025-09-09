"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo />
          <h2 className="mt-4 text-center text-2xl font-bold text-gray-700">
            Delivery Management Portal
          </h2>
        </div>
        <Card className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg">
          <CardHeader className="p-0">
            {/* The form will be inside the content for better spacing */}
          </CardHeader>
          <CardContent className="p-0">
            <form className="space-y-4">
              <div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  className="input-field"
                />
              </div>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </Link>
              </div>

              <div>
                <Link href="/dashboard">
                  <Button type="submit" className="btn btn-primary w-full text-lg">
                    Sign in
                  </Button>
                </Link>
              </div>
            </form>
            <div className="text-center text-sm text-gray-600 mt-6">
              <p>
                New Driver?{' '}
                <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
