#!/usr/bin/env python3
"""
AidRoute Simple GDACS Live Feeds Script
Simplified version that works with the actual GDACS API structure
"""

import json
import time
from datetime import datetime
from typing import Dict, List, Optional

try:
    from gdacs.api import GDACSAPIReader, GDACSAPIError
except ImportError:
    print("❌ gdacs-api not installed. Install with: pip install gdacs-api")
    exit(1)

class AidRouteSimpleGDACS:
    """Simplified AidRoute GDACS disaster feed"""
    
    def __init__(self):
        self.client = GDACSAPIReader()
        self.disaster_types = {
            'TC': 'Tropical Cyclone',
            'EQ': 'Earthquake', 
            'FL': 'Flood',
            'VO': 'Volcano',
            'WF': 'Wild Fire',
            'DR': 'Drought'
        }
    
    def get_recent_events_simple(self, limit: int = 10) -> List[Dict]:
        """Get recent events with simplified approach"""
        print(f"🌍 Fetching {limit} most recent disaster events...")
        
        all_events = []
        
        # Try each disaster type
        for event_type, type_name in self.disaster_types.items():
            try:
                print(f"   📡 Fetching {type_name}s...")
                
                # Get events without limit first to see structure
                events = self.client.latest_events(event_type=event_type, limit=2)
                
                if events:
                    print(f"   ✅ Got {type_name} events: {type(events)}")
                    
                    # Handle the GeoJSON structure
                    if hasattr(events, 'features'):
                        for feature in events.features[:2]:  # Limit to 2 per type
                            aidroute_event = self._create_aidroute_event(feature, event_type, type_name)
                            all_events.append(aidroute_event)
                    else:
                        print(f"   ⚠️  Unexpected structure for {type_name}: {type(events)}")
                        
            except Exception as e:
                print(f"   ❌ Error fetching {type_name}: {e}")
                continue
        
        return all_events[:limit]
    
    def _create_aidroute_event(self, feature, event_type: str, type_name: str) -> Dict:
        """Create AidRoute event from GeoJSON feature"""
        
        # Extract properties from the feature
        properties = feature.get('properties', {})
        
        # Get basic info
        title = properties.get('title', f'{type_name} Alert')
        link = properties.get('link', '')
        
        # Calculate severity
        severity_score = self._calculate_severity(properties, event_type)
        
        # Determine urgency
        if severity_score >= 4:
            urgency = 'critical'
        elif severity_score >= 3:
            urgency = 'high'
        elif severity_score >= 2:
            urgency = 'medium'
        else:
            urgency = 'low'
        
        # Create AidRoute activity
        return {
            'id': f"gdacs-{event_type}-{int(time.time())}",
            'type': 'disaster_alert',
            'timestamp': datetime.now().isoformat(),
            'source': 'GDACS',
            'data': {
                'title': title,
                'event_type': event_type,
                'type_name': type_name,
                'severity_score': severity_score,
                'urgency': urgency,
                'link': link,
                'properties': properties,  # Keep original data
                'geometry': feature.get('geometry', {})  # Keep location data
            }
        }
    
    def _calculate_severity(self, properties: Dict, event_type: str) -> int:
        """Calculate severity score from properties"""
        
        # Base scores
        base_scores = {
            'EQ': 3, 'TC': 3, 'FL': 2, 'VO': 2, 'WF': 2, 'DR': 1
        }
        
        score = base_scores.get(event_type, 2)
        
        # Try to extract magnitude or intensity
        title = properties.get('title', '').lower()
        
        if event_type == 'EQ':
            if 'magnitude 7' in title or 'magnitude 8' in title:
                score = 5
            elif 'magnitude 6' in title:
                score = 4
            elif 'magnitude 5' in title:
                score = 3
                
        elif event_type == 'TC':
            if 'category 5' in title or 'category 4' in title:
                score = 5
            elif 'category 3' in title:
                score = 4
            elif 'category 2' in title:
                score = 3
                
        return min(5, score)
    
    def print_events(self, events: List[Dict]):
        """Print formatted events"""
        if not events:
            print("❌ No events found")
            return
            
        print(f"\n🎯 Found {len(events)} disaster events:")
        print("=" * 60)
        
        for i, event in enumerate(events, 1):
            data = event['data']
            severity_emoji = {
                5: '🔴', 4: '🟠', 3: '🟡', 2: '🟢', 1: '⚪'
            }.get(data['severity_score'], '⚪')
            
            print(f"\n{i}. {severity_emoji} {data['title']}")
            print(f"   Type: {data['type_name']} ({data['event_type']})")
            print(f"   Urgency: {data['urgency'].upper()}")
            print(f"   Severity: {data['severity_score']}/5")
            if data['link']:
                print(f"   Link: {data['link']}")
            print(f"   ID: {event['id']}")
    
    def save_events(self, events: List[Dict], filename: str = 'aidroute_gdacs_feeds.json'):
        """Save events to JSON file"""
        try:
            with open(filename, 'w') as f:
                json.dump(events, f, indent=2)
            print(f"💾 Saved {len(events)} events to {filename}")
        except Exception as e:
            print(f"❌ Error saving: {e}")

def main():
    """Main function"""
    print("🚀 AidRoute Simple GDACS Live Feed")
    print("=" * 40)
    
    feed = AidRouteSimpleGDACS()
    
    # Get recent events
    events = feed.get_recent_events_simple(limit=8)
    
    # Print results
    feed.print_events(events)
    
    # Save to file
    if events:
        feed.save_events(events)
    
    print("\n🎉 GDACS feed processing complete!")
    
    if events:
        print(f"\n📊 Summary:")
        print(f"   - Total events: {len(events)}")
        
        # Count by type
        type_counts = {}
        for event in events:
            event_type = event['data']['type_name']
            type_counts[event_type] = type_counts.get(event_type, 0) + 1
        
        print(f"   - By type: {', '.join([f'{k}: {v}' for k, v in type_counts.items()])}")
        
        # Count by urgency
        urgency_counts = {}
        for event in events:
            urgency = event['data']['urgency']
            urgency_counts[urgency] = urgency_counts.get(urgency, 0) + 1
        
        print(f"   - By urgency: {', '.join([f'{k}: {v}' for k, v in urgency_counts.items()])}")

if __name__ == "__main__":
    main()
