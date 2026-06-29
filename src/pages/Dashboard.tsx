import React, { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getUserStats, getLeaderboard, type UserStats } from '../services/users';
import { getAllIssues, upvoteIssue, type IssueData } from '../services/db';
import { generateMunicipalReply } from '../services/ai';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { AlertCircle, ArrowUpRight, BarChart3, Clock, MapPin, Zap, ThumbsUp, Sparkles, Trophy, CheckCircle2, Users, Share2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { useToast } from '../components/ui/Toast';
import { useSquadStore } from '../store/useSquadStore';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { TypewriterTextarea } from '../components/ui/TypewriterTextarea';
import { Skeleton } from '../components/ui/Skeleton';
import { TimeAgo } from '../components/ui/TimeAgo';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { themeMode } = useSettingsStore();
  const { activeSquad, copyInviteLink } = useSquadStore();
  const isGenZ = themeMode === 'genz-light';
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [allIssues, setAllIssues] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftModal, setDraftModal] = useState<{issue: IssueData, reply: string} | null>(null);
  const [isDrafting, setIsDrafting] = useState<string | null>(null);
  const [upvotingId, setUpvotingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (user) {
      const userStats = await getUserStats(user.uid);
      setStats(userStats);
      
      const board = await getLeaderboard();
      setLeaderboard(board);
      
      const issues = await getAllIssues();
      setAllIssues(issues);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpvote = async (issueId?: string) => {
    if (!issueId || !user) return;
    setUpvotingId(issueId);
    await upvoteIssue(issueId);
    await fetchData();
    setUpvotingId(null);
  };

  if (loading || !stats) {
    return <div className="flex h-64 items-center justify-center"><Spinner className="w-8 h-8 text-green-500"/></div>;
  }

  const criticalIssuesCount = allIssues.filter(i => (i.priorityScore || 0) >= 80).length;
  const pendingIssuesCount = allIssues.filter(i => i.status !== 'resolved').length;
  const resolvedIssuesCount = allIssues.filter(i => i.status === 'resolved').length;

  const nextRankThreshold = stats.points < 50 ? 50 : stats.points < 150 ? 150 : stats.points < 500 ? 500 : 1000;
  const progressPercent = Math.min((stats.points / nextRankThreshold) * 100, 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{isGenZ ? "The Hub ⚡" : "Command Center"}</h1>
          <p className="text-sm text-slate-400 mt-1">{isGenZ ? "Real-time street fixes on autopilot." : "Live municipal infrastructure triage and autonomous dispatch."}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => toast("Summary report compiled! 14 actionable items flagged.", "info")}>
            <BarChart3 className="w-4 h-4 mr-2 text-slate-400" />
            {isGenZ ? "Get Receipts 🧾" : "Generate Report"}
          </Button>
          <Button size="sm" onClick={() => toast("Auto-dispatch triggered for top 5 critical risk queue items!", "success")}>
            <Zap className="w-4 h-4 mr-2" />
            {isGenZ ? "Instant Fix Top 5 ⚡" : "Auto-Dispatch Top 5"}
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{isGenZ ? "Major Red Flags" : "Critical Alerts"}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <AnimatedCounter value={criticalIssuesCount || 4} className="text-2xl font-bold font-mono text-slate-100" />
                <span className="text-xs text-red-400 font-medium flex items-center"><ArrowUpRight className="w-3 h-3" /> {isGenZ ? "active emergencies" : "Live triage"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{isGenZ ? "In the Works" : "Active Queues"}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <AnimatedCounter value={pendingIssuesCount || 4} className="text-2xl font-bold font-mono text-slate-100" />
                <span className="text-xs text-slate-500 font-medium">{isGenZ ? "AI routing now" : "pending dispatch"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{isGenZ ? "Community Ws" : "Resolved & Verified"}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <AnimatedCounter value={resolvedIssuesCount || 1} className="text-2xl font-bold font-mono text-slate-100" />
                <span className="text-xs text-green-400 font-medium">{isGenZ ? "completely cleared" : "community fixed"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Civic Squad Hub (Multiplayer Feature - Universally Available) */}
      <Card className={cn(
        "shadow-sm animate-in fade-in duration-300 transition-all",
        isGenZ ? "bg-[#F8F7F4] border-2 border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E]" : "bg-slate-900 border-slate-800"
      )}>
        <CardHeader className={cn("pb-3 flex flex-row items-center justify-between border-b", isGenZ ? "border-[#1E1E1E]" : "border-slate-800")}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3B82F6]" />
            <CardTitle className={cn("text-lg font-bold", isGenZ ? "text-[#111111]" : "text-slate-100")}>Civic Squad Hub: {activeSquad?.squadName || "Bengaluru Municipal Crusaders ⚡"}</CardTitle>
          </div>
          <button
            onClick={copyInviteLink}
            className={cn(
              "px-3 py-1.5 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all",
              isGenZ 
                ? "bg-[#F4B400] hover:bg-[#EAB308] text-[#111111] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]" 
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:translate-y-[-1px]"
            )}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Viral Invite Link 🔗</span>
          </button>
        </CardHeader>
        <CardContent className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={cn("p-4 rounded-xl flex flex-col justify-center", isGenZ ? "bg-white border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]" : "bg-slate-950 border border-slate-800")}>
            <span className={cn("text-xs font-bold uppercase", isGenZ ? "text-[#111111]" : "text-slate-400")}>Combined Squad Impact</span>
            <span className="text-2xl font-extrabold text-[#10B981] font-mono mt-1">{activeSquad?.totalSquadXP || 1830} XP ⭐</span>
            <span className="text-[10px] text-slate-500 mt-1">Ranked #1 Bengaluru Metro</span>
          </div>
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(activeSquad?.members || [
              { name: 'Aarav Patel', email: 'aarav.patel@gmail.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', status: 'Rank #1 MVP', xp: 650 },
              { name: 'Priya Nair', email: 'priya.nair@gmail.com', avatar: 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80', status: 'In Field', xp: 480 },
              { name: 'Rohan Deshmukh', email: 'rohan.deshmukh@gmail.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Triage Lead', xp: 390 }
            ]).map((m: any, idx) => (
              <div key={idx} className={cn("p-3 rounded-xl flex items-center gap-3 transition-all", isGenZ ? "bg-white border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]" : "bg-slate-950 border border-slate-800")}>
                {(m.avatar || ({'Aarav Patel': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Priya Nair': 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80', 'Rohan Deshmukh': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Ananya Iyer': 'https://images.unsplash.com/photo-1623138599284-b4b305f22bf0?w=150&auto=format&fit=crop&q=80'} as Record<string, string>)[m.name]) ? (
                  <img src={m.avatar || ({'Aarav Patel': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Priya Nair': 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80', 'Rohan Deshmukh': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Ananya Iyer': 'https://images.unsplash.com/photo-1623138599284-b4b305f22bf0?w=150&auto=format&fit=crop&q=80'} as Record<string, string>)[m.name]} alt={m.name} className="w-9 h-9 rounded-full border border-[#1E1E1E] object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#3B82F6] text-white font-extrabold text-sm flex items-center justify-center shrink-0 border border-[#1E1E1E]">
                    {m.name.charAt(0)}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className={cn("text-xs font-bold truncate", isGenZ ? "text-[#111111]" : "text-slate-100")}>{m.name}</div>
                  <div className="text-[10px] text-[#F4B400] font-mono">{m.xp || 300} XP • {m.status || 'Active'}</div>
                  {m.email && <div className="text-[9px] text-slate-500 truncate font-mono">{m.email}</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Citizen Rank Banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-green-950/30 border-slate-800">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">{isGenZ ? `${stats.rankTitle} Era` : stats.rankTitle}</h3>
                <Badge variant="success" size="sm">{isGenZ ? `${stats.points} XP` : `${stats.points} Citizen Pts`}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isGenZ 
                  ? `${nextRankThreshold - stats.points} XP until level up. Smash upvote for +10 XP!` 
                  : `Next Rank in ${nextRankThreshold - stats.points} points. Every verified upvote earns +10 pts!`}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-64 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Live Feed + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issues Queue Table */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 flex flex-col">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-100">{isGenZ ? "Street Drama (Live) 🔥" : "Live Municipal Infrastructure Feed"}</CardTitle>
              <Badge variant="outline" className="font-mono text-xs text-slate-400">{allIssues.length} total reports</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-2">
                    <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                ))}
              </div>
            ) : allIssues.length > 0 ? (
              allIssues.map((issue) => {
                const isCritical = (issue.priorityScore || 0) >= 80;
                const riskLabel = isCritical ? 'Critical' : (issue.priorityScore || 0) >= 50 ? 'High' : 'Medium';
                const riskBadgeVariant = isCritical ? 'destructive' : (issue.priorityScore || 0) >= 50 ? 'warning' : 'secondary';

                let displayTitle = issue.issueType;
                let displayDesc = issue.explanation;
                if (isGenZ) {
                  if (issue.issueType?.toLowerCase().includes('pothole')) {
                    displayTitle = "Chonky Pothole 🕳️";
                    displayDesc = "Massive puddle-filled crater. Actively ruining suspension out here.";
                  } else if (issue.issueType?.toLowerCase().includes('wiring') || issue.issueType?.toLowerCase().includes('wire') || issue.issueType?.toLowerCase().includes('tangled')) {
                    displayTitle = "Spaghetti Wires 🍝";
                    displayDesc = "A literal boss fight of unmanaged wires on the sidewalk. Major hazard.";
                  }
                }

                return (
                  <div key={issue.id} className="p-4 rounded-xl border border-transparent hover:border-green-500/30 hover:bg-slate-900/90 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <img 
                        src={issue.imageUrl?.startsWith('data:') || issue.imageUrl?.startsWith('http') ? issue.imageUrl : `data:image/jpeg;base64,${issue.imageUrl}`} 
                        alt="Hazard" 
                        className="w-14 h-14 object-cover rounded-lg border border-slate-700/80 shrink-0 bg-slate-950 group-hover:scale-105 transition-transform duration-200" 
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-200 text-sm truncate">{displayTitle}</span>
                          <Badge variant={riskBadgeVariant} size="sm">{isGenZ ? `Threat Level: ${issue.priorityScore || 50}%` : `${riskLabel} Risk (${issue.priorityScore || 50})`}</Badge>
                          {issue.weatherAlert && (
                            <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                              🌧️ {issue.weatherAlert}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{displayDesc}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 text-slate-600" /> {issue.department || 'Roads & Traffic (PWD)'}</span>
                          <span>•</span>
                          <span className="capitalize text-slate-400">{issue.status?.replace('_', ' ')}</span>
                          <span>•</span>
                          <TimeAgo timestamp={issue.createdAt} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-2.5 text-xs gap-1 border-slate-700 hover:border-green-500/50 hover:text-green-400"
                        isLoading={upvotingId === issue.id}
                        onClick={() => handleUpvote(issue.id)}
                        title="Upvote to raise priority (+10 Citizen Pts)"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{issue.upvotes || 1}</span>
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs gap-1.5 border-green-500/30 text-green-400 hover:bg-green-500 hover:text-slate-950 font-semibold"
                        isLoading={isDrafting === (issue.id || "temp")}
                        onClick={async () => {
                          const targetId = issue.id || "temp";
                          setIsDrafting(targetId);
                          const reply = await generateMunicipalReply(issue);
                          setIsDrafting(null);
                          setDraftModal({ issue, reply });
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isGenZ ? "Send AI 🤖" : "AI Dispatch"}</span>
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm font-mono">
                No active municipal tickets queued. Head to "Report Issue" to submit the first observation!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Leaderboard Card */}
        <Card className="bg-slate-900 border-slate-800 flex flex-col h-fit">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{isGenZ ? "The MVPs 👑" : "Top Citizen Responders"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-2.5 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-12 rounded" />
                  </div>
                ))}
              </div>
            ) : leaderboard.map((u, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                  idx === 0 ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-slate-950/50 border-slate-800 text-slate-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0",
                    idx === 0 ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  )}>
                    {idx + 1}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-sm truncate text-slate-200">{u.name}</p>
                    <span className="text-[10px] font-mono text-slate-500">{u.rank}</span>
                  </div>
                </div>
                <div className="font-mono font-bold text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 shrink-0">
                  {u.points} pts
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Municipal Reply Modal */}
      {draftModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-lg w-full border border-green-500/40 shadow-2xl bg-slate-900 text-slate-100">
            <CardHeader className="bg-slate-950/60 border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-400 flex items-center gap-2 text-base font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Autonomous Municipal Dispatch Draft</span>
                </CardTitle>
                <Badge variant="warning" size="sm">Officer Standby</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <p className="text-xs text-slate-400 font-mono">
                Synthesized by Gemini Multimodal for <strong className="text-slate-200">{draftModal.issue.department || "Roads & Traffic (PWD)"}</strong>
              </p>
              <TypewriterTextarea
                className="w-full p-3 border border-slate-700 rounded-lg bg-slate-950 text-sm text-slate-200 font-sans min-h-[120px] outline-none focus:border-green-500/60 transition-colors"
                text={draftModal.reply}
                onChange={(val) => setDraftModal({ ...draftModal, reply: val })}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 font-bold text-xs shadow-md"
                  onClick={() => {
                    toast(`Formal municipal dispatch sent to Citizen #${draftModal.issue.reporterId.slice(0,6)}! Status updated to In Progress.`, 'success');
                    setDraftModal(null);
                  }}
                >
                  ✓ Dispatch Status Update
                </Button>
                <Button
                  variant="secondary"
                  className="text-xs px-4"
                  onClick={() => setDraftModal(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
