"use client";

import { trackShipment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Search } from "lucide-react";
import Logo from "@/components/Logo";

export default function Home() {
  const [state, formAction] = useFormState(trackShipment, null);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center justify-between">
        <Logo />
      </header>
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">QGO Cargo</h1>
            <p className="mt-2 text-lg text-muted-foreground">Your trusted delivery partner.</p>
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Track Your Shipment</CardTitle>
              <CardDescription>Enter your tracking number (POD token) to see the latest updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    name="token"
                    id="token"
                    placeholder="e.g., AWB123456789" 
                    className="pl-10 h-12 text-lg" 
                    required 
                    aria-label="Tracking Number"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg">
                  Track
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}
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
