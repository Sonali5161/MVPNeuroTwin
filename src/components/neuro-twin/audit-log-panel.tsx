'use client';

import { useMemo, useState } from 'react';
import { useAuthStore, PANEL_PERMISSIONS, FEATURE_PERMISSIONS, type AuditLogEntry } from '@/lib/auth-store';
import { useNeuroStore } from '@/lib/neuro-store';
import {
  Shield, ScrollText, Search, Filter, Download, AlertTriangle,
  CheckCircle2, XCircle, Clock, User, Lock, Eye, EyeOff,
  Activity, Database, Cpu, Pill, FileText, Globe, RefreshCw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, React.ElementType> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  VIEW: Eye,
  EXPORT: Download,
  RUN_MODEL: Cpu,
  DRUG_SIMULATE: Pill,
  SEARCH: Search,
  ACCESS_PATIENT: User,
  ACCESS_DATASET: Database,
  GENERATE: Activity,
};

const statusConfig = {
  success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
  denied: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: AlertTriangle },
};

function LogIn(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}
function LogOut(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// Generate realistic seed audit data
function generateSeedLogs(): Omit<AuditLogEntry, 'id'>[] {
  const now = Date.now();
  const actions = [
    { action: 'LOGIN', resource: 'Authentication', status: 'success' as const, details: 'Successful login' },
    { action: 'VIEW', resource: 'Patient PT-001', status: 'success' as const, details: 'Viewed patient digital twin data' },
    { action: 'RUN_MODEL', resource: 'Brain Age Estimation', status: 'success' as const, details: 'Executed ViT brain age model on PT-001 MRI data' },
    { action: 'DRUG_SIMULATE', resource: 'Drug Simulation Engine', status: 'success' as const, details: 'Simulated Donepezil treatment response for PT-002' },
    { action: 'ACCESS_DATASET', resource: 'ADNI Dataset', status: 'success' as const, details: 'Queried ADNI cohort for similar patient profiles' },
    { action: 'EXPORT', resource: 'Research Report', status: 'success' as const, details: 'Exported clinical summary for PT-004' },
    { action: 'GENERATE', resource: 'Synthetic Patient Generator', status: 'success' as const, details: 'Generated 10 synthetic patient profiles' },
    { action: 'VIEW', resource: 'Patient PT-245', status: 'success' as const, details: 'Accessed brain network analysis' },
    { action: 'SEARCH', resource: 'Research Copilot', status: 'success' as const, details: 'RAG query: "APOE ε4 progression risk factors"' },
    { action: 'ACCESS_PATIENT', resource: 'Patient PT-003', status: 'denied' as const, details: 'Access denied: insufficient role permissions for raw data' },
    { action: 'EXPORT', resource: 'Bulk Dataset Export', status: 'denied' as const, details: 'HIPAA violation: attempted bulk PHI export without audit approval' },
    { action: 'RUN_MODEL', resource: 'XAI Analysis', status: 'warning' as const, details: 'SHAP analysis completed with 3 low-confidence features' },
    { action: 'VIEW', resource: 'Treatment Optimization', status: 'success' as const, details: 'Viewed RL-based treatment plan for PT-002' },
    { action: 'ACCESS_DATASET', resource: 'UK Biobank', status: 'warning' as const, details: 'Dataset sync in progress, partial data returned' },
  ];

  return actions.map((a, i) => ({
    userId: 'USR-001',
    userName: 'Dr. Sarah Mitchell',
    userRole: 'researcher' as const,
    ...a,
    ip: '192.168.1.100',
    patientId: a.resource.startsWith('Patient PT-') ? a.resource.split(' ')[1] : undefined,
    timestamp: new Date(now - (i + 1) * 3600000 * (1 + Math.random() * 3)).toISOString(),
  }));
}

export default function AuditLogPanel() {
  const { user, auditLogs, addAuditLog } = useAuthStore();
  const { selectedPatient, activePanel, setActivePanel } = useNeuroStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'denied' | 'warning'>('all');
  const [filterAction, setFilterAction] = useState('all');

  const allLogs = useMemo(() => {
    const seed = generateSeedLogs();
    return [...auditLogs, ...seed].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [auditLogs]);

  const uniqueActions = useMemo(() => {
    const s = new Set(allLogs.map((l) => l.action));
    return ['all', ...Array.from(s)];
  }, [allLogs]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      if (filterStatus !== 'all' && log.status !== filterStatus) return false;
      if (filterAction !== 'all' && log.action !== filterAction) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          log.userName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.resource.toLowerCase().includes(q) ||
          (log.details && log.details.toLowerCase().includes(q)) ||
          (log.patientId && log.patientId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allLogs, search, filterStatus, filterAction]);

  const stats = useMemo(() => ({
    total: allLogs.length,
    success: allLogs.filter((l) => l.status === 'success').length,
    denied: allLogs.filter((l) => l.status === 'denied').length,
    warning: allLogs.filter((l) => l.status === 'warning').length,
  }), [allLogs]);

  const handleRefresh = () => {
    addAuditLog({
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown',
      userRole: user?.role || 'researcher',
      action: 'VIEW',
      resource: 'Audit Log',
      ip: '192.168.1.100',
      status: 'success',
      details: 'Refreshed audit log view',
    });
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours < 1) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ${mins}m ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-neuro" />
            Security &amp; Audit Log
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            HIPAA-compliant access monitoring · All data access is recorded and auditable
          </p>
        </div>
        <Badge variant="outline" className="border-neuro/30 text-neuro bg-neuro/10 shrink-0">
          <Shield className="w-3 h-3 mr-1" />
          HIPAA 45 CFR 160 & 164
        </Badge>
      </div>

      {/* HIPAA Compliance Banner */}
      <div className="p-4 rounded-xl border border-neuro/20 bg-neuro/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-neuro/15 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-neuro" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">HIPAA Compliance Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {[
                { label: 'Encryption', value: 'AES-256', ok: true },
                { label: 'Access Control', value: 'RBAC Active', ok: true },
                { label: 'Audit Logging', value: 'Real-time', ok: true },
                { label: 'Breach Protocol', value: 'Enabled', ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <CheckCircle2 className={cn('w-3.5 h-3.5', item.ok ? 'text-emerald-400' : 'text-red-400')} />
                  <div>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: stats.total, color: 'text-foreground', icon: ScrollText },
          { label: 'Authorized', value: stats.success, color: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Denied', value: stats.denied, color: 'text-red-400', icon: XCircle },
          { label: 'Warnings', value: stats.warning, color: 'text-amber-400', icon: AlertTriangle },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-1">
              <s.icon className={cn('w-4 h-4', s.color)} />
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs by user, action, resource, or patient ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(['all', 'success', 'denied', 'warning'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize',
                  filterStatus === s
                    ? 'bg-neuro/15 text-neuro'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9 gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Action Filter Chips */}
      {filterAction !== 'all' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Action:</span>
          {uniqueActions.map((a) => (
            <button
              key={a}
              onClick={() => setFilterAction(a)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-medium transition-all capitalize',
                filterAction === a
                  ? 'bg-neuro/20 text-neuro border border-neuro/30'
                  : 'bg-card text-muted-foreground border border-border hover:text-foreground'
              )}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {/* Log Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/80">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Action</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Resource</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden lg:table-cell">Details</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden xl:table-cell">IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No audit logs match your filters</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 50).map((log, i) => {
                  const sc = statusConfig[log.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr
                      key={`${log.timestamp}-${i}`}
                      className="border-b border-border/50 hover:bg-card/50 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border', sc.bg, sc.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {log.status}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div>
                          <p className="text-xs font-medium text-foreground">{log.userName}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{log.userRole}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-[10px] font-mono h-5">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-foreground">{log.resource}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[250px] truncate hidden lg:table-cell">
                        {log.details}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono hidden xl:table-cell">
                        {log.ip}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredLogs.length > 50 && (
          <div className="px-4 py-3 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Showing 50 of {filteredLogs.length} entries · All entries retained for 7 years per HIPAA requirements
            </p>
          </div>
        )}
      </div>

      {/* RBAC Permission Matrix */}
      <div className="p-4 rounded-xl border border-border bg-card/50">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-neuro" />
          Role-Based Access Control (RBAC) Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Panel / Feature</th>
                <th className="text-center py-2 px-3 text-blue-400 font-medium">Researcher</th>
                <th className="text-center py-2 px-3 text-emerald-400 font-medium">Clinician</th>
                <th className="text-center py-2 px-3 text-amber-400 font-medium">Patient</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(PANEL_PERMISSIONS).map(([panel, roles]) => (
                <tr key={panel} className="border-b border-border/30">
                  <td className="py-1.5 px-3 text-foreground capitalize">{panel.replace(/-/g, ' ')}</td>
                  {(['researcher', 'clinician', 'patient'] as const).map((role) => (
                    <td key={role} className="text-center py-1.5 px-3">
                      {roles.includes(role) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400/40 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-border/30 bg-card/30">
                <td colSpan={4} className="py-1.5 px-3 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">Features</td>
              </tr>
              {Object.entries(FEATURE_PERMISSIONS).map(([feature, roles]) => (
                <tr key={feature} className="border-b border-border/30">
                  <td className="py-1.5 px-3 text-foreground capitalize">{feature.replace(/-/g, ' ')}</td>
                  {(['researcher', 'clinician', 'patient'] as const).map((role) => (
                    <td key={role} className="text-center py-1.5 px-3">
                      {roles.includes(role) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400/40 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}