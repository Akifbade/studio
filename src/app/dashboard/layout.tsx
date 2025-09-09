import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = { displayName: "Admin User", role: "admin" }; // Mock user for now

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Delivery System</h1>
            <p id="header-subtitle" className="text-gray-500 mt-1">Assign, track, and manage all job file deliveries.</p>
        </div>
        <div className="text-sm mt-4 sm:mt-0 text-right">
          <p className="font-medium">Welcome, <span id="user-display-name" className="font-bold text-gray-800">{currentUser.displayName}</span> (<span id="user-role" className="capitalize text-gray-600">{currentUser.role}</span>)</p>
          <div className="flex items-center justify-end gap-4 mt-2">
            <Button variant="outline" size="sm" className="text-xs">Driver Dashboard</Button>
            <Button variant="default" size="sm" className="text-xs">Admin Panel</Button>
            <Link href="/">
              <Button variant="secondary" size="sm" className="text-xs">Logout</Button>
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
