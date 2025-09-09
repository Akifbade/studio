"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="p-4 flex items-center justify-between">
        <Logo />
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tracking
          </Link>
        </Button>
      </header>
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Staff Login</CardTitle>
              <CardDescription>Enter your credentials to access the staff dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="staff@qgo.com" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    name="password"
                    type="password"
                    required 
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg">
                  Login
                </Button>
                {/* TODO: Add error message display */}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="p-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} QGO Cargo. All rights reserved.
      </footer>
    </div>
  );
}
