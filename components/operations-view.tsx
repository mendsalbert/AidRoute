"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { realTimeDisasterService } from "@/lib/real-time-disasters";
import { DisasterMap } from "@/components/disaster-map";
import {
  Activity,
  Map,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle,
  Truck,
  MapPin,
  TrendingUp,
  Zap,
  ExternalLink,
  Globe,
  Droplets,
  Mountain,
  Flame,
  Wind,
  Sun,
  MapPin as LocationPin,
} from "lucide-react";

export function OperationsView() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    // Initial load
    setEvents(realTimeDisasterService.getEvents());

    // Set up listeners
    const handleEventsUpdated = (updatedEvents: any[]) => {
      setEvents(updatedEvents);
    };

    realTimeDisasterService.on("events-updated", handleEventsUpdated);

    return () => {
      realTimeDisasterService.off("events-updated", handleEventsUpdated);
    };
  }, []);

  const criticalEvents = events.filter((e) => e.urgency === "critical");
  const highEvents = events.filter((e) => e.urgency === "high");

  const typeToIcon = (type: string) => {
    switch (type) {
      case "EQ":
        return <Globe className="w-5 h-5 text-blue-500" />;
      case "FL":
        return <Droplets className="w-5 h-5 text-cyan-500" />;
      case "VO":
        return <Mountain className="w-5 h-5 text-purple-500" />;
      case "WF":
        return <Flame className="w-5 h-5 text-amber-500" />;
      case "TC":
        return <Wind className="w-5 h-5 text-indigo-500" />;
      case "DR":
        return <Sun className="w-5 h-5 text-orange-500" />;
      default:
        return <LocationPin className="w-5 h-5 text-gray-500" />;
    }
  };

  const urgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "text-red-600 bg-red-500/10 border-red-500/20";
      case "high":
        return "text-orange-600 bg-orange-500/10 border-orange-500/20";
      case "medium":
        return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-green-600 bg-green-500/10 border-green-500/20";
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "EQ":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "FL":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      case "VO":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "WF":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "TC":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const sanitizeLink = (url?: string) => {
    if (!url) return "";
    const decoded = url.trim().replace(/&amp;/g, "&");
    try {
      const u = new URL(decoded, "https://www.gdacs.org");
      return u.href;
    } catch {
      return decoded;
    }
  };

  const timeFrom = (pubDate?: string) => {
    if (!pubDate) return "";
    const now = Date.now();
    const then = new Date(pubDate).getTime();
    const diffMin = Math.max(0, Math.round((now - then) / 60000));
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const hrs = Math.round(diffMin / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.round(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* KPI Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{criticalEvents.length}</p>
              <p className="text-sm text-muted-foreground">Critical Events</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{highEvents.length}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
            <Zap className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {events.length > 0 ? "Live" : "--"}
              </p>
              <p className="text-sm text-muted-foreground">GDACS Status</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Disaster Map */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Map className="w-5 h-5" />
              Live Disaster Map
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time</span>
            </div>
          </div>

          {/* Real Map with disaster markers */}
          <DisasterMap
            events={events}
            onEventSelect={setSelectedEvent}
            selectedEvent={selectedEvent}
          />
        </div>

        {/* Event Details Panel */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Selected Event
          </h3>

          {selectedEvent ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Type & Urgency
                </p>
                <div className="flex gap-2">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium border",
                      typeColor(selectedEvent.eventType)
                    )}
                  >
                    {selectedEvent.typeName}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium border",
                      urgencyColor(selectedEvent.urgency)
                    )}
                  >
                    {selectedEvent.urgency}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{selectedEvent.location}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Severity</p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 flex-1 rounded",
                        i < selectedEvent.severity
                          ? "bg-red-500"
                          : "bg-gray-300"
                      )}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedEvent.severity}/5
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Alert Title
                </p>
                <p className="text-sm line-clamp-3">{selectedEvent.title}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Published</p>
                <p className="text-sm">{timeFrom(selectedEvent.pubDate)}</p>
              </div>

              {selectedEvent.link && (
                <a
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mt-2"
                  href={sanitizeLink(selectedEvent.link)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Full Report <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Click on a disaster marker to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Events Feed */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Live System Activity Feed
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time</span>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {events.length > 0 ? (
            events.slice(0, 10).map((event) => (
              <div
                key={event.link}
                className={cn(
                  "p-3 bg-secondary/50 rounded-lg border cursor-pointer hover:bg-secondary transition-colors",
                  event.urgency === "critical"
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-border"
                )}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {typeToIcon(event.eventType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium border",
                          typeColor(event.eventType)
                        )}
                      >
                        {event.typeName}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium border",
                          urgencyColor(event.urgency)
                        )}
                      >
                        {event.urgency}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {timeFrom(event.pubDate)}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{event.location}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {event.title}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active alerts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
