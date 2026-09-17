import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  LogOut,
  Camera,
  Eye,
  EyeOff,
  Accessibility,
  Save,
} from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-ink">
        <Icon className="size-4 text-accent" />
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
        {label}
      </label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, type = 'text', placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-9 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-ink-muted/60 transition-colors focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_var(--accent-glow)]"
    />
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-hover/60 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink">{label}</p>
        {description && (
          <p className="text-[11px] text-ink-muted">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-line'
        }`}
      >
        <span
          className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink transition-colors focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_var(--accent-glow)]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const user = useNoteStore((s) => s.user)
  const updateUser = useNoteStore((s) => s.updateUser)
  const accessibility = useNoteStore((s) => s.accessibility)
  const updateAccessibility = useNoteStore((s) => s.updateAccessibility)
  const notes = useNoteStore((s) => s.notes)

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')
  const fileInputRef = useRef(null)

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSaveProfile = () => {
    updateUser({ name, email })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassword = () => {
    setPwError('')
    if (!currentPassword || !newPassword) {
      setPwError('Please fill in all password fields.')
      return
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 2000)
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => updateUser({ avatar: reader.result })
    reader.readAsDataURL(file)
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      navigate('/')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="icon-btn"
          title="Go back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold tracking-tight">Settings</h1>
          <p className="text-[12px] text-ink-muted">
            Manage your profile, security, and preferences
          </p>
        </div>
      </div>

      {/* profile */}
      <Section title="Profile" icon={User}>
        {/* avatar */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative size-16 shrink-0 overflow-hidden rounded-full"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent to-accent-hover text-[22px] font-bold text-white">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <div>
            <p className="text-[13px] font-medium text-ink">
              {user.name || 'Your Name'}
            </p>
            <p className="text-[11px] text-ink-muted">
              Click avatar to upload a profile picture
            </p>
          </div>
        </div>

        <Field label="Full Name">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </Field>

        <Field label="Email Address">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="btn-primary gap-1.5 px-3 py-1.5 text-[12px]"
          >
            <Save className="size-3.5" />
            Save Profile
          </button>
          {saved && (
            <span className="text-[12px] font-medium text-emerald-600">
              Saved!
            </span>
          )}
        </div>
      </Section>

      {/* security */}
      <Section title="Change Password" icon={Lock}>
        <Field label="Current Password">
          <div className="relative">
            <TextInput
              type={showCurrentPw ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            >
              {showCurrentPw ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </button>
          </div>
        </Field>

        <Field label="New Password">
          <div className="relative">
            <TextInput
              type={showNewPw ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            >
              {showNewPw ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </button>
          </div>
        </Field>

        <Field label="Confirm New Password">
          <TextInput
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />
        </Field>

        {pwError && (
          <p className="text-[12px] font-medium text-red-500">{pwError}</p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleChangePassword}
            className="btn-primary gap-1.5 px-3 py-1.5 text-[12px]"
          >
            <Lock className="size-3.5" />
            Update Password
          </button>
          {pwSaved && (
            <span className="text-[12px] font-medium text-emerald-600">
              Password updated!
            </span>
          )}
        </div>
      </Section>

      {/* accessibility */}
      <Section title="Accessibility" icon={Accessibility}>
        <Field label="Font Size">
          <Select
            value={accessibility.fontSize}
            onChange={(v) => updateAccessibility({ fontSize: v })}
            options={[
              { value: 'small', label: 'Small (13px)' },
              { value: 'medium', label: 'Medium (15px) — Default' },
              { value: 'large', label: 'Large (17px)' },
              { value: 'x-large', label: 'Extra Large (19px)' },
            ]}
          />
        </Field>

        <Toggle
          checked={accessibility.reducedMotion}
          onChange={(v) => updateAccessibility({ reducedMotion: v })}
          label="Reduced Motion"
          description="Minimize animations and transitions throughout the app"
        />

        <Toggle
          checked={accessibility.highContrast}
          onChange={(v) => updateAccessibility({ highContrast: v })}
          label="High Contrast"
          description="Increase contrast between text and backgrounds"
        />

        <Toggle
          checked={accessibility.dyslexiaFont}
          onChange={(v) => updateAccessibility({ dyslexiaFont: v })}
          label="Dyslexia-Friendly Font"
          description="Switch to OpenDyslexic typeface for easier reading"
        />

        <Toggle
          checked={accessibility.compactMode}
          onChange={(v) => updateAccessibility({ compactMode: v })}
          label="Compact Mode"
          description="Reduce spacing and padding throughout the interface"
        />

        <Toggle
          checked={accessibility.focusIndicators}
          onChange={(v) => updateAccessibility({ focusIndicators: v })}
          label="Enhanced Focus Indicators"
          description="Show visible focus rings on interactive elements for keyboard navigation"
        />

        <Toggle
          checked={accessibility.animationsEnabled}
          onChange={(v) => updateAccessibility({ animationsEnabled: v })}
          label="Animations"
          description="Enable or disable UI animations (fade, slide, scale effects)"
        />
      </Section>

      {/* account info */}
      <Section title="Account Info" icon={Mail}>
        <div className="space-y-2 text-[13px]">
          <div className="flex items-center justify-between rounded-lg bg-hover/60 px-3 py-2">
            <span className="text-ink-muted">Email</span>
            <span className="font-medium text-ink">{user.email}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-hover/60 px-3 py-2">
            <span className="text-ink-muted">Storage</span>
            <span className="font-medium text-ink">
              {notes.length} notes · Local
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-hover/60 px-3 py-2">
            <span className="text-ink-muted">Plan</span>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-strong">
              Free
            </span>
          </div>
        </div>
      </Section>

      {/* upgrade to pro */}
      <button
        type="button"
        onClick={() => navigate('/upgrade')}
        className="flex w-full items-center justify-between rounded-xl border border-accent/30 bg-accent-soft/40 px-5 py-4 text-left transition-colors hover:border-accent/60"
      >
        <div>
          <p className="text-[14px] font-semibold text-accent-strong">
            Upgrade to MyNote Pro
          </p>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            Themes, analytics, trash, custom folders, and more.
          </p>
        </div>
        <svg viewBox="0 0 12 12" className="size-4 shrink-0 text-accent-strong" fill="none">
          <path
            d="M4.5 2l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-100"
      >
        <LogOut className="size-4" />
        Log Out
      </button>
    </div>
  )
}
