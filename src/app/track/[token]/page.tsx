import { getPodStatus } from "@/ai/flows/pod-status-tool";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatInKuwaitTime } from "@/lib/timezone";
import { CheckCircle2, Circle, Dot, Info, MapPin, Package, Truck } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  params: {
    token: string;
  };
};

type TimelineEvent = {
  title: string;
  timestamp?: string;
  icon: React.ReactNode;
  isCurrent: boolean;
  isCompleted: boolean;
  link?: string;
};

export default async function TrackPage({ params }: Props) {
  const podStatus = await getPodStatus({ publicToken: params.token });

  const statusMap = {
    assigned: "Assigned",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    failed: "Delivery Attempted",
    cancelled: "Cancelled",
  };

  const statusTitle = podStatus.status ? statusMap[podStatus.status as keyof typeof statusMap] || "Pending" : "Pending";

  const allPossibleEvents = [
    { key: "created_at", title: "Order Placed", icon: <Package className="h-5 w-5" /> },
    { key: "out_for_delivery_at", title: "Out for Delivery", icon: <Truck className="h-5 w-5" /> },
    { key: "delivered_at", title: "Delivered", icon: <CheckCircle2 className="h-5 w-5" /> },
  ];

  let timelineEvents: TimelineEvent[] = [];
  let currentStatusIndex = -1;

  if (podStatus.displayStatus && podStatus.timestamps) {
    const availableTimestamps = Object.keys(podStatus.timestamps);
    
    currentStatusIndex = allPossibleEvents.findIndex(event => statusMap[podStatus.status as keyof typeof statusMap] === event.title);
    if(currentStatusIndex === -1 && podStatus.status === 'assigned') currentStatusIndex = 0;


    timelineEvents = allPossibleEvents
      .filter(event => podStatus.timestamps![event.key])
      .map((event, index) => ({
        title: event.title,
        timestamp: podStatus.timestamps![event.key],
        icon: event.icon,
        isCompleted: true, // If it has a timestamp, it's completed
        isCurrent: false, // Will be set below
        link: event.key === 'delivered_at' ? podStatus.geotagMapLink : undefined,
      }));

    if(timelineEvents.length > 0) {
        const lastCompletedEventIndex = timelineEvents.length - 1;
        timelineEvents[lastCompletedEventIndex].isCurrent = true;
        for(let i=0; i<lastCompletedEventIndex; i++) {
             timelineEvents[i].isCurrent = false;
        }
    }
  }

  const renderTimeline = () => (
    <ol className="relative border-l border-border/70 ml-3 mt-4">
      {timelineEvents.map((event, index) => (
        <li key={index} className="mb-10 ml-6">
          <span className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full ring-8 ring-background ${event.isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {event.icon}
          </span>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
            {event.timestamp && (
              <time className="text-sm font-normal leading-none text-muted-foreground">
                {formatInKuwaitTime(event.timestamp, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
              </time>
            )}
            {event.link && (
                <Button variant="link" asChild className="p-0 h-auto justify-start mt-1">
                    <a href={event.link} target="_blank" rel="noopener noreferrer">
                        <MapPin className="mr-1 h-4 w-4" />
                        View Delivery Location
                    </a>
                </Button>
            )}
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center justify-between border-b">
        <Link href="/">
          <Logo />
        </Link>
        <Button variant="outline" asChild>
            <Link href="/">Track Another</Link>
        </Button>
      </header>
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Shipment Status</CardTitle>
            <CardDescription>Tracking Number: <span className="font-semibold text-primary">{params.token}</span></CardDescription>
          </CardHeader>
          <CardContent>
            {podStatus.displayStatus ? (
              <>
                <div className="mb-6">
                    <p className="text-lg font-semibold">Current Status: <span className="text-primary">{statusTitle}</span></p>
                </div>
                {timelineEvents.length > 0 ? renderTimeline() : (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Status Pending</AlertTitle>
                        <AlertDescription>
                            Shipment information received. Please check back for updates.
                        </AlertDescription>
                    </Alert>
                )}
              </>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Status Not Available</AlertTitle>
                <AlertDescription>
                  Your shipment is being prepared. Real-time tracking will be available once it is out for delivery. Please check back later.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="p-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} QGO Cargo. All rights reserved.
      </footer>
    </div>
  );
}
