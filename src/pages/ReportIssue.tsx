import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { ImageUpload } from '../components/features/ImageUpload';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useGeolocation } from '../hooks/useGeolocation';
import { getNearbyFacilities, searchAddress, type GeocodeResult } from '../services/places';
import { analyzeIssueImage, calculatePriorityScore } from '../services/ai';
import { fileToBase64 } from '../utils/fileToBase64';
import { createIssue, getNearbyOpenIssues, upvoteIssue, type IssueData } from '../services/db';
import { useAuthStore } from '../store/useAuthStore';
import { AlertTriangle, ArrowRight, CheckCircle2, MapPin, Sparkles, Upload, Zap } from 'lucide-react';
import { cn } from '../utils/cn';
import { useToast } from '../components/ui/Toast';
import { AIProcessingSteps } from '../components/ui/AIProcessingSteps';
import { ConfettiBurst } from '../components/ui/ConfettiBurst';

let DefaultPinIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultPinIcon;

function PinpointMap({ lat, lng, onMove }: { lat: number, lng: number, onMove: (lat: number, lng: number) => void }) {
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        onMove(e.latlng.lat, e.latlng.lng);
      }
    });
    return null;
  };

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-700 shadow-inner mt-4 relative z-0 bg-slate-950">
      <MapContainer key={`${lat.toFixed(4)}-${lng.toFixed(4)}`} center={[lat, lng]} zoom={16} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[lat, lng]} draggable={true} eventHandlers={{
          dragend: (e) => {
            const m = e.target;
            const pos = m.getLatLng();
            onMove(pos.lat, pos.lng);
          }
        }}>
          <Popup className="font-sans text-xs font-semibold">📍 Hazard Pinpoint</Popup>
        </Marker>
        <MapEvents />
      </MapContainer>
      <div className="bg-slate-950/90 text-[11px] font-mono font-medium p-2 absolute bottom-2 left-2 z-[400] rounded border border-slate-800 text-slate-300 shadow pointer-events-none flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
        <span>Interactive Map: Drag pin or click coordinate to adjust GPS</span>
      </div>
    </div>
  );
}

