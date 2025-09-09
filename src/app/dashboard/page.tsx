
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
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, onSnapshot, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "react-firebase-hooks/auth";

// Define interfaces for our data structures for type safety
interface JobFile {
  id: string;
  jfn: string;
  sh: string;
  co: string;
  or?: string;
  de?: string;
  ca?: string;
  mawb?: string;
  in?: string;
  dsc?: string;
  gw?: string;
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
  driverUid?: string;
  driverName?: string;
  receiverName?: string;
  completedAt?: { toDate: () => Date };
  jobFileId?: string;
  deliveryLocation?: string;
  // Add other delivery properties as needed
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'admin';
  const [jobFiles, setJobFiles] = useState<JobFile[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [driverDeliveries, setDriverDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  
  // New state for job file search
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [jobSuggestions, setJobSuggestions] = useState<JobFile[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobFile | null>(null);

  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      try {
        // Fetch drivers
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const activeDrivers = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === 'driver' && user.status === 'active') as Driver[];
        setDrivers(activeDrivers);
        
        // Fetch job files for search
        const jobFilesSnapshot = await getDocs(collection(db, "jobfiles"));
        const jobFilesData = jobFilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JobFile[];
        setJobFiles(jobFilesData);

        // Listen for all deliveries (admin view)
        const deliveriesCollection = collection(db, 'deliveries');
        const unsubscribe = onSnapshot(deliveriesCollection, (snapshot) => {
          const deliveriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Delivery[];
          setDeliveries(deliveriesData);
          setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setLoading(false);
      }
    }

    if (view === 'admin') {
      fetchAdminData();
    }
  }, [view]);

  useEffect(() => {
    // Fetch data for driver view
    if (view === 'driver' && user) {
        setLoading(true);
        const deliveriesQuery = query(collection(db, 'deliveries'), where('driverUid', '==', user.uid));
        
        const unsubscribe = onSnapshot(deliveriesQuery, (snapshot) => {
            const driverDeliveriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Delivery[];
            setDriverDeliveries(driverDeliveriesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching driver deliveries:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }
  }, [view, user]);


  // Handle Job File Search
  const handleJobSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setJobSearchTerm(term);
    if (term.length > 1) {
      const filtered = jobFiles.filter(job => 
        (job.jfn && job.jfn.toLowerCase().includes(term.toLowerCase())) ||
        (job.sh && job.sh.toLowerCase().includes(term.toLowerCase())) ||
        (job.co && job.co.toLowerCase().includes(term.toLowerCase()))
      ).slice(0, 10);
      setJobSuggestions(filtered);
    } else {
      setJobSuggestions([]);
    }
  }

  const selectJobSuggestion = (job: JobFile) => {
    setSelectedJob(job);
    setJobSearchTerm(job.jfn);
    setJobSuggestions([]);
  }
  
  const handleAssignDelivery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJob) {
        alert("Please select a job file first.");
        return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const driverId = formData.get('driver-select') as string;
    const location = formData.get('delivery-location') as string;
    
    if (!driverId || !location) {
        alert("Please select a driver and enter a location.");
        return;
    }

    const existingDelivery = deliveries.find(d => d.jobFileId === selectedJob.id);
    if (existingDelivery) {
        alert(`A delivery for Job File "${selectedJob.jfn}" has already been assigned.`);
        return;
    }

    setLoading(true);
    try {
        const driver = drivers.find(d => d.id === driverId);
        if (!driver) throw new Error("Selected driver not found.");

        const deliveryData = {
            jobFileId: selectedJob.id,
            jobFileData: {
                jfn: selectedJob.jfn || 'N/A',
                sh: selectedJob.sh || 'N/A',
                co: selectedJob.co || 'N/A',
                dsc: selectedJob.dsc || 'N/A',
                gw: selectedJob.gw || 'N/A',
                mawb: formData.get('delivery-mawb') as string || selectedJob.mawb || 'N/A',
                or: formData.get('delivery-origin') as string || selectedJob.or || 'N/A', 
                de: formData.get('delivery-destination') as string || selectedJob.de || 'N/A',
                ca: formData.get('delivery-airlines') as string || selectedJob.ca || 'N/A',
                in: formData.get('delivery-inv') as string || selectedJob.in || 'N/A',
            },
            deliveryLocation: location,
            deliveryNotes: formData.get('additional-notes') as string,
            driverUid: driver.id,
            driverName: driver.displayName,
            status: 'Pending',
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'deliveries'), deliveryData);
        
        alert("Delivery assigned successfully!");
        form.reset();
        setSelectedJob(null);
        setJobSearchTerm("");

    } catch (error) {
        console.error("Error assigning delivery:", error);
        alert("Could not assign delivery. Check Firestore permissions.");
    } finally {
        setLoading(false);
    }
  }


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
                  <Input 
                    type="text" 
                    id="job-file-search" 
                    placeholder="Job No, Shipper, or Consignee..." 
                    value={jobSearchTerm}
                    onChange={handleJobSearch}
                    autoComplete="off"
                  />
                  {jobSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
                        {jobSuggestions.map(job => (
                            <div 
                                key={job.id} 
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => selectJobSuggestion(job)}
                            >
                                {job.jfn} - {job.sh}
                            </div>
                        ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Details</label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm border">
                    <p><strong>Job No:</strong> <span id="form-job-file-no">{selectedJob?.jfn || "Select a job"}</span></p>
                    <p><strong>Details:</strong> <span id="form-job-shipper-consignee">{selectedJob ? `${selectedJob.sh} / ${selectedJob.co}` : "N/A"}</span></p>
                  </div>
                </div>
              </div>
              <form className="space-y-4" onSubmit={handleAssignDelivery}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="delivery-origin" className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
                    <Input type="text" id="delivery-origin" name="delivery-origin" placeholder="Auto-filled from Job" defaultValue={selectedJob?.or || ''} />
                  </div>
                  <div>
                    <label htmlFor="delivery-destination" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <Input type="text" id="delivery-destination" name="delivery-destination" placeholder="Auto-filled from Job" defaultValue={selectedJob?.de || ''} />
                  </div>
                  <div>
                    <label htmlFor="delivery-airlines" className="block text-sm font-medium text-gray-700 mb-1">Airlines</label>
                    <Input type="text" id="delivery-airlines" name="delivery-airlines" placeholder="Auto-filled from Job" defaultValue={selectedJob?.ca || ''} />
                  </div>
                  <div>
                    <label htmlFor="delivery-mawb" className="block text-sm font-medium text-gray-700 mb-1">AWB / MAWB</label>
                    <Input type="text" id="delivery-mawb" name="delivery-mawb" placeholder="Auto-filled from Job" defaultValue={selectedJob?.mawb || ''} />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label htmlFor="delivery-inv" className="block text-sm font-medium text-gray-700 mb-1">Invoice No.</label>
                    <Input type="text" id="delivery-inv" name="delivery-inv" placeholder="Auto-filled from Job" defaultValue={selectedJob?.in || ''} />
                  </div>
                </div>
                <div>
                  <label htmlFor="delivery-location" className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                  <Textarea id="delivery-location" name="delivery-location" placeholder="Enter the full delivery address" required />
                </div>
                <div>
                  <label htmlFor="additional-notes" className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                  <Textarea id="additional-notes" name="additional-notes" placeholder="e.g., Contact person, delivery instructions" />
                </div>
                <div>
                  <label htmlFor="driver-select" className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
                  <Select name="driver-select" required>
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
                  <Button type="submit" disabled={loading || !selectedJob}>Assign Delivery</Button>
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
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{delivery.jobFileData?.jfn || 'Unknown Job'}</p>
                        <p className="text-sm text-gray-700">{delivery.jobFileData?.sh || 'N/A'} to {delivery.jobFileData?.co || 'N/A'}</p>
                        <p className="text-xs text-gray-500">Assigned to: <strong>{delivery.driverName || 'N/A'}</strong></p>
                      </div>
                       <Badge variant={delivery.status === 'Delivered' ? 'default' : 'secondary'} className={delivery.status === 'Delivered' ? 'bg-green-600' : 'bg-yellow-500'}>
                         {delivery.status}
                       </Badge>
                    </div>
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
                      <Badge variant="default" className="bg-green-600">{delivery.status}</Badge>
                    </div>
                    <div className="mt-2 pt-2 border-t flex justify-between items-center">
                        <div>
                          <p className="text-xs"><strong>Receiver:</strong> {delivery.receiverName || 'N/A'}</p>
                          <p className="text-xs"><strong>Completed:</strong> {delivery.completedAt?.toDate().toLocaleString() || 'N/A'}</p>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
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
              {loading && <p>Loading deliveries...</p>}
              {!loading && driverDeliveries.length === 0 && (
                <p className="text-gray-500">You have no assigned deliveries.</p>
              )}
              {!loading && driverDeliveries.map(delivery => (
                  <div key={delivery.id} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="mb-3 sm:mb-0">
                            <p className="font-bold text-lg text-gray-800">{delivery.jobFileData?.jfn || 'Unknown Job'}</p>
                            <p className="text-sm text-gray-600">To: {delivery.jobFileData?.co || 'N/A'}</p>
                            <p className="text-sm text-gray-500 mt-1">Location: <strong>{delivery.deliveryLocation || 'N/A'}</strong></p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge className={delivery.status === 'Delivered' ? 'bg-green-600' : 'bg-yellow-500'}>
                                {delivery.status}
                            </Badge>
                            <Button variant="default" size="sm">
                                {delivery.status === 'Delivered' ? 'View POD' : 'Complete'}
                            </Button>
                        </div>
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
        </section>
      </div>
    </div>
  );
}

    