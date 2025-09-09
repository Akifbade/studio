
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

// Define interfaces for our data structures for type safety
interface JobFile {
  id: string;
  jfn: string;
  sh: string;
  co: string;
  // Add other job file properties as needed
}

interface Driver {
  id: string;
  displayName: string;
}

interface Delivery {
  id:string;
  status: 'Pending' | 'Delivered';
  jobFileData: {
    jfn?: string;
    sh?: string;
    co?: string;
  };
  driverName?: string;
  receiverName?: string;
  completedAt?: { toDate: () => Date };
  // Add other delivery properties as needed
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'admin';
  const [jobFiles, setJobFiles] = useState<JobFile[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch drivers
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const activeDrivers = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === 'driver' && user.status === 'active') as Driver[];
        setDrivers(activeDrivers);

        // Listen for deliveries
        const deliveriesCollection = collection(db, 'deliveries');
        const unsubscribe = onSnapshot(deliveriesCollection, (snapshot) => {
          const deliveriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Delivery[];
          setDeliveries(deliveriesData);
          setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }

    if (view === 'admin') {
      fetchData();
    }
  }, [view]);


  const pendingDeliveries = deliveries.filter(d => d.status !== 'Delivered');
  const completedDeliveries = deliveries.filter(d => d.status === 'Delivered');

  return (
    <div className="space-y-12">
      {/* Admin / Staff View */}
      <div style={{ display: view === 'admin' ? 'block' : 'none' }}>
        <section id="dashboard-section" className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex items-center gap-5 border-l-4 border-yellow-400">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-base text-gray-500">Pending</p>
                  <p id="stat-pending" className="text-3xl font-extrabold text-gray-800">{pendingDeliveries.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex items-center gap-5 border-l-4 border-green-400">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="bg-green-100 p-3 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <div><p className="text-base text-gray-500">Completed</p><p id="stat-completed" className="text-3xl font-extrabold text-gray-800">{completedDeliveries.length}</p></div>
              </CardContent>
            </Card>
            <Card className="flex items-center gap-5 border-l-4 border-blue-400">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="bg-blue-100 p-3 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /></svg></div>
                <div><p className="text-base text-gray-500">Total Deliveries</p><p id="stat-total" className="text-3xl font-extrabold text-gray-800">{deliveries.length}</p></div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Assign New Delivery */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              <span>Assign New Delivery</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="job-file-search" className="block text-sm font-medium text-gray-700 mb-1">Search Job File</label>
                  <Input type="text" id="job-file-search" placeholder="Job No, Shipper, or Consignee..." />
                  {/* Suggestions would go here */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Details</label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm border">
                    <p><strong>Job No:</strong> <span id="form-job-file-no">Select a job</span></p>
                    <p><strong>Details:</strong> <span id="form-job-shipper-consignee">N/A</span></p>
                  </div>
                </div>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="delivery-origin" className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
                    <Input type="text" id="delivery-origin" placeholder="Auto-filled from Job" />
                  </div>
                  <div>
                    <label htmlFor="delivery-destination" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <Input type="text" id="delivery-destination" placeholder="Auto-filled from Job" />
                  </div>
                  <div>
                    <label htmlFor="delivery-airlines" className="block text-sm font-medium text-gray-700 mb-1">Airlines</label>
                    <Input type="text" id="delivery-airlines" placeholder="Auto-filled from Job" />
                  </div>
                  <div>
                    <label htmlFor="delivery-mawb" className="block text-sm font-medium text-gray-700 mb-1">AWB / MAWB</label>
                    <Input type="text" id="delivery-mawb" placeholder="Auto-filled from Job" />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label htmlFor="delivery-inv" className="block text-sm font-medium text-gray-700 mb-1">Invoice No.</label>
                    <Input type="text" id="delivery-inv" placeholder="Auto-filled from Job" />
                  </div>
                </div>
                <div>
                  <label htmlFor="delivery-location" className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                  <Textarea id="delivery-location" placeholder="Enter the full delivery address" />
                </div>
                <div>
                  <label htmlFor="additional-notes" className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                  <Textarea id="additional-notes" placeholder="e.g., Contact person, delivery instructions" />
                </div>
                <div>
                  <label htmlFor="driver-select" className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
                  <Select>
                    <SelectTrigger id="driver-select">
                      <SelectValue placeholder="-- Select a Driver --" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>{driver.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right">
                  <Button type="submit">Assign Delivery</Button>
                </div>
              </form>
            </div>
          </CardContent>
        </section>
        
        {/* Delivery Lists */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <span>Pending Deliveries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input type="text" id="pending-search" placeholder="Search pending deliveries..." className="mb-4" />
              <div id="pending-deliveries-list" className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? <p>Loading...</p> : pendingDeliveries.length > 0 ? pendingDeliveries.map(delivery => (
                  <div key={delivery.id} className="border p-3 rounded-lg bg-gray-50">
                    <p className="font-bold">{delivery.jobFileData?.jfn || 'Unknown Job'}</p>
                    <p className="text-sm text-gray-700">{delivery.jobFileData?.sh || 'N/A'} to {delivery.jobFileData?.co || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Assigned to: <strong>{delivery.driverName || 'N/A'}</strong></p>
                  </div>
                )) : <p className="text-gray-500 text-center py-4">No pending deliveries found.</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Completed Deliveries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input type="text" id="completed-search" placeholder="Search completed deliveries..." className="mb-4" />
              <div id="completed-deliveries-list" className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? <p>Loading...</p> : completedDeliveries.length > 0 ? completedDeliveries.map(delivery => (
                   <div key={delivery.id} className="border p-3 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{delivery.jobFileData?.jfn || 'Unknown Job'}</p>
                        <p className="text-sm text-gray-700">{delivery.jobFileData?.sh || 'N/A'} to {delivery.jobFileData?.co || 'N/A'}</p>
                        <p className="text-xs text-gray-500">Assigned to: <strong>{delivery.driverName || 'N/A'}</strong></p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-200 text-green-800">
                        {delivery.status}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs"><strong>Receiver:</strong> {delivery.receiverName || 'N/A'}</p>
                      <p className="text-xs"><strong>Completed:</strong> {delivery.completedAt?.toDate().toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                )) : <p className="text-gray-500 text-center py-4">No completed deliveries found.</p>}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Driver View */}
      <div style={{ display: view === 'driver' ? 'block' : 'none' }}>
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <CardHeader className="p-0 mb-6 pb-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">My Dashboard</CardTitle>
            <Button variant="outline" className="text-sm mt-3 sm:mt-0">My Feedback & Ratings</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div id="driver-performance-summary" className="mb-6">
              {/* Driver performance summary will be loaded here */}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">My Assigned Deliveries</h3>
            <div id="driver-tasks-list" className="space-y-4">
              <p className="text-gray-500">You have no assigned deliveries.</p>
            </div>
          </CardContent>
        </section>
      </div>
    </div>
  );
}
