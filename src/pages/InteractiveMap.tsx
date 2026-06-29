import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAllIssues, upvoteIssue, type IssueData } from '../services/db';
import { useAuthStore } from '../store/useAuthStore';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MapPin, Navigation, ThumbsUp, X, Zap } from 'lucide-react';
import { cn } from '../utils/cn';
import { useToast } from '../components/ui/Toast';

// Fix for default Leaflet icons in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const getCustomIcon = (score: number = 50) => {
  let bg = '#10B981'; // green
  let isCritical = false;
  if (score >= 75) {
    bg = '#EF4444'; // red
    isCritical = true;
  } else if (score >= 50) {
    bg = '#F59E0B'; // amber
  }

  return L.divIcon({
    className: '!bg-transparent !border-0',
    html: `<div class="relative w-6 h-6 flex items-center justify-center">
      ${isCritical ? '<div class="absolute inset-0 rounded-full bg-red-500/75 animate-ping"></div>' : ''}
      <div class="relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background-color: ${bg}"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const LocateControl = () => {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const { toast } = useToast();

  const locateUser = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 15 });
    map.once('locationfound', (e) => {
      setLocating(false);
      L.marker(e.latlng).addTo(map).bindPopup("You are here").openPopup();
    });
    map.once('locationerror', () => {
      setLocating(false);
      toast("Could not access your location. Please check browser permissions.", "error");
    });
  };

  return (
    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
      <button 
        onClick={locateUser}
        className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 p-2.5 rounded-lg shadow-lg flex items-center justify-center transition-colors"
        title="Locate Me"
      >
        {locating ? <Spinner className="w-5 h-5 text-green-500" /> : <Navigation className="w-5 h-5 text-green-400" />}
      </button>
    </div>
  );
};

export const InteractiveMap: React.FC = () => {
  const { user } = useAuthStore();
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<IssueData | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'pending' | 'resolved'>('all');
  const [upvotingId, setUpvotingId] = useState<string | null>(null);

  const fetchIssues = async () => {
    const data = await getAllIssues();
    setIssues(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleUpvote = async (issueId?: string) => {
    if (!issueId || !user) return;
    setUpvotingId(issueId);
    await upvoteIssue(issueId);
    await fetchIssues();
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(prev => prev ? { ...prev, upvotes: (prev.upvotes || 0) + 1 } : null);
    }
    setUpvotingId(null);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-slate-950">
        <Spinner className="w-10 h-10 text-green-500" />
      </div>
    );
  }

  const filteredIssues = issues.filter(i => {
    if (filter === 'critical') return (i.priorityScore || 0) >= 75;
    if (filter === 'pending') return i.status !== 'resolved';
    if (filter === 'resolved') return i.status === 'resolved';
    return true;
  });

  const defaultCenter: [number, number] = issues.length > 0 
    ? [issues[0].latitude, issues[0].longitude] 
    : [40.7128, -74.0060]; // NYC default fallback

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] relative font-sans -m-4 md:-m-6">
      {/* Floating Header Bar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 max-w-xl pr-16">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-slate-100 font-bold text-sm">
          <MapPin className="w-4 h-4 text-green-500" />
          <span>GIS Live Telemetry</span>
          <Badge variant="outline" size="sm" className="ml-1 font-mono text-xs">{filteredIssues.length} active</Badge>
        </div>

        {/* Filter Pills */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-xl flex items-center gap-1">
          {[
            { id: 'all', label: 'All Hazards' },
            { id: 'critical', label: '🚨 Critical Priority' },
            { id: 'pending', label: '⚡ Active Queue' },
            { id: 'resolved', label: '✔ Verified Fixed' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                setFilter(f.id as any);
                setSelectedIssue(null);
              }}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-all",
                filter === f.id 
                  ? "bg-green-500 text-slate-950 font-bold shadow" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="w-full h-full relative z-0 bg-slate-950">
        <MapContainer 
          center={defaultCenter} 
          zoom={issues.length > 0 ? 13 : 11} 
          className="w-full h-full"
        >
          <LocateControl />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {filteredIssues.map((issue) => (
            <Marker 
              key={issue.id} 
              position={[issue.latitude, issue.longitude]}
              icon={getCustomIcon(issue.priorityScore)}
              eventHandlers={{
                click: () => setSelectedIssue(issue)
              }}
            >
              <Popup className="custom-popup font-sans">
                <div className="p-1 min-w-[210px]">
                  <img 
                    src={issue.imageUrl?.startsWith('data:') || issue.imageUrl?.startsWith('http') ? issue.imageUrl : `data:image/jpeg;base64,${issue.imageUrl}`} 
                    alt="Hazard" 
                    className="w-full h-28 object-cover rounded mb-2 bg-slate-950" 
                  />
                  <h3 className="font-bold text-sm text-slate-900 truncate mb-1">{issue.issueType}</h3>
                  <div className="flex items-center gap-1 mb-1.5">
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                      Score: {issue.priorityScore || 50}
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-medium px-1.5 py-0.5 rounded capitalize">
                      {issue.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">{issue.explanation}</p>
                  <button 
                    onClick={() => setSelectedIssue(issue)}
                    className="w-full py-1 bg-green-600 text-white font-semibold text-xs rounded hover:bg-green-700 transition-colors"
                  >
                    Inspect Telemetry Drawer
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Selected Issue Inspection Side Drawer */}
      {selectedIssue && (
        <div className="absolute top-16 right-4 z-[400] w-80 max-h-[calc(100%-80px)] overflow-y-auto animate-in slide-in-from-right duration-200">
          <Card className="bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-slate-100">
            <CardHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-green-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Ticket Telemetry Inspection</span>
              </CardTitle>
              <button 
                onClick={() => setSelectedIssue(null)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <img 
                src={selectedIssue.imageUrl?.startsWith('data:') || selectedIssue.imageUrl?.startsWith('http') ? selectedIssue.imageUrl : `data:image/jpeg;base64,${selectedIssue.imageUrl}`} 
                alt="Hazard" 
                className="w-full h-44 object-cover rounded-lg border border-slate-800 bg-slate-950" 
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-slate-100">{selectedIssue.issueType}</h4>
                  <Badge variant={(selectedIssue.priorityScore || 0) >= 75 ? 'destructive' : 'warning'} size="sm">
                    Priority {selectedIssue.priorityScore || 50}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-slate-400">{selectedIssue.department || 'Roads & Traffic (PWD)'}</p>
              </div>

              {selectedIssue.weatherAlert && (
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-md text-xs text-blue-300 font-mono flex items-center gap-2">
                  <span>🌧️</span>
                  <span>{selectedIssue.weatherAlert}</span>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold">AI Multimodal Assessment</span>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded border border-slate-800/80 leading-relaxed font-mono">
                  {selectedIssue.explanation}
                </p>
              </div>

              {selectedIssue.userDescription && (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold">Citizen Observation Note</span>
                  <p className="text-xs text-slate-400 italic bg-slate-950/50 p-2.5 rounded border border-slate-800">
                    "{selectedIssue.userDescription}"
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 h-9 text-xs border-slate-700 hover:border-green-500/50 hover:text-green-400"
                  isLoading={upvotingId === selectedIssue.id}
                  onClick={() => handleUpvote(selectedIssue.id)}
                >
                  <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                  <span>Upvote ({selectedIssue.upvotes || 1})</span>
                </Button>
                <Badge variant={selectedIssue.status === 'resolved' ? 'success' : 'outline'} size="sm" className="h-8 px-3">
                  {selectedIssue.status?.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
