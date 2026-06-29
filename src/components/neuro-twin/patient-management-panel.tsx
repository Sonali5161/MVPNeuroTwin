    'use client';

    import { useState, useMemo } from 'react';
    import { usePatientMgmtStore, type OnboardingStep, type ConsentStatus, type PatientRecord } from '@/lib/patient-mgmt-store';
    import { useAuthStore } from '@/lib/auth-store';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Progress } from '@/components/ui/progress';
    import { Checkbox } from '@/components/ui/checkbox';
    import { cn } from '@/lib/utils';
    import {
      Users, UserPlus, FileUp, ShieldCheck, Heart, GitCompareArrows, ChevronRight,
      Upload, CheckCircle2, XCircle, Clock, AlertTriangle, Search, Filter, Eye,
      Lock, Unlock, Trash2, ArrowRight, ClipboardCheck, FolderOpen, FileText, Brain, Activity,
    } from 'lucide-react';

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
    const it = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    const steps: { key: OnboardingStep; label: string; icon: React.ElementType }[] = [
      { key: 'demographics', label: 'Demographics', icon: Users },
      { key: 'medical-history', label: 'Medical History', icon: FileText },
      { key: 'data-upload', label: 'Data Upload', icon: Upload },
      { key: 'consent', label: 'Consent', icon: ShieldCheck },
      { key: 'review', label: 'Review', icon: ClipboardCheck },
      { key: 'completed', label: 'Complete', icon: CheckCircle2 },
    ];

    const statusCfg: Record<string, { color: string; bg: string }> = {
      active: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
      onboarding: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
      inactive: { color: 'text-muted-foreground', bg: 'bg-muted/10 border-border' },
      discharged: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
      deceased: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    };

    const consentCfg: Record<ConsentStatus, { color: string; bg: string; icon: React.ElementType }> = {
      signed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
      pending: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: Clock },
      expired: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: AlertTriangle },
      revoked: { color: 'text-muted-foreground', bg: 'bg-muted/10 border-border', icon: XCircle },
    };

    const uploadTypeCfg: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
      DICOM: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: FolderOpen },
      CSV: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: FileText },
      JSON: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: FileText },
      PDF: { color: 'text-red-400', bg: 'bg-red-500/10', icon: FileText },
      NIfTI: { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Brain },
    };

    const relationshipLabels: Record<string, string> = { spouse: 'Spouse', child: 'Child', sibling: 'Sibling', caregiver: 'Caregiver', 'legal-guardian': 'Legal Guardian', other: 'Other' };
    const accessLabels: Record<string, { label: string; color: string }> = {
      full: { label: 'Full Access', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
      limited: { label: 'Limited', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
      'view-only': { label: 'View Only', color: 'text-muted-foreground bg-muted/10 border-border' },
    };

    type SubTab = 'patients' | 'onboarding' | 'consent' | 'family-portal' | 'comparison';

    export default function PatientManagementPanel() {
      const {
        patients, selectedPatientRecord, setSelectedPatientRecord,
        onboardingState, setOnboardingStep, updateDemographics, updateMedicalHistory,
        submitOnboarding, addUploadedFile, updateConsent,
        addFamilyMember, removeFamilyMember, updateFamilyAccess,
        comparisonIds, toggleComparison, clearComparison,
        filterStatus, setFilterStatus, activeSubTab, setActiveSubTab,
      } = usePatientMgmtStore();
      const { user } = useAuthStore();
      const [search, setSearch] = useState('');
      const [consentFilter, setConsentFilter] = useState<'all' | ConsentStatus>('all');
      const [simUploading, setSimUploading] = useState(false);

      const filteredPatients = useMemo(() => {
        let list = patients;
        if (filterStatus !== 'all') list = list.filter((p) => p.status === filterStatus);
        if (search) {
          const q = search.toLowerCase();
          list = list.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q));
        }
        return list;
      }, [patients, filterStatus, search]);

      const stats = useMemo(() => ({
        total: patients.length, active: patients.filter((p) => p.status === 'active').length,
        onboarding: patients.filter((p) => p.status === 'onboarding').length,
        avgCompleteness: Math.round(patients.reduce((s, p) => s + p.dataCompleteness, 0) / patients.length),
      }), [patients]);

      const consentStats = useMemo(() => {
        const all = patients.flatMap((p) => p.consents);
        return { total: all.length, signed: all.filter((c) => c.status === 'signed').length, pending: all.filter((c) => c.status === 'pending').length, expired: all.filter((c) => c.status === 'expired').length };
      }, [patients]);

      const stepIdx = steps.findIndex((s) => s.key === onboardingState.currentStep);
      const canProceed = () => {
        const { currentStep, demographics, medicalHistory } = onboardingState;
        if (currentStep === 'demographics') return demographics.firstName && demographics.lastName;
        if (currentStep === 'medical-history') return medicalHistory.primaryDiagnosis;
        return true;
      };

      const handleSimUpload = () => {
        setSimUploading(true);
        const file: import('@/lib/patient-mgmt-store').UploadedFile = {
          id: `UF-${Date.now()}`, name: `scan_${new Date().toISOString().split('T')[0]}.nii.gz`, type: 'NIfTI',
          size: `${(150 + Math.random() * 80).toFixed(1)} MB`, status: 'uploading',
          uploadedAt: new Date().toISOString(), modality: 'MRI', records: 1,
        };
        setTimeout(() => {
          addUploadedFile({ ...file, status: 'completed' });
          setSimUploading(false);
        }, 1500);
      };

      const handleAddFamily = () => {
        const member: import('@/lib/patient-mgmt-store').FamilyMember = {
          id: `FM-${Date.now()}`, name: 'New Family Member', relationship: 'caregiver',
          email: 'caregiver@email.com', phone: '+1-555-0000', accessLevel: 'view-only',
          hasConsent: true, notifications: 'weekly',
        };
        if (selectedPatientRecord) addFamilyMember(selectedPatientRecord.id, member);
      };

      const tabs: { id: SubTab; label: string; icon: React.ElementType }[] = [
        { id: 'patients', label: 'Patient Registry', icon: Users },
        { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
        { id: 'consent', label: 'Consent', icon: ShieldCheck },
        { id: 'family-portal', label: 'Family Portal', icon: Heart },
        { id: 'comparison', label: 'Comparison', icon: GitCompareArrows },
      ];

      return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
          {/* Header */}
          <motion.div variants={it} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2"><Users className="w-6 h-6 text-neuro" />Patient Management System</h2>
              <p className="text-sm text-muted-foreground mt-1">Onboarding, medical records, consent, family access, and multi-patient comparison</p>
            </div>
          </motion.div>

          {/* Sub-tabs */}
          <motion.div variants={it} className="flex gap-1 bg-card rounded-lg p-1 border border-border w-fit overflow-x-auto">
            {tabs.map((t) => { const Icon = t.icon; return (
              <button key={t.id} onClick={() => setActiveSubTab(t.id)} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap', activeSubTab === t.id ? 'bg-neuro/15 text-neuro' : 'text-muted-foreground hover:text-foreground')}>
                <Icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t.label}</span>
              </button>);
            })}
          </motion.div>

          <AnimatePresence mode="wait">
          {/* ============ PATIENT REGISTRY ============ */}
          {activeSubTab === 'patients' && (
            <motion.div key="patients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { l: 'Total Patients', v: stats.total, color: 'text-foreground' },
                  { l: 'Active', v: stats.active, color: 'text-emerald-400' },
                  { l: 'Onboarding', v: stats.onboarding, color: 'text-blue-400' },
                  { l: 'Avg Data Completeness', v: `${stats.avgCompleteness}%`, color: 'text-neuro' },
                ].map((s) => (
                  <Card key={s.l} className="bg-card border-border"><CardContent className="p-3"><p className={cn('text-xl font-bold', s.color)}>{s.v}</p><p className="text-[10px] text-muted-foreground">{s.l}</p></CardContent></Card>
                ))}
              </div>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border h-9" />
                </div>
                <div className="flex gap-1">
                  {(['all', 'active', 'onboarding', 'discharged'] as const).map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={cn('px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all', filterStatus === s ? 'bg-neuro/15 text-neuro' : 'text-muted-foreground hover:text-foreground hover:bg-card')}>{s}</button>
                  ))}
                </div>
              </div>
              {/* Patient Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filteredPatients.map((p) => {
                  const sc = statusCfg[p.status];
                  const isSel = selectedPatientRecord?.id === p.id;
                  return (
                    <Card key={p.id} className={cn('bg-card border transition-all cursor-pointer', isSel ? 'border-neuro/50 glow-neuro' : 'border-border hover:border-neuro/20')} onClick={() => setSelectedPatientRecord(isSel ? null : p)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div><h4 className="text-sm font-semibold text-foreground">{p.name}</h4><p className="text-[10px] text-muted-foreground">{p.id} · {p.sex} · Age {p.age}</p></div>
                          <Badge variant="outline" className={cn('text-[9px] h-4 capitalize', sc.bg, sc.color)}>{p.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{p.diagnosis} · <span className="text-foreground font-medium">{p.stage}</span></p>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          {[
                            { l: 'MMSE', v: p.mmse || '-' },
                            { l: 'CDR', v: p.cdr || '-' },
                            { l: 'Risk', v: p.riskScore ? `${(p.riskScore * 100).toFixed(0)}%` : '-' },
                            { l: 'Clinician', v: p.primaryClinician.split(' ').slice(-1)[0] },
                          ].map((x) => <div key={x.l}><p className="text-[9px] text-muted-foreground">{x.l}</p><p className="text-xs font-medium text-foreground">{x.v}</p></div>)}
                        </div>
                        <div className="flex items-center gap-2"><span className="text-[9px] text-muted-foreground">Data Completeness</span><Progress value={p.dataCompleteness} className="flex-1 h-1.5" /><span className="text-[10px] font-medium text-foreground">{p.dataCompleteness}%</span></div>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                          <span>Next: {p.nextAppointment}</span>
                          <span>{p.uploadedFiles.length} files · {p.consents.filter((c)=>c.status==='signed').length} consents</span>
                        </div>
                        <AnimatePresence>
                          {isSel && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="mt-3 pt-3 border-t border-border space-y-3">
                                <div><p className="text-[10px] text-muted-foreground mb-1">Uploaded Files</p>{p.uploadedFiles.length > 0 ? <div className="flex flex-wrap gap-1">{p.uploadedFiles.map((f) => { const uc = uploadTypeCfg[f.type] || uploadTypeCfg.CSV; return <Badge key={f.id} variant="outline" className={cn('text-[9px] h-4', uc.bg, uc.color)}>{f.type}</Badge>; })}</div> : <p className="text-[10px] text-muted-foreground">No files uploaded</p>}</div>
                                <div><p className="text-[10px] text-muted-foreground mb-1">Consent Status</p><div className="flex flex-wrap gap-1">{p.consents.map((c) => { const cc = consentCfg[c.status]; return <Badge key={c.id} variant="outline" className={cn('text-[9px] h-4', cc.bg, cc.color)}>{c.type}</Badge>; })}</div></div>
                                {p.familyMembers.length > 0 && <div><p className="text-[10px] text-muted-foreground mb-1">Family Access</p><div className="flex flex-wrap gap-1">{p.familyMembers.map((fm) => <Badge key={fm.id} variant="outline" className="text-[9px] h-4 border-border">{fm.name.split(' ')[0]} ({fm.relationship})</Badge>)}</div></div>}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ============ ONBOARDING ============ */}
          {activeSubTab === 'onboarding' && (
            <motion.div key="onboarding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {onboardingState.currentStep !== 'completed' ? (<>
                {/* Step Indicator */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {steps.slice(0, 5).map((s, i) => { const Icon = s.icon; const isDone = i < stepIdx; const isCurrent = i === stepIdx; return (
                    <div key={s.key} className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => i <= stepIdx && setOnboardingStep(s.key)} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border', isCurrent ? 'border-neuro/50 bg-neuro/15 text-neuro' : isDone ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-border bg-card text-muted-foreground cursor-not-allowed')}>
                        <Icon className="w-3.5 h-3.5" />{s.label}
                        {isDone && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      {i < 4 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                    </div>);
                  })}
                </div>
                <Card className="bg-card border-border"><CardContent className="p-5">
                  {/* Step 1: Demographics */}
                  {onboardingState.currentStep === 'demographics' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Patient Demographics</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[{ l: 'First Name', k: 'firstName', t: 'text' }, { l: 'Last Name', k: 'lastName', t: 'text' }, { l: 'Date of Birth', k: 'dateOfBirth', t: 'date' }, { l: 'Sex', k: 'sex', t: 'select' }, { l: 'Phone', k: 'phone', t: 'tel' }, { l: 'Emergency Contact', k: 'emergencyContact', t: 'text' }].map((f) => (
                          <div key={f.k} className="space-y-1"><Label className="text-xs">{f.l}</Label>
                            {f.t === 'select' ? (
                              <select value={(onboardingState.demographics as any)[f.k]} onChange={(e) => updateDemographics({ [f.k]: e.target.value })} className="w-full h-9 bg-background border border-border rounded-md px-3 text-sm text-foreground">
                                <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                              </select>
                            ) : (
                              <Input type={f.t} value={(onboardingState.demographics as any)[f.k]} onChange={(e) => updateDemographics({ [f.k]: e.target.value })} className="bg-background border-border h-9" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Step 2: Medical History */}
                  {onboardingState.currentStep === 'medical-history' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Medical History</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { l: 'Primary Diagnosis', k: 'primaryDiagnosis' },
                          { l: 'Diagnosis Date', k: 'diagnosisDate', t: 'date' },
                          { l: 'Disease Stage', k: 'stage', t: 'select' },
                        ].map((f) => (
                          <div key={f.k} className="space-y-1"><Label className="text-xs">{f.l}</Label>
                            {f.t === 'select' ? (
                              <select value={(onboardingState.medicalHistory as any)[f.k]} onChange={(e) => updateMedicalHistory({ [f.k]: e.target.value })} className="w-full h-9 bg-background border border-border rounded-md px-3 text-sm text-foreground">
                                <option value="">Select...</option><option>Normal</option><option>MCI</option><option>Mild AD</option><option>Moderate AD</option><option>Moderate-Severe AD</option><option>Severe AD</option>
                              </select>
                            ) : (
                              <Input type={f.t || 'text'} value={(onboardingState.medicalHistory as any)[f.k]} onChange={(e) => updateMedicalHistory({ [f.k]: e.target.value })} className="bg-background border-border h-9" />
                            )}
                          </div>
                        ))}
                        <div className="space-y-1 sm:col-span-2"><Label className="text-xs">Family History of Dementia</Label><textarea value={onboardingState.medicalHistory.familyHistory} onChange={(e) => updateMedicalHistory({ familyHistory: e.target.value })} rows={2} className="w-full bg-background border border-border rounded-md p-2 text-sm text-foreground resize-none" /></div>
                      </div>
                    </div>
                  )}
                  {/* Step 3: Data Upload */}
                  {onboardingState.currentStep === 'data-upload' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Medical Data Upload</h3>
                      <p className="text-xs text-muted-foreground">Upload MRI scans (DICOM/NIfTI), genetic reports (JSON), lab results (CSV), and clinical documents (PDF).</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['DICOM', 'CSV', 'JSON', 'PDF', 'NIfTI'].map((type) => { const cfg = uploadTypeCfg[type]; const Icon = cfg.icon; return (
                          <button key={type} onClick={handleSimUpload} disabled={simUploading} className={cn('flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all hover:border-neuro/50', cfg.bg)}>
                            <Icon className={cn('w-8 h-8', cfg.color)} /><span className={cn('text-xs font-medium', cfg.color)}>{type}</span><span className="text-[9px] text-muted-foreground">Click to upload</span>
                          </button>
                        ); })}
                      </div>
                      {simUploading && <div className="flex items-center gap-2 text-xs text-neuro"><div className="w-3 h-3 border-2 border-neuro/30 border-t-neuro rounded-full animate-spin" />Uploading and processing...</div>}
                    </div>
                  )}
                  {/* Step 4: Consent */}
                  {onboardingState.currentStep === 'consent' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Patient Consent</h3>
                      <p className="text-xs text-muted-foreground">Review and sign each consent document to proceed.</p>
                      {[{ type: 'research' as const, title: 'Research Participation', desc: 'Consent to participate in NeuroTwin AI research studies and have de-identified data used for model training.' }, { type: 'data-sharing' as const, title: 'Data Sharing Agreement', desc: 'Authorization for sharing de-identified multi-modal data with approved research partners under HIPAA guidelines.' }, { type: 'treatment' as const, title: 'AI-Assisted Treatment', desc: 'Consent for AI-driven treatment recommendations and digital twin-based therapy optimization.' }, { type: 'clinical-trial' as const, title: 'Clinical Trial Enrollment', desc: 'Consent for potential enrollment in interventional clinical trials matched by the AI system.' }].map((c) => (
                        <Card key={c.type} className="bg-background border border-border"><CardContent className="p-3"><div className="flex items-start gap-3"><Checkbox className="mt-0.5" /><div><h4 className="text-xs font-semibold text-foreground">{c.title}</h4><p className="text-[10px] text-muted-foreground mt-0.5">{c.desc}</p></div></div></CardContent></Card>
                      ))}
                    </div>
                  )}
                  {/* Step 5: Review */}
                  {onboardingState.currentStep === 'review' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Review & Submit</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[['Name', `${onboardingState.demographics.firstName} ${onboardingState.demographics.lastName}`], ['Date of Birth', onboardingState.demographics.dateOfBirth], ['Sex', onboardingState.demographics.sex], ['Phone', onboardingState.demographics.phone], ['Diagnosis', onboardingState.medicalHistory.primaryDiagnosis], ['Stage', onboardingState.medicalHistory.stage], ['Family History', onboardingState.medicalHistory.familyHistory || 'N/A'], ['Emergency Contact', onboardingState.demographics.emergencyContact || 'N/A']].map(([l, v]) => (
                          <div key={l as string}><p className="text-[9px] text-muted-foreground">{l}</p><p className="text-xs font-medium text-foreground">{v || '-'}</p></div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Navigation */}
                  <div className="flex justify-between pt-3 border-t border-border">
                    <Button variant="outline" onClick={() => stepIdx > 0 && setOnboardingStep(steps[stepIdx - 1].key)} disabled={stepIdx === 0} className="text-xs">Previous</Button>
                    {onboardingState.currentStep === 'review' ? (
                      <Button onClick={submitOnboarding} disabled={onboardingState.isSubmitting} className="text-xs gap-1.5 bg-neuro hover:bg-neuro-bright text-primary-foreground">
                        {onboardingState.isSubmitting ? <><div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Submitting...</> : <><CheckCircle2 className="w-3 h-3" />Submit Onboarding</>}
                      </Button>
                    ) : (
                      <Button onClick={() => stepIdx < 4 && setOnboardingStep(steps[stepIdx + 1].key)} disabled={!canProceed()} className="text-xs gap-1.5">Next <ArrowRight className="w-3 h-3" /></Button>
                    )}
                  </div>
                </CardContent></Card>
              </>) : (
                <Card className="bg-card border-border"><CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto"><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div>
                  <h3 className="text-lg font-bold text-foreground">Patient Onboarded Successfully</h3>
                  <p className="text-sm text-muted-foreground">The patient record has been created and is now active in the system.</p>
                  <Button onClick={() => { setOnboardingStep('demographics'); usePatientMgmtStore.setState((s) => ({ onboardingState: { ...s.onboardingState, demographics: { firstName: '', lastName: '', dateOfBirth: '', sex: '', ethnicity: '', education: '', phone: '', emergencyContact: '' }, medicalHistory: { primaryDiagnosis: '', diagnosisDate: '', stage: '', comorbidities: [], currentMedications: [], pastTreatments: [], familyHistory: '', allergies: [] }, isSubmitting: false, currentStep: 'demographics' } })); }} className="text-xs gap-1.5"><UserPlus className="w-3 h-3" />Onboard New Patient</Button>
                </CardContent></Card>
              )}
            </motion.div>
          )}

          {/* ============ CONSENT MANAGEMENT ============ */}
          {activeSubTab === 'consent' && (
            <motion.div key="consent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[{ l: 'Total Consents', v: consentStats.total, c: 'text-foreground' }, { l: 'Signed', v: consentStats.signed, c: 'text-emerald-400' }, { l: 'Pending', v: consentStats.pending, c: 'text-amber-400' }, { l: 'Expired', v: consentStats.expired, c: 'text-red-400' }].map((s) => (
                  <Card key={s.l} className="bg-card border-border"><CardContent className="p-3"><p className={cn('text-xl font-bold', s.c)}>{s.v}</p><p className="text-[10px] text-muted-foreground">{s.l}</p></CardContent></Card>
                ))}
              </div>
              <div className="flex gap-1">
                {(['all', 'signed', 'pending', 'expired'] as const).map((s) => (
                  <button key={s} onClick={() => setConsentFilter(s)} className={cn('px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all', consentFilter === s ? 'bg-neuro/15 text-neuro' : 'text-muted-foreground hover:text-foreground hover:bg-card')}>{s}</button>
                ))}
              </div>
              <div className="space-y-2">
                {patients.filter((p) => p.consents.length > 0).map((p) => {
                  const consents = consentFilter === 'all' ? p.consents : p.consents.filter((c) => c.status === consentFilter);
                  return (
                    <Card key={p.id} className="bg-card border-border"><CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2"><h4 className="text-xs font-semibold text-foreground">{p.name} <span className="text-muted-foreground font-normal">{p.id}</span></h4><Badge variant="outline" className={cn('text-[9px] h-4', statusCfg[p.status].bg, statusCfg[p.status].color)}>{p.status}</Badge></div>
                      <div className="flex flex-wrap gap-1.5">{consents.map((c) => { const cc = consentCfg[c.status]; const Icon = cc.icon; return (
                        <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border">
                          <Icon className={cn('w-3 h-3', cc.color)} /><div><p className="text-[10px] font-medium text-foreground">{c.type.replace(/-/g, ' ')}</p><p className="text-[9px] text-muted-foreground">{c.documentName} · {c.version}</p></div>
                          <Badge variant="outline" className={cn('text-[9px] h-4 ml-2', cc.bg, cc.color)}>{c.status}</Badge>
                          {c.status === 'expired' && <Button size="sm" variant="outline" className="h-5 text-[9px] ml-1" onClick={() => updateConsent(p.id, c.id, 'pending')}>Re-consent</Button>}
                        </div>); })}</div>
                    </CardContent></Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ============ FAMILY PORTAL ============ */}
          {activeSubTab === 'family-portal' && (
            <motion.div key="family-portal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <Card className="bg-neuro/5 border-neuro/20"><CardContent className="p-3"><div className="flex items-center gap-2"><Heart className="w-4 h-4 text-neuro" /><div><p className="text-xs font-semibold text-foreground">Family & Caregiver Access Portal</p><p className="text-[10px] text-muted-foreground">Authorized family members can view patient progress, receive notifications, and access care plans based on their access level.</p></div></div></CardContent></Card>
              {patients.filter((p) => p.familyMembers.length > 0).map((p) => (
                <Card key={p.id} className="bg-card border-border"><CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-xs font-semibold">{p.name} <span className="text-muted-foreground font-normal">{p.id}</span></CardTitle></CardHeader><CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {p.familyMembers.map((fm) => { const al = accessLabels[fm.accessLevel]; return (
                      <div key={fm.id} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-neuro/15 flex items-center justify-center text-neuro text-xs font-bold">{fm.name.split(' ').map(n=>n[0]).join('')}</div><div><p className="text-xs font-medium text-foreground">{fm.name}</p><p className="text-[9px] text-muted-foreground">{relationshipLabels[fm.relationship]} · {fm.email} · {fm.phone}</p><p className="text-[9px] text-muted-foreground">Notifications: {fm.notifications} · Last login: {fm.lastLogin ? new Date(fm.lastLogin).toLocaleDateString() : 'Never'}</p></div></div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn('text-[9px] h-4', al.color)}>{al.label}</Badge>
                          <Button size="sm" variant="outline" className="h-6 text-[9px]" onClick={() => { const levels = ['view-only', 'limited', 'full'] as const; const next = levels[(levels.indexOf(fm.accessLevel) + 1) % 3]; updateFamilyAccess(p.id, fm.id, next); }}>{fm.accessLevel === 'full' ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}</Button>
                          <Button size="sm" variant="ghost" className="h-6 text-[9px] text-destructive hover:text-destructive" onClick={() => removeFamilyMember(p.id, fm.id)}><Trash2 className="w-2.5 h-2.5" /></Button>
                        </div>
                      </div>);
                    })}
                    <Button variant="outline" size="sm" onClick={handleAddFamily} className="w-full h-8 text-xs gap-1.5 border-dashed"><UserPlus className="w-3 h-3" />Add Family Member</Button>
                  </div>
                </CardContent></Card>
              ))}
            </motion.div>
          )}

          {/* ============ COMPARISON ============ */}
          {activeSubTab === 'comparison' && (
            <motion.div key="comparison" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">Select up to 5 patients for side-by-side comparison ({comparisonIds.length}/5 selected)</p>{comparisonIds.length > 0 && <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={clearComparison}>Clear Selection</Button>}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {patients.filter((p) => p.status === 'active' || p.status === 'onboarding').map((p) => {
                  const isComp = comparisonIds.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => toggleComparison(p.id)} disabled={!isComp && comparisonIds.length >= 5} className={cn('p-2.5 rounded-lg border text-left transition-all', isComp ? 'border-neuro/50 bg-neuro/10' : 'border-border hover:border-neuro/20 disabled:opacity-40')}>
                      <div className="flex items-center gap-2"><Checkbox checked={isComp} className="pointer-events-none" /><div><p className="text-[11px] font-medium text-foreground truncate">{p.name}</p><p className="text-[9px] text-muted-foreground">{p.id} · {p.stage}</p></div></div>
                    </button>
                  );
                })}
              </div>
              {comparisonIds.length >= 2 && (
                <Card className="bg-card border-border overflow-hidden"><CardContent className="p-0">
                  <div className="overflow-x-auto"><table className="w-full text-xs">
                    <thead><tr className="border-b border-border bg-card/80"><th className="text-left px-3 py-2 text-[10px] text-muted-foreground font-medium">Metric</th>{comparisonIds.map((id) => { const p = patients.find((x) => x.id === id); return <th key={id} className="text-center px-3 py-2 text-[10px] font-medium text-foreground whitespace-nowrap">{p?.name?.split(' ')[0]}<br /><span className="text-muted-foreground font-normal">{id}</span></th>; })}</tr></thead>
                    <tbody>
                      {([['Age', (p: PatientRecord) => p.age], ['Sex', (p: PatientRecord) => p.sex], ['Diagnosis', (p: PatientRecord) => p.diagnosis], ['Stage', (p: PatientRecord) => p.stage], ['MMSE', (p: PatientRecord) => <span className={cn(p.mmse >= 24 ? 'text-emerald-400' : p.mmse >= 18 ? 'text-amber-400' : 'text-red-400')}>{p.mmse}</span>], ['CDR', (p: PatientRecord) => p.cdr], ['Risk Score', (p: PatientRecord) => <span className={cn(p.riskScore < 0.4 ? 'text-emerald-400' : p.riskScore < 0.7 ? 'text-amber-400' : 'text-red-400')}>{(p.riskScore * 100).toFixed(0)}%</span>], ['Data Complete', (p: PatientRecord) => <><Progress value={p.dataCompleteness} className="w-16 h-1.5" /> <span className="ml-1">{p.dataCompleteness}%</span></>], ['Files', (p: PatientRecord) => p.uploadedFiles.length], ['Consents', (p: PatientRecord) => p.consents.filter((c) => c.status === 'signed').length], ['Clinician', (p: PatientRecord) => p.primaryClinician.split(' ').slice(-1)[0]], ['Status', (p: PatientRecord) => { const sc = statusCfg[p.status]; return <Badge variant="outline" className={cn('text-[9px] h-4', sc?.bg, sc?.color)}>{p.status}</Badge>; }]] as [string, (p: PatientRecord) => React.ReactNode][]).map(([label, fn]) => (
                        <tr key={label} className="border-b border-border/50 hover:bg-card/50"><td className="px-3 py-2 text-muted-foreground font-medium whitespace-nowrap">{label}</td>{comparisonIds.map((id) => { const p = patients.find((x) => x.id === id); return <td key={id} className="text-center px-3 py-2 text-foreground">{p ? fn(p) : '-'}</td>; })}</tr>
                      ))}
                    </tbody>
                  </table></div>
                </CardContent></Card>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      );
    }