// Raw GDACS API fetcher - works in browser and server
// No blockchain, no fallback data, no synthetic conversions

export interface RawDisasterEvent {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  eventType: string;
  typeName: string;
  severity: number;
  urgency: "critical" | "high" | "medium" | "low";
  location: string;
}

// Simple XML tag extractor that works everywhere
function extractXmlTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

class GDACSFetcher {
  private disasterEvents: RawDisasterEvent[] = [];
  private listeners: Map<string, Function[]> = new Map();
  private updateInterval?: NodeJS.Timeout;

  private readonly GDACS_BASE_PATH = "/api/gdacs/rss";
  private readonly disasterTypes = {
    TC: "Tropical Cyclone",
    EQ: "Earthquake",
    FL: "Flood",
    VO: "Volcano",
    WF: "Wild Fire",
    DR: "Drought",
  };

  constructor() {
    this.startUpdates();
  }

  private async fetchGDACSDisasters(): Promise<RawDisasterEvent[]> {
    try {
      console.log("🌍 Fetching GDACS data...");

      const baseUrl =
        typeof window !== "undefined"
          ? ""
          : process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";
      const proxyUrl = `${baseUrl}${this.GDACS_BASE_PATH}`;

      const response = await fetch(proxyUrl, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`GDACS upstream error: ${response.status}`);
      }

      const xmlText = await response.text();

      // Parse using regex (works in browser and Node.js)
      const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
      const events: RawDisasterEvent[] = [];

      itemMatches.slice(0, 10).forEach((itemXml) => {
        const title = extractXmlTag(itemXml, "title");
        const link = extractXmlTag(itemXml, "link");
        const description = extractXmlTag(itemXml, "description");
        const pubDate = extractXmlTag(itemXml, "pubDate");

        if (!title) return; // Skip invalid items

        const { eventType, severity, location } = this.parseDisasterInfo(
          title,
          description
        );

        events.push({
          title,
          link,
          description,
          pubDate,
          eventType,
          typeName:
            this.disasterTypes[eventType as keyof typeof this.disasterTypes] ||
            "Unknown",
          severity,
          urgency: this.calculateUrgency(severity),
          location,
        });
      });

      if (events.length === 0) {
        throw new Error("No events found in GDACS feed");
      }

      console.log(`✅ Fetched ${events.length} events`);
      console.groupCollapsed("📊 GDACS Raw Data");
      console.dir(events, { depth: null });
      console.table(
        events.map((e) => ({
          title: e.title,
          type: e.eventType,
          severity: e.severity,
          urgency: e.urgency,
          location: e.location,
          link: e.link,
        }))
      );
      console.groupEnd();

      return events;
    } catch (error) {
      console.error("❌ GDACS fetch error:", error);
      throw error;
    }
  }

  private parseDisasterInfo(
    title: string,
    description: string
  ): { eventType: string; severity: number; location: string } {
    const titleLower = title.toLowerCase();

    let eventType = "DR";
    if (titleLower.includes("earthquake") || titleLower.includes("magnitude")) {
      eventType = "EQ";
    } else if (
      titleLower.includes("cyclone") ||
      titleLower.includes("hurricane") ||
      titleLower.includes("typhoon")
    ) {
      eventType = "TC";
    } else if (
      titleLower.includes("flood") ||
      titleLower.includes("flooding")
    ) {
      eventType = "FL";
    } else if (
      titleLower.includes("volcano") ||
      titleLower.includes("volcanic")
    ) {
      eventType = "VO";
    } else if (titleLower.includes("fire") || titleLower.includes("wildfire")) {
      eventType = "WF";
    }

    let severity = 2;
    if (eventType === "EQ") {
      if (
        titleLower.includes("magnitude 7") ||
        titleLower.includes("magnitude 8") ||
        titleLower.includes("magnitude 9")
      ) {
        severity = 5;
      } else if (titleLower.includes("magnitude 6")) {
        severity = 4;
      } else if (titleLower.includes("magnitude 5")) {
        severity = 3;
      }
    } else if (eventType === "TC") {
      if (
        titleLower.includes("category 5") ||
        titleLower.includes("category 4")
      ) {
        severity = 5;
      } else if (titleLower.includes("category 3")) {
        severity = 4;
      } else if (titleLower.includes("category 2")) {
        severity = 3;
      }
    }

    if (
      titleLower.includes("major") ||
      titleLower.includes("severe") ||
      titleLower.includes("catastrophic")
    ) {
      severity = Math.max(severity, 4);
    } else if (
      titleLower.includes("moderate") ||
      titleLower.includes("significant")
    ) {
      severity = Math.max(severity, 3);
    }

    const locationMatch = title.match(
      /(?:in|near|at|affecting)\s+([A-Z][a-z\s]+)/i
    );
    const location = locationMatch
      ? locationMatch[1]
      : title.split(" - ")[0] || "Unknown";

    return { eventType, severity, location };
  }

  private calculateUrgency(
    severity: number
  ): "critical" | "high" | "medium" | "low" {
    if (severity >= 4) return "critical";
    if (severity >= 3) return "high";
    if (severity >= 2) return "medium";
    return "low";
  }

  private startUpdates() {
    this.updateDisasterData();
    this.updateInterval = setInterval(() => {
      this.updateDisasterData();
    }, 2 * 60 * 1000);
  }

  private async updateDisasterData() {
    try {
      const events = await this.fetchGDACSDisasters();
      this.disasterEvents = [...events, ...this.disasterEvents].slice(0, 50);
      this.emit("events-updated", events);
    } catch (error) {
      console.error("Error updating GDACS data:", error);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  getEvents(): RawDisasterEvent[] {
    return [...this.disasterEvents];
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.listeners.clear();
  }
}

export const realTimeDisasterService = new GDACSFetcher();
export default realTimeDisasterService;
