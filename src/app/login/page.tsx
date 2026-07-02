'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type UserRole, type RegisterData } from '@/lib/auth-store';
import {
  Brain, Shield, Eye, EyeOff, UserPlus, LogIn,
  FlaskConical, Stethoscope, Heart, Lock, Mail, Building2, CheckCircle2,
  AlertTriangle, Fingerprint, FileCheck, Server,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const roleConfig: Record<UserRole, { label: string; icon: React.ElementType; desc: string; color: string }> = {
  researcher: {
    label: 'Researcher',
    icon: FlaskConical,
    desc: 'Full access to AI models, datasets, and synthetic data generation',
    color: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
  },
  clinician: {
    label: 'Clinician',
    icon: Stethoscope,
    desc: 'Patient care, treatment optimization, and clinical insights',
    color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
  },
  patient: {
    label: 'Patient',
    icon: Heart,
    desc: 'View your own cognitive data, timeline, and progress reports',
    color: 'text-amber-400 border-amber-500/50 bg-amber-500/10',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [hipaaConsent, setHipaaConsent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('researcher');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    age: '',
    sex: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    let success: boolean;
    if (isLogin) {
      success = await login(formData.email, formData.password);
    } else {
      if (!hipaaConsent) {
        useAuthStore.setState({ error: 'You must accept the HIPAA Privacy Policy to continue.' });
        return;
      }
      success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        organization: formData.organization,
        hipaaConsent: true,
        age: formData.age ? parseInt(formData.age) : undefined,
        sex: formData.sex || undefined,
      });
    }

    if (success) {
      router.push('/');
    }
  };

  const quickLogin = async (email: string, password: string) => {
    clearError();
    const success = await login(email, password);
    if (success) router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-neuro/10 via-transparent to-neuro/5" />
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-neuro/5 blur-[100px]" />
        <div className="absolute bottom-40 right-10 w-60 h-60 rounded-full bg-neuro-bright/5 blur-[80px]" />

        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-neuro/20 flex items-center justify-center glow-neuro">
              <Brain className="w-7 h-7 text-neuro" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">NeuroTwin AI</h1>
              <p className="text-xs text-muted-foreground">Alzheimer&apos;s Digital Twin Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-10 space-y-8">
          <div>
            <h2 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight">
              AI-Powered<br />
              <span className="text-glow text-neuro">Digital Twin</span> for<br />
              Alzheimer&apos;s Research
            </h2>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed max-w-md">
              Multimodal data fusion across MRI, genetics, biomarkers, and cognitive assessments
              to build predictive digital twins for neurodegenerative disease progression.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Shield, label: 'HIPAA Compliant', sub: 'End-to-end encryption' },
              { icon: Fingerprint, label: 'RBAC Access', sub: 'Role-based controls' },
              { icon: FileCheck, label: 'Audit Trail', sub: 'Full access logging' },
              { icon: Server, label: '7 Data Modalities', sub: 'Multimodal fusion' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-lg bg-card/50 border border-border/50">
                <item.icon className="w-4 h-4 text-neuro mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-10">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span>HIPAA 45 CFR Part 160 & 164</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span>SOC 2 Type II Certified</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span>AES-256 Encryption</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-neuro/20 flex items-center justify-center glow-neuro">
              <Brain className="w-5 h-5 text-neuro" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">NeuroTwin AI</h1>
              <p className="text-[10px] text-muted-foreground">Alzheimer&apos;s Digital Twin</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin
                ? 'Sign in to access the NeuroTwin AI platform'
                : 'Join the NeuroTwin AI research platform'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex bg-card rounded-lg p-1 border border-border">
            <button
              onClick={() => { setIsLogin(true); clearError(); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all',
                isLogin
                  ? 'bg-neuro/15 text-neuro shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); clearError(); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all',
                !isLogin
                  ? 'bg-neuro/15 text-neuro shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (register only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm text-foreground">Full Name</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Dr. Jane Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-9 bg-card border-border h-11"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@institution.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-9 bg-card border-border h-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-9 pr-10 bg-card border-border h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Organization (register only) */}
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="org" className="text-sm text-foreground">Organization</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="org"
                      placeholder="University / Hospital / Institution"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="pl-9 bg-card border-border h-11"
                      required={!isLogin}
                    />
                  </div>
                </div>

                {/* Age and Gender - only for patients */}
                {selectedRole === 'patient' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="age" className="text-sm text-foreground">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="28"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="bg-card border-border h-11"
                        required={selectedRole === 'patient'}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sex" className="text-sm text-foreground">Gender</Label>
                      <select
                        id="sex"
                        value={formData.sex}
                        onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                        className="w-full h-11 px-3 rounded-md bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-neuro/50"
                        required={selectedRole === 'patient'}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">Account Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(roleConfig) as [UserRole, typeof roleConfig[UserRole]][]).map(
                      ([role, config]) => {
                        const Icon = config.icon;
                        const isSelected = selectedRole === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={cn(
                              'p-3 rounded-lg border text-left transition-all duration-200',
                              isSelected
                                ? config.color
                                : 'border-border bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
                            )}
                          >
                            <Icon className={cn('w-5 h-5 mb-1.5', isSelected ? '' : 'text-muted-foreground')} />
                            <p className="text-xs font-medium">{config.label}</p>
                          </button>
                        );
                      }
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {roleConfig[selectedRole].desc}
                  </p>
                </div>

                {/* HIPAA Consent */}
                <div className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="hipaa"
                      checked={hipaaConsent}
                      onCheckedChange={(v) => setHipaaConsent(v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="hipaa" className="text-xs text-foreground leading-relaxed cursor-pointer">
                      I acknowledge and consent to the{' '}
                      <span className="text-neuro font-medium">HIPAA Privacy Policy</span> (45 CFR Parts 160 & 164).
                      I understand that all patient data accessed through this platform is protected health information (PHI)
                      and is subject to federal privacy regulations. Unauthorized access or disclosure is prohibited.
                    </Label>
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading || (!isLogin && !hipaaConsent)}
              className="w-full h-11 bg-neuro hover:bg-neuro-bright text-primary-foreground font-medium transition-all glow-neuro"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isLogin ? 'Authenticating...' : 'Creating Account...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </div>
              )}
            </Button>
          </form>

          {/* Quick Login Demo Accounts */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground text-center mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { email: 'dr.smith@neuroresearch.org', pw: 'researcher123', label: 'Researcher', color: 'text-blue-400' },
                { email: 'dr.chen@memoryclinic.com', pw: 'clinician123', label: 'Clinician', color: 'text-emerald-400' },
                { email: 'eleanor.m@email.com', pw: 'patient123', label: 'Patient', color: 'text-amber-400' },
              ].map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => quickLogin(demo.email, demo.pw)}
                  disabled={isLoading}
                  className="p-2.5 rounded-lg border border-border bg-card/50 hover:bg-card transition-all text-center group"
                >
                  <p className={cn('text-xs font-medium', demo.color)}>{demo.label}</p>
                  <p className="text-[10px] text-muted-foreground group-hover:text-foreground/70 mt-0.5">Click to login</p>
                </button>
              ))}
            </div>
          </div>

          {/* HIPAA Badge */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Shield className="w-3.5 h-3.5 text-neuro/60" />
            <span className="text-[10px] text-muted-foreground">
              HIPAA Compliant · AES-256 Encrypted · SOC 2 Type II
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}