export const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { latitude, longitude, error: geoError, isLoading: geoLoading } = useGeolocation();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userDescription, setUserDescription] = useState("");
  const [duplicateCandidate, setDuplicateCandidate] = useState<IssueData | null>(null);
  
  // Manual Location State
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualCoords, setManualCoords] = useState<{lat: number, lon: number} | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [reportCoords, setReportCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // Data State
  const [analysis, setAnalysis] = useState<any>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [priority, setPriority] = useState<any>(null);

  const handleUploadComplete = (uploadedFile: File, previewUrl: string) => {
    setFile(uploadedFile);
    setPreview(previewUrl);
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 3) {
      setIsSearching(true);
      const results = await searchAddress(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const selectManualLocation = (result: GeocodeResult) => {
    setManualCoords({ lat: result.lat, lon: result.lon });
    setSelectedAddress(result.displayName);
    setSearchQuery("");
    setSearchResults([]);
  };

  const executeAIAnalysis = async (finalLat: number, finalLng: number) => {
    setIsProcessing(true);
    setStep(2);
    try {
      const base64 = await fileToBase64(file!);
      const visionResult = await analyzeIssueImage(base64, file!.type, userDescription);
      setAnalysis(visionResult);
      const nearby = await getNearbyFacilities(finalLat, finalLng);
      setFacilities(nearby);
      const priorityResult = await calculatePriorityScore(visionResult, nearby, 0, userDescription, finalLat, finalLng);
      setPriority(priorityResult);
      setStep(3);
    } catch (error) {
      console.error(error);
      toast("Failed to analyze issue. Please try again.", "error");
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const processIssue = async () => {
    if (!file || !user) return;
    
    const finalLat = isManualLocation ? manualCoords?.lat : latitude;
    const finalLng = isManualLocation ? manualCoords?.lon : longitude;

    if (!isManualLocation && geoLoading) {
      toast("Still acquiring GPS location. Please wait...", "warning");
      return;
    }
    if (!finalLat || !finalLng) {
      toast("A valid location is required to report an issue. Please wait for GPS or use the Manual Location option.", "warning");
      return;
    }

    setReportCoords({ lat: finalLat, lng: finalLng });
    setIsProcessing(true);

    try {
      const duplicates = await getNearbyOpenIssues(finalLat, finalLng, 50);
      if (duplicates.length > 0) {
        setDuplicateCandidate(duplicates[0]);
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.error("Duplicate check failed, continuing:", err);
    }

    await executeAIAnalysis(finalLat, finalLng);
  };

  const submitIssue = async () => {
    if (!file || !user || !analysis || !priority || !reportCoords) return;
    setIsProcessing(true);

    try {
      const imageUrl = preview || (await fileToBase64(file));

      const issueData: IssueData = {
        reporterId: user.uid,
        reporterName: user.displayName || 'Citizen',
        imageUrl,
        latitude: reportCoords.lat,
        longitude: reportCoords.lng,
        nearbyFacilities: facilities || [],
        issueType: analysis.issueType || 'Municipal Hazard',
        severity: analysis.severity ?? 5,
        riskLevel: analysis.riskLevel || 'Medium',
        explanation: analysis.explanation || '',
        userDescription: userDescription || '',
        weatherAlert: priority.weatherAlert || undefined,
        priorityScore: priority.priorityScore ?? 50,
        department: priority.department || 'Roads & Traffic (PWD)',
        status: 'reported',
        upvotes: 0,
        verifiedBy: []
      };

      await createIssue(issueData);
      setStep(4);
    } catch (error) {
      console.error(error);
      toast(`Failed to submit issue to database. Error: ${error instanceof Error ? error.message : "Permission denied or network issue"}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-16">
      {/* Title & Step Indicator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Report Municipal Hazard</h1>
          <p className="text-sm text-slate-400 mt-1">Autonomous 2-step AI triage and instant GIS dispatch queueing.</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className={cn("px-3 py-1.5 rounded-md border flex items-center gap-1.5", step === 1 ? "bg-green-500/10 border-green-500/30 text-green-400 font-bold" : "bg-slate-900 border-slate-800 text-slate-500")}>
            <span>1. Capture & Locate</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={cn("px-3 py-1.5 rounded-md border flex items-center gap-1.5", step === 3 ? "bg-green-500/10 border-green-500/30 text-green-400 font-bold" : "bg-slate-900 border-slate-800 text-slate-500")}>
            <span>2. AI Triage Review</span>
          </div>
        </div>
      </div>

      {/* Duplicate Modal */}
      {duplicateCandidate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border border-amber-500/40 shadow-2xl bg-slate-900 text-slate-100">
            <CardHeader className="bg-slate-950/60 border-b border-slate-800 pb-4">
              <CardTitle className="text-amber-400 flex items-center gap-2 text-base font-bold">
                <AlertTriangle className="w-5 h-5" />
                <span>Duplicate Hazard Detected within 50m</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <p className="text-xs text-slate-300">
                An active civic report already exists near your exact coordinates. Upvoting it escalates priority faster than new tickets!
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center font-semibold text-sm">
                  <span className="text-slate-200">{duplicateCandidate.issueType || "Civic Hazard"}</span>
                  <Badge variant="warning" size="sm">{duplicateCandidate.status}</Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{duplicateCandidate.explanation}</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  className="w-full font-bold text-xs"
                  onClick={async () => {
                    setIsProcessing(true);
                    if (duplicateCandidate.id) await upvoteIssue(duplicateCandidate.id);
                    setIsProcessing(false);
                    toast("Thank you! You upvoted the existing report (+10 Citizen Points)", "success");
                    navigate('/dashboard');
                  }}
                >
                  👍 Upvote Existing Ticket
                </Button>
                <Button
                  variant="secondary"
                  className="w-full text-xs"
                  onClick={() => {
                    setDuplicateCandidate(null);
                    if (reportCoords) executeAIAnalysis(reportCoords.lat, reportCoords.lng);
                  }}
                >
                  Proceed with My New Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 1: Upload & Locate */}
      {step === 1 && (
        <Card className="bg-slate-900 border-slate-800 shadow-md">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-green-500" />
              <span>Step 1: Upload Visual Evidence & Coordinates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <ImageUpload 
              onUploadComplete={handleUploadComplete} 
              onClear={() => { setFile(null); setPreview(null); }} 
            />

            {/* Context Box */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <label className="text-sm font-semibold text-slate-200 block">Supplementary Observation Notes (Optional)</label>
              <p className="text-xs text-slate-400">Describe smells, sounds, or hidden dangers to assist Gemini Multimodal AI.</p>
              <textarea
                className="w-full p-3 border border-slate-700 rounded-lg bg-slate-950 text-sm text-slate-200 focus:border-green-500/60 outline-none transition-all min-h-[80px]"
                placeholder="e.g., Water is gushing rapidly onto the sidewalk..."
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
              />
            </div>
            
            {/* Location Selector */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>Geographic Pinpoint</span>
                </span>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setIsManualLocation(!isManualLocation)}
                  className="text-xs h-8"
                >
                  {isManualLocation ? 'Switch to Live GPS' : 'Manual Address Search'}
                </Button>
              </div>

              {!isManualLocation ? (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  {geoLoading ? (
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
                      <Spinner className="w-3.5 h-3.5 text-green-500" /> Acquiring satellite telemetry...
                    </span>
                  ) : geoError ? (
                    <span className="text-red-400 text-xs font-mono font-bold">GPS Error: {geoError}</span>
                  ) : (
                    <span className="text-green-400 text-xs font-mono font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      High-Precision GPS Lock ({latitude?.toFixed(4)}, {longitude?.toFixed(4)})
                    </span>
                  )}
                  <Badge variant="outline" size="sm">Auto-Geocode</Badge>
                </div>
              ) : (
                <div className="relative space-y-2">
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-700 rounded-lg bg-slate-950 text-sm text-slate-200 focus:border-green-500/60 outline-none transition-all"
                    placeholder="Search street intersection or landmark..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  {isSearching && <div className="text-xs text-slate-400 font-mono">Querying GIS database...</div>}
                  
                  {searchResults.length > 0 && (
                    <div className="absolute z-20 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-48 overflow-y-auto mt-1 divide-y divide-slate-800">
                      {searchResults.map((res, i) => (
                        <div 
                          key={i} 
                          className="p-3 hover:bg-slate-800 cursor-pointer text-xs text-slate-200 transition-colors"
                          onClick={() => selectManualLocation(res)}
                        >
                          {res.displayName}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedAddress && (
                    <div className="p-3 bg-green-500/10 text-green-400 rounded-lg text-xs font-mono font-bold border border-green-500/20 flex justify-between items-center">
                      <span className="truncate mr-2">✓ Selected: {selectedAddress}</span>
                      <button 
                        className="text-green-400 hover:text-green-300 font-bold"
                        onClick={() => {
                          setSelectedAddress("");
                          setManualCoords(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              {((isManualLocation && manualCoords) || (!isManualLocation && latitude && longitude)) && (
                <PinpointMap
                  lat={(isManualLocation ? manualCoords?.lat : latitude) || 0}
                  lng={(isManualLocation ? manualCoords?.lon : longitude) || 0}
                  onMove={(newLat, newLng) => {
                    setManualCoords({ lat: newLat, lon: newLng });
                    setIsManualLocation(true);
                  }}
                />
              )}
            </div>

            <Button 
              className="w-full h-11 text-sm font-bold shadow-lg" 
              disabled={!file || (!isManualLocation && geoLoading) || (isManualLocation && !manualCoords)} 
              onClick={processIssue}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze with Gemini AI
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            <AIProcessingSteps />
          </CardContent>
        </Card>
      )}

      {/* Step 3: AI Review */}
      {step === 3 && analysis && priority && (
        <Card className="bg-slate-900 border-slate-800 shadow-md">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span>Step 2: Review Autonomous Triage & Dispatch Routing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <img src={preview!} alt="Hazard Preview" className="w-full h-52 object-cover rounded-lg border border-slate-800 bg-slate-950" />
                <div className="space-y-1">
                  <span className="text-xs font-mono text-slate-400 uppercase">AI Detected Hazard</span>
                  <h4 className="text-lg font-bold text-slate-100">{analysis.issueType}</h4>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={analysis.severity > 7 ? 'destructive' : 'warning'} size="sm">
                    Severity: {analysis.severity}/10
                  </Badge>
                  <Badge variant="outline" size="sm">{analysis.riskLevel} Risk</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono">
                  {analysis.explanation}
                </p>
              </div>

              <div className="space-y-5 bg-slate-950 p-5 rounded-lg border border-slate-800 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" /> Priority Matrix
                    </span>
                    <span className="text-2xl font-mono font-bold text-green-400">{priority.priorityScore}/100</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-slate-400">
                      <span>Dispatch Weight</span>
                      <span>{priority.priorityScore >= 75 ? 'Immediate Queue' : 'Standard Queue'}</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-green-500 h-full transition-all" style={{ width: `${priority.priorityScore}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 pt-2">
                    <span className="text-xs font-mono text-slate-400">Target Department</span>
                    <div className="pt-1">
                      <Badge variant="default" size="md" className="font-sans font-bold py-1 px-3">
                        {priority.department}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-mono text-slate-400">GIS Infrastructure Proximity</span>
                    {facilities.length > 0 ? (
                      <ul className="text-xs font-mono text-slate-300 space-y-1 max-h-28 overflow-y-auto pr-1 divide-y divide-slate-900">
                        {facilities.slice(0, 4).map((f: any, i: number) => (
                          <li key={i} className="py-1 flex justify-between truncate">
                            <span className="truncate">{f.name}</span>
                            <span className="text-slate-500 shrink-0 ml-2">{f.distance}m</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 font-mono">✔ Residential / Municipal Sector Zone</p>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span>Verified by Gemini 1.5 Pro</span>
                  <span className="text-green-400">Ready for Broadcast</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <Button variant="secondary" className="w-1/3 h-11 text-sm font-semibold" onClick={() => setStep(1)} disabled={isProcessing}>
                Re-capture
              </Button>
              <Button className="w-2/3 h-11 text-sm font-bold shadow-lg" onClick={submitIssue} isLoading={isProcessing}>
                Confirm & Dispatch Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
          <ConfettiBurst />
          <CardContent className="py-16 flex flex-col items-center justify-center space-y-4 text-center relative z-10">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-500/20 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 font-heading">Ticket Queued & Dispatched!</h3>
            <p className="text-xs text-slate-300 font-mono max-w-md bg-slate-950 p-3 rounded-lg border border-slate-800">
              Your report has been logged into the municipal database, scored by AI triage, and dispatched to <strong className="text-green-400">{priority?.department}</strong>.
            </p>
            <Button className="mt-4 h-11 px-8 font-extrabold shadow-xl text-sm" onClick={() => navigate('/dashboard')}>
              Return to Command Center ⚡
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
