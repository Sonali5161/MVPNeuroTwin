'use client';

import { useState, useMemo } from 'react';
import { useTrialStore, type AdverseEvent, type TrialParticipant, type EnrollmentStatus } from '@/lib/trial-store';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  FlaskConical, Users, UserPlus, BarChart3, AlertTriangle,
  ClipboardCheck, ChevronRight, Search, Filter, CheckCircle2,
  XCircle, Clock, TrendingUp, TrendingDown, Minus, ArrowRight,
  Shield, FileText, Activity, Download, ExternalLink, Eye,
} from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

/* ─── Color helpers ─── */

const phaseColors: Record<string, string> = {
  'Phase I': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Phase II': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'Phase III': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Phase IV': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Pilot: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const statusColors: Record<string, string> = {
  recruiting: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  terminated: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const enrollmentStatusColors: Record<string, string> = {
  screening: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  eligible: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  enrolled: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'active-treatment': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'follow-up': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  withdrawn: 'bg-red-500/20 text-red-400 border-red-500/30',
  'screen-fail': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const aeTypeColors: Record<string, string> = {
  serious: 'bg-red-500/20 text-red-400 border-red-500/30',
  'non-serious': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  mild: 'bg-green-500/20 text-green-400 border-green-500/30',
  moderate: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  severe: 'bg-red-600/20 text-red-300 border-red-600/30',
};

const causalityColors: Record<string, string> = {
  definite: 'bg-red-500/20 text-red-400 border-red-500/30',
  probable: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  possible: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  unlikely: 'bg-green-500/20 text-green-400 border-green-500/30',
  unrelated: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const outcomeColors: Record<string, string> = {
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  ongoing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  fatal: 'bg-red-500/20 text-red-400 border-red-500/30',
  unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const severityColors: string[] = [
  'text-green-400',
  'text-yellow-400',
  'text-orange-400',
  'text-red-400',
  'text-red-600',
];

const complianceColor = (rate: number) =>
  rate >= 90 ? 'text-emerald-400' : rate >= 70 ? 'text-amber-400' : 'text-red-400';

const complianceBarColor = (rate: number) =>
  rate >= 90 ? '[&>div]:bg-emerald-500' : rate >= 70 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500';

const complianceStatusColors: Record<string, string> = {
  compliant: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'at-risk': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'non-compliant': 'bg-red-500/20 text-red-400 border-red-500/30',
};

/* ─── Sub-tab definitions ─── */

const subTabs: { key: 'trials' | 'enrollment' | 'outcomes' | 'adverse-events' | 'compliance'; label: string; icon: React.ElementType }[] = [
  { key: 'trials', label: 'Trial Registry', icon: FlaskConical },
  { key: 'enrollment', label: 'Enrollment', icon: Users },
  { key: 'outcomes', label: 'Outcome Monitoring', icon: BarChart3 },
  { key: 'adverse-events', label: 'Adverse Events', icon: AlertTriangle },
  { key: 'compliance', label: 'Protocol Compliance', icon: ClipboardCheck },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function ClinicalTrialsPanel() {
  const {
    trials, selectedTrial, setSelectedTrial,
    activeSubTab, setActiveSubTab,
    withdrawPatient, resolveAdverseEvent,
    cohortFilter, setCohortFilter,
    statusFilter, setStatusFilter,
  } = useTrialStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [aeFilter, setAeFilter] = useState<string>('all');
  const [expandedAe, setExpandedAe] = useState<string | null>(null);
  const [expandedCompliance, setExpandedCompliance] = useState<string | null>(null);

  /* ─── Shared computed values (must be at top-level for hooks) ─── */

  const filteredParticipants = useMemo(() => {
    if (!selectedTrial) return [];
    let list = selectedTrial.participants;
    if (cohortFilter !== 'all') list = list.filter((p) => p.cohortId === cohortFilter);
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [selectedTrial, cohortFilter, statusFilter]);

  const enrollmentStats = useMemo(() => {
    if (!selectedTrial) return { enrolled: 0, screenFail: 0, withdrawn: 0, active: 0 };
    const all = selectedTrial.participants;
    return {
      enrolled: all.filter((p) => p.status !== 'screening' && p.status !== 'screen-fail').length,
      screenFail: all.filter((p) => p.status === 'screen-fail').length,
      withdrawn: all.filter((p) => p.status === 'withdrawn').length,
      active: all.filter((p) => p.status === 'active-treatment').length,
    };
  }, [selectedTrial]);

  const adverseEventsStats = useMemo(() => {
    if (!selectedTrial) return { total: 0, serious: 0, nonSerious: 0, resolved: 0, ongoing: 0 };
    const aes = selectedTrial.adverseEvents;
    return {
      total: aes.length,
      serious: aes.filter((e) => e.type === 'serious').length,
      nonSerious: aes.filter((e) => e.type === 'non-serious' || e.type === 'mild').length,
      resolved: aes.filter((e) => e.outcome === 'resolved').length,
      ongoing: aes.filter((e) => e.outcome === 'ongoing').length,
    };
  }, [selectedTrial]);

  const filteredAes = useMemo(() => {
    if (!selectedTrial) return [];
    if (aeFilter === 'all') return selectedTrial.adverseEvents;
    return selectedTrial.adverseEvents.filter((e) => e.type === aeFilter);
  }, [selectedTrial, aeFilter]);

  /* ────────────────────────────────────────────────────
     SUB-TAB 1: TRIAL REGISTRY
     ──────────────────────────────────────────────────── */

  const renderTrialRegistry = () => (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {trials.map((trial) => {
        const isSelected = selectedTrial?.id === trial.id;
        const pct = trial.targetEnrollment > 0
          ? Math.round((trial.currentEnrollment / trial.targetEnrollment) * 100)
          : 0;

        return (
          <motion.div key={trial.id} variants={item}>
            <Card
              className={cn(
                'cursor-pointer transition-all duration-200',
                'bg-card border-border',
                isSelected
                  ? 'border-neuro/60 bg-neuro/10 glow-neuro'
                  : 'hover:border-neuro/30 hover:bg-neuro/5',
              )}
              onClick={() => setSelectedTrial(isSelected ? null : trial)}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-semibold text-foreground truncate">
                        {trial.name}
                      </CardTitle>
                      <Badge variant="outline" className={cn('text-[10px] shrink-0', phaseColors[trial.phase])}>
                        {trial.phase}
                      </Badge>
                      <Badge variant="outline" className={cn('text-[10px] shrink-0', statusColors[trial.status])}>
                        {trial.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {trial.sponsor}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <span>{trial.sites} sites</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Indication: </span>
                    <span className="text-foreground">{trial.indication}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intervention: </span>
                    <span className="text-foreground">{trial.intervention}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PI: </span>
                    <span className="text-foreground">{trial.principalInvestigator}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Period: </span>
                    <span className="text-foreground">{trial.startDate} → {trial.endDate}</span>
                  </div>
                </div>

                {/* Enrollment progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Enrollment</span>
                    <span className="text-foreground font-medium">
                      {trial.currentEnrollment} / {trial.targetEnrollment}
                      <span className="text-muted-foreground ml-1">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-neuro"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Expanded detail */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-2 border-t border-border mt-3"
                  >
                    {/* Cohorts */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-neuro" /> Cohorts
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {trial.cohorts.map((cohort) => {
                          const cohortPct = cohort.targetSize > 0
                            ? Math.round((cohort.enrolled / cohort.targetSize) * 100)
                            : 0;
                          return (
                            <div
                              key={cohort.id}
                              className="p-3 rounded-lg border border-border bg-background/50 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground">{cohort.name}</span>
                                <Badge variant="outline" className="text-[10px] border-neuro/30 text-neuro">
                                  {cohort.arm}
                                </Badge>
                              </div>
                              <ul className="space-y-1">
                                {cohort.criteria.map((c, i) => (
                                  <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-neuro shrink-0" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-muted-foreground">Enrolled</span>
                                  <span className="text-foreground">{cohort.enrolled}/{cohort.targetSize}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-neuro/70"
                                    style={{ width: `${cohortPct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Key Endpoints */}
                    {trial.keyEndpoints.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-neuro" /> Key Endpoints
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Endpoint</th>
                                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Target</th>
                                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Current</th>
                                <th className="text-right py-2 font-medium text-muted-foreground">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {trial.keyEndpoints.map((ep, i) => (
                                <tr key={i} className="border-b border-border/50 last:border-0">
                                  <td className="py-2 pr-4 text-foreground">{ep.name}</td>
                                  <td className="py-2 pr-4 text-muted-foreground">{ep.target}</td>
                                  <td className="py-2 pr-4 text-foreground">{ep.current}</td>
                                  <td className="py-2 text-right">
                                    {ep.current !== '-' ? (
                                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> On Track
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px] border-gray-500/30 text-gray-400">
                                        <Clock className="w-3 h-3 mr-1" /> Pending
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );

  /* ────────────────────────────────────────────────────
     SUB-TAB 2: ENROLLMENT TRACKING
     ──────────────────────────────────────────────────── */

  const renderEnrollment = () => {
    if (!selectedTrial) {
      return (
        <motion.div variants={item} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-16 text-center">
          <FlaskConical className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-sm text-muted-foreground">Select a trial from the registry to view enrollment data.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-neuro/30 text-neuro hover:bg-neuro/10"
            onClick={() => setActiveSubTab('trials')}
          >
            Go to Trial Registry
          </Button>
        </motion.div>
      );
    }

    const cohorts = selectedTrial.cohorts;
    const allParticipants = selectedTrial.participants;

    const activeStatuses: EnrollmentStatus[] = [
      'screening', 'eligible', 'enrolled', 'active-treatment', 'follow-up', 'completed',
    ];

    const statCards = [
      { label: 'Total Enrolled', value: enrollmentStats.enrolled, icon: Users, color: 'text-neuro' },
      { label: 'Screen Failures', value: enrollmentStats.screenFail, icon: XCircle, color: 'text-amber-400' },
      { label: 'Withdrawals', value: enrollmentStats.withdrawn, icon: AlertTriangle, color: 'text-red-400' },
      { label: 'Active Treatment', value: enrollmentStats.active, icon: Activity, color: 'text-emerald-400' },
    ];

    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <motion.div key={s.label} variants={item}>
              <Card className="bg-card border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neuro/10 flex items-center justify-center shrink-0">
                    <s.icon className={cn('w-4.5 h-4.5', s.color)} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Cohort filter */}
        <motion.div variants={item} className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn(
              'cursor-pointer text-[11px] transition-colors',
              cohortFilter === 'all'
                ? 'bg-neuro/20 text-neuro border-neuro/40'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setCohortFilter('all')}
          >
            All
          </Badge>
          {cohorts.map((c) => (
            <Badge
              key={c.id}
              variant="outline"
              className={cn(
                'cursor-pointer text-[11px] transition-colors',
                cohortFilter === c.id
                  ? 'bg-neuro/20 text-neuro border-neuro/40'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setCohortFilter(c.id)}
            >
              {c.name}
            </Badge>
          ))}
        </motion.div>

        {/* Status filter */}
        <motion.div variants={item} className="flex flex-wrap gap-1.5">
          {(['all', ...Object.keys(enrollmentStatusColors)] as const).map((s) => (
            <Badge
              key={s}
              variant="outline"
              className={cn(
                'cursor-pointer text-[10px] transition-colors',
                statusFilter === s
                  ? 'bg-neuro/20 text-neuro border-neuro/40'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setStatusFilter(s as EnrollmentStatus | 'all')}
            >
              {s === 'all' ? 'All' : (s as string).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
          ))}
        </motion.div>

        {/* Participant table */}
        <motion.div variants={item} className="overflow-x-auto rounded-lg border border-border">
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  {['Patient', 'Name', 'Age', 'Sex', 'Cohort', 'Status', 'Enrolled', 'Site', 'Last Visit', 'MMSE Base', 'MMSE Last', 'Δ MMSE', 'AEs', 'Days'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p) => {
                  const cohortLabel = cohorts.find((c) => c.id === p.cohortId)?.name ?? p.cohortId;
                  const canWithdraw = activeStatuses.includes(p.status);
                  return (
                    <tr key={p.patientId} className="border-b border-border/50 last:border-0 hover:bg-neuro/5 transition-colors">
                      <td className="px-3 py-2 text-neuro font-mono font-medium">{p.patientId}</td>
                      <td className="px-3 py-2 text-foreground">{p.name}</td>
                      <td className="px-3 py-2 text-foreground">{p.age}</td>
                      <td className="px-3 py-2 text-muted-foreground">{p.sex}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-[10px] border-neuro/30 text-neuro truncate max-w-[100px]">
                          {cohortLabel}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={cn('text-[10px]', enrollmentStatusColors[p.status])}>
                          {p.status.replace(/-/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{p.enrolledAt}</td>
                      <td className="px-3 py-2 text-muted-foreground">{p.site}</td>
                      <td className="px-3 py-2 text-muted-foreground">{p.lastVisit}</td>
                      <td className="px-3 py-2 text-foreground">{p.mmseBaseline || '-'}</td>
                      <td className="px-3 py-2 text-foreground">{p.mmseLatest || '-'}</td>
                      <td className="px-3 py-2">
                        {p.mmseBaseline > 0 ? (
                          <span className={cn(
                            'flex items-center gap-1 font-medium',
                            p.change >= 0 ? 'text-emerald-400' : 'text-red-400',
                          )}>
                            {p.change > 0 ? <TrendingUp className="w-3 h-3" /> : p.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            {p.change > 0 ? `+${p.change}` : p.change}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {p.adverseEvents > 0 ? (
                          <span className="flex items-center gap-1 text-red-400 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            {p.adverseEvents}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{p.daysInTrial}</td>
                      <td className="px-3 py-2 text-right">
                        {canWithdraw && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              withdrawPatient(selectedTrial.id, p.patientId);
                            }}
                          >
                            Withdraw
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredParticipants.length === 0 && (
                  <tr>
                    <td colSpan={15} className="px-4 py-8 text-center text-muted-foreground text-xs">
                      No participants match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  /* ────────────────────────────────────────────────────
     SUB-TAB 3: OUTCOME MONITORING
     ──────────────────────────────────────────────────── */

  const renderOutcomes = () => {
    if (!selectedTrial) {
      return (
        <motion.div variants={item} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-sm text-muted-foreground">Select a trial from the registry to view outcomes.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-neuro/30 text-neuro hover:bg-neuro/10"
            onClick={() => setActiveSubTab('trials')}
          >
            Go to Trial Registry
          </Button>
        </motion.div>
      );
    }

    const participants = selectedTrial.participants.filter(
      (p) => p.mmseBaseline > 0 && p.status !== 'screening',
    );

    const avgChange = participants.length > 0
      ? (participants.reduce((s, p) => s + p.change, 0) / participants.length).toFixed(2)
      : '-';

    const endpointCards = selectedTrial.keyEndpoints.map((ep) => ({
      ...ep,
      numericCurrent: parseFloat(ep.current) || 0,
      numericTarget: parseFloat(ep.target) || 0,
    }));

    const summaryCards = [
      { label: 'Average MMSE Change', value: avgChange, unit: 'points', icon: TrendingDown, trend: parseFloat(avgChange) <= 0 ? 'negative' : 'positive' },
      { label: 'Average Amyloid Reduction', value: '52%', unit: 'from baseline', icon: TrendingUp, trend: 'positive' },
      { label: 'ARIA Incidence Rate', value: '12.5%', unit: 'of enrolled', icon: AlertTriangle, trend: 'warning' },
      { label: 'Overall Compliance Rate', value: '90.6%', unit: 'across checks', icon: CheckCircle2, trend: 'positive' },
    ];

    const maxAbsChange = Math.max(1, ...participants.map((p) => Math.abs(p.change)));

    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Endpoint stat cards */}
        {endpointCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {endpointCards.map((ep, i) => (
              <motion.div key={i} variants={item}>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-[11px] text-muted-foreground">{ep.name}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-foreground">{ep.current}</span>
                      <span className="text-[10px] text-muted-foreground">{ep.unit}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Target: {ep.target}</span>
                        <span className="text-emerald-400">On Track</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (ep.numericCurrent / ep.numericTarget) * 100)}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map((s) => (
            <motion.div key={s.label} variants={item}>
              <Card className="bg-card border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neuro/10 flex items-center justify-center shrink-0">
                    <s.icon className={cn(
                      'w-4 h-4',
                      s.trend === 'positive' ? 'text-emerald-400' : s.trend === 'negative' ? 'text-red-400' : 'text-amber-400',
                    )} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* MMSE Change Distribution */}
        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-neuro" />
                MMSE Change Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No data available.</p>
              ) : (
                <div className="space-y-2">
                  {participants.map((p) => {
                    const width = Math.max(8, (Math.abs(p.change) / maxAbsChange) * 100);
                    return (
                      <div key={p.patientId} className="flex items-center gap-3 text-xs">
                        <span className="w-20 text-muted-foreground font-mono shrink-0 truncate">{p.patientId}</span>
                        <span className="w-28 text-foreground truncate shrink-0">{p.name}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 h-4 bg-muted/40 rounded-sm overflow-hidden relative">
                            <motion.div
                              className={cn(
                                'h-full rounded-sm',
                                p.change >= 0 ? 'bg-emerald-500/70' : 'bg-red-500/70',
                              )}
                              initial={{ width: 0 }}
                              animate={{ width: `${width}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              style={{ marginLeft: p.change < 0 ? 'auto' : 0 }}
                            />
                          </div>
                          <span className={cn(
                            'w-10 text-right font-mono font-medium shrink-0',
                            p.change >= 0 ? 'text-emerald-400' : 'text-red-400',
                          )}>
                            {p.change > 0 ? `+${p.change}` : p.change}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  /* ────────────────────────────────────────────────────
     SUB-TAB 4: ADVERSE EVENTS
     ──────────────────────────────────────────────────── */

  const renderAdverseEvents = () => {
    if (!selectedTrial) {
      return (
        <motion.div variants={item} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-sm text-muted-foreground">Select a trial from the registry to view adverse events.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-neuro/30 text-neuro hover:bg-neuro/10"
            onClick={() => setActiveSubTab('trials')}
          >
            Go to Trial Registry
          </Button>
        </motion.div>
      );
    }

    const aeFilters = ['all', 'serious', 'non-serious', 'mild', 'moderate', 'severe'];

    const aeStatCards = [
      { label: 'Total AEs', value: adverseEventsStats.total, icon: AlertTriangle, color: 'text-foreground' },
      { label: 'Serious AEs', value: adverseEventsStats.serious, icon: XCircle, color: 'text-red-400' },
      { label: 'Non-serious', value: adverseEventsStats.nonSerious, icon: Shield, color: 'text-amber-400' },
      { label: 'Resolved', value: adverseEventsStats.resolved, icon: CheckCircle2, color: 'text-emerald-400' },
      { label: 'Ongoing', value: adverseEventsStats.ongoing, icon: Clock, color: 'text-amber-400' },
    ];

    const aeFilters = ['all', 'serious', 'non-serious', 'mild', 'moderate', 'severe'];

    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {aeStatCards.map((s) => (
            <motion.div key={s.label} variants={item}>
              <Card className="bg-card border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neuro/10 flex items-center justify-center shrink-0">
                    <s.icon className={cn('w-4 h-4', s.color)} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AE type filters */}
        <motion.div variants={item} className="flex flex-wrap gap-1.5">
          {aeFilters.map((f) => (
            <Badge
              key={f}
              variant="outline"
              className={cn(
                'cursor-pointer text-[10px] transition-colors capitalize',
                aeFilter === f
                  ? 'bg-neuro/20 text-neuro border-neuro/40'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setAeFilter(f)}
            >
              {f}
            </Badge>
          ))}
        </motion.div>

        {/* AE Table */}
        <motion.div variants={item} className="space-y-2">
          {filteredAes.map((ae) => {
            const isExpanded = expandedAe === ae.id;
            const sevColor = severityColors[Math.min(ae.severity - 1, 4)];
            return (
              <Card key={ae.id} className="bg-card border-border overflow-hidden">
                {/* Main row */}
                <div
                  className="px-3 py-2.5 cursor-pointer flex items-center gap-3 hover:bg-neuro/5 transition-colors"
                  onClick={() => setExpandedAe(isExpanded ? null : ae.id)}
                >
                  <ChevronRight className={cn('w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform', isExpanded && 'rotate-90')} />
                  <span className="text-neuro font-mono text-xs font-medium shrink-0 w-16">{ae.id}</span>
                  <span className="text-foreground text-xs shrink-0 w-28 truncate">{ae.patientName}</span>
                  <span className="text-muted-foreground text-xs shrink-0 w-20">{ae.eventDate}</span>
                  <span className="text-muted-foreground text-xs shrink-0 w-28 truncate">{ae.category}</span>
                  <Badge variant="outline" className={cn('text-[10px] shrink-0', aeTypeColors[ae.type])}>
                    {ae.type}
                  </Badge>
                  <span className="text-muted-foreground text-xs flex-1 truncate">{ae.description.slice(0, 50)}...</span>
                  <Badge variant="outline" className={cn('text-[10px] shrink-0 w-6', sevColor)}>
                    {ae.severity}
                  </Badge>
                  <Badge variant="outline" className={cn('text-[10px] shrink-0', causalityColors[ae.causality])}>
                    {ae.causality}
                  </Badge>
                  <Badge variant="outline" className={cn('text-[10px] shrink-0', outcomeColors[ae.outcome])}>
                    {ae.outcome}
                  </Badge>
                  {ae.outcome === 'ongoing' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-7 px-2 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        resolveAdverseEvent(selectedTrial.id, ae.id, 'resolved');
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-3 pb-3 pt-1 border-t border-border/50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Full Description:</span>
                        <p className="text-foreground mt-1">{ae.description}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Action Taken:</span>
                        <p className="text-foreground mt-1">{ae.action}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            );
          })}
          {filteredAes.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No adverse events match the current filter.
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  /* ────────────────────────────────────────────────────
     SUB-TAB 5: PROTOCOL COMPLIANCE
     ──────────────────────────────────────────────────── */

  const renderCompliance = () => {
    if (!selectedTrial) {
      return (
        <motion.div variants={item} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardCheck className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-sm text-muted-foreground">Select a trial from the registry to view compliance.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-neuro/30 text-neuro hover:bg-neuro/10"
            onClick={() => setActiveSubTab('trials')}
          >
            Go to Trial Registry
          </Button>
        </motion.div>
      );
    }

    const checks = selectedTrial.protocolChecks;

    const overallRate = checks.length > 0
      ? Math.round(checks.reduce((s, c) => s + c.complianceRate, 0) / checks.length)
      : 0;

    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Overall compliance score */}
        <motion.div variants={item}>
          <Card className="bg-card border-border glow-neuro">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center shrink-0"
                style={{ borderColor: overallRate >= 90 ? 'oklch(0.7 0.15 160)' : overallRate >= 70 ? 'oklch(0.8 0.15 80)' : 'oklch(0.6 0.2 25)' }}
              >
                <span className={cn('text-xl font-bold', complianceColor(overallRate))}>
                  {overallRate}%
                </span>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-semibold text-foreground">Overall Protocol Compliance</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Average across {checks.length} checkpoints
                  {checks.length > 0 && (
                    <>
                      {' · '}
                      <span className={complianceColor(overallRate)}>
                        {overallRate >= 90 ? 'Excellent' : overallRate >= 70 ? 'Needs Attention' : 'Critical'}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Individual check cards */}
        {checks.map((check) => {
          const isExpanded = expandedCompliance === check.id;
          return (
            <motion.div key={check.id} variants={item}>
              <Card
                className={cn(
                  'bg-card border-border cursor-pointer transition-all',
                  'hover:border-neuro/30 hover:bg-neuro/5',
                  check.status === 'non-compliant' && 'border-red-500/30',
                )}
                onClick={() => setExpandedCompliance(isExpanded ? null : check.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-neuro shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{check.checkpoint}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-[10px]', complianceStatusColors[check.status])}>
                        {check.status.replace('-', ' ')}
                      </Badge>
                      <ChevronRight className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Frequency</span>
                      <p className="text-foreground">{check.frequency}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Completed</span>
                      <p className="text-foreground">{check.lastCompleted}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Due</span>
                      <p className="text-foreground">{check.nextDue}</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Rate</span>
                        <span className={cn('font-medium', complianceColor(check.complianceRate))}>
                          {check.complianceRate}%
                        </span>
                      </div>
                      <Progress value={check.complianceRate} className={cn('h-1.5', complianceBarColor(check.complianceRate))} />
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-2 border-t border-border/50"
                    >
                      <p className="text-[11px] text-muted-foreground mb-2">Checkpoint Items</p>
                      <div className="space-y-1.5">
                        {check.items.map((ci, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            {ci.met ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            )}
                            <span className={cn(ci.met ? 'text-foreground' : 'text-red-400')}>
                              {ci.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {checks.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No protocol checks defined for this trial.
          </div>
        )}
      </motion.div>
    );
  };

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neuro/20 flex items-center justify-center shrink-0 glow-neuro">
            <FlaskConical className="w-5 h-5 text-neuro" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Clinical Trial Management</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Monitor, enroll, and manage clinical trials</p>
          </div>
        </div>
        <Badge variant="outline" className="border-neuro/40 text-neuro bg-neuro/10 px-3 py-1 text-xs font-medium self-start">
          {trials.length} Trial{trials.length !== 1 ? 's' : ''}
        </Badge>
      </motion.div>

      {/* Sub-tabs */}
      <motion.div variants={item} className="flex flex-wrap gap-1.5 border-b border-border pb-2">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                isActive
                  ? 'bg-neuro/15 text-neuro'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
              onClick={() => setActiveSubTab(tab.key)}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Content */}
      {activeSubTab === 'trials' && renderTrialRegistry()}
      {activeSubTab === 'enrollment' && renderEnrollment()}
      {activeSubTab === 'outcomes' && renderOutcomes()}
      {activeSubTab === 'adverse-events' && renderAdverseEvents()}
      {activeSubTab === 'compliance' && renderCompliance()}
    </motion.div>
  );
}
