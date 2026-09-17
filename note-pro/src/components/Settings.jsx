import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Accessibility,
  Save,
  Palette,
  Moon,
  Sun,
  CloudDownload,
  CloudUpload,
  ShieldCheck,
  Crown,
  LogOut,
  Folder,
  Plus,
  Trash,
} from 'lucide-react'
import { useNoteStore } from '../store/useNoteStore'
import { useLicenseStore } from '../store/useLicenseStore'
import { downloadJson } from '../utils/format'

function Section({ title, icon: Icon, children, pro }) {
  return (
    <section className="relative rounded-xl border border-line bg-surface p-5">
      {pro && (
        <span className="absolute right-4 top-4 rounded bg-accent px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wide text-white">
          Pro
        </span>
      )}
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

const ACCENTS = [
  { id: 'indigo', color: '#6366F1' },
  { id: 'emerald', color: '#10B981' },
  { id: 'rose', color: '#F43F5E' },
  { id: 'amber', color: '#F59E0B' },
  { id: 'sky', color: '#0EA5E9' },
  { id: 'violet', color: '#8B5CF6' },
]

export default function Settings() {
  const navigate = useNavigate()
  const user = useNoteStore((s) => s.user)
  const updateUser = useNoteStore((s) => s.updateUser)
  const accessibility = useNoteStore((s) => s.accessibility)
  const updateAccessibility = useNoteStore((s) => s.updateAccessibility)
  const notes = useNoteStore((s) => s.notes)
  const theme = useNoteStore((s) => s.theme)
  const setTheme = useNoteStore((s) => s.setTheme)
  const importBackup = useNoteStore((s) => s.importBackup)
  const customFolders = useNoteStore((s) => s.customFolders)
  const addCustomFolder = useNoteStore((s) => s.addCustomFolder)
  const removeCustomFolder = useNoteStore((s) => s.removeCustomFolder)
  const renameCustomFolder = useNoteStore((s) => s.renameCustomFolder)
  const license = useLicenseStore((s) => s.license)
  const deactivate = useLicenseStore((s) => s.deactivate)

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
  const [restoreState, setRestoreState] = useState('')
  const [folderDraft, setFolderDraft] = useState('')
  const fileInputRef = useRef(null)
  const restoreInputRef = useRef(null)

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

  const doBackup = () => {
    downloadJson(
      `mynote-pro-backup-${new Date().toISOString().slice(0, 10)}.json`,
      notes,
    )
  }

  const handleRestore = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const ok = await importBackup(Array.isArray(data) ? data : [])
      setRestoreState(ok ? 'Imported successfully!' : 'The file had no notes.')
    } catch {
      setRestoreState('Could not read that backup file.')
    }
    e.target.value = ''
    setTimeout(() => setRestoreState(''), 4000)
  }

  const commitFolder = () => {
    const label = folderDraft.trim()
    if (label) addCustomFolder(label)
    setFolderDraft('')
  }

  const handleDeactivate = () => {
    if (window.confirm('Deactivate your Pro license? You will need your key again to re-activate.')) {
      deactivate()
      window.location.hash = '#/'
      window.location.reload()
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
            Manage your profile, Pro license, themes, and preferences
          </p>
        </div>
      </div>

      {/* pro license */}
      <Section title="Pro License" icon={Crown} pro>
        {license ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-accent-soft/70 px-4 py-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-accent text-white">
                <ShieldCheck className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-accent-strong">
                  {license.name}
                </p>
                <p className="truncate font-mono text-[11px] text-accent-strong/80">
                  {license.email}
                </p>
              </div>
              <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                Pro
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-hover/60 px-3 py-2 font-mono text-[11px] text-ink-muted">
              <span>License ID</span>
              <span className="max-w-[220px] truncate text-ink">{license.id}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-hover/60 px-3 py-2 font-mono text-[11px] text-ink-muted">
              <span>Expires</span>
              <span className="text-ink">
                {license.expiresAt
                  ? new Date(license.expiresAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Never (lifetime)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleDeactivate}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <LogOut className="size-3.5" />
              Deactivate License
            </button>
          </div>
        ) : (
          <p className="text-[13px] text-ink-muted">
            No active license. Restart the app to re-activate.
          </p>
        )}
      </Section>

      {/* profile */}
      <Section title="Profile" icon={User}>
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
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-9 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-ink-muted/60 transition-colors focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
          />
        </Field>

        <Field label="Email Address">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-9 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-ink-muted/60 transition-colors focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
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

      {/* themes */}
      <Section title="Themes" icon={Palette} pro>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme({ mode: 'light' })}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[12.5px] font-medium transition-colors ${
              theme.mode === 'light'
                ? 'border-accent bg-accent-soft text-accent-strong'
                : 'border-line text-ink-secondary hover:bg-hover'
            }`}
          >
            <Sun className="size-4" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme({ mode: 'dark' })}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[12.5px] font-medium transition-colors ${
              theme.mode === 'dark'
                ? 'border-accent bg-accent-soft text-accent-strong'
                : 'border-line text-ink-secondary hover:bg-hover'
            }`}
          >
            <Moon className="size-4" />
            Dark
          </button>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-medium text-ink-secondary">
            Accent color
          </p>
          <div className="flex items-center gap-2.5">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setTheme({ accent: a.id })}
                className={`flex size-7 items-center justify-center rounded-full transition-transform ${
                  theme.accent === a.id
                    ? 'scale-110 ring-2 ring-offset-2 ring-offset-surface'
                    : 'hover:scale-110'
                }`}
                style={{ background: a.color, '--tw-ring-color': a.color }}
                title={a.id}
              >
                {theme.accent === a.id && (
                  <svg viewBox="0 0 12 12" className="size-3 text-white" fill="none">
                    <path
                      d="M2.5 6.2l2.2 2.2 4.8-4.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* folders */}
      <Section title="Custom Folders" icon={Folder} pro>
        <div className="flex items-center gap-2">
          <input
            value={folderDraft}
            onChange={(e) => setFolderDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitFolder()}
            placeholder="New folder name"
            className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-ink-muted/60 transition-colors focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
          />
          <button
            type="button"
            onClick={commitFolder}
            className="btn-primary gap-1.5 px-3 py-2"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>
        {customFolders.length > 0 && (
          <div className="space-y-1.5">
            {customFolders.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 rounded-lg bg-hover/60 px-3 py-2"
              >
                <span className="size-1.5 rounded-full bg-gradient-to-r from-accent to-accent-hover" />
                <input
                  value={f.label}
                  onChange={(e) =>
                    renameCustomFolder(f.id, e.target.value)
                  }
                  className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-ink focus:border-b focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete folder "${f.label}"? Notes inside it move to Uncategorized.`,
                      )
                    ) {
                      removeCustomFolder(f.id)
                    }
                  }}
                  className="size-7 shrink-0 rounded-md text-ink-muted transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Delete folder"
                >
                  <Trash className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {customFolders.length === 0 && (
          <p className="text-[12px] text-ink-muted">
            No custom folders yet — add one to organize beyond the built-ins.
          </p>
        )}
      </Section>

      {/* backup & restore */}
      <Section title="Backup & Restore" icon={CloudDownload} pro>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={doBackup}
            className="btn-secondary gap-1.5"
          >
            <CloudDownload className="size-4" />
            Export backup (JSON)
          </button>
          <button
            type="button"
            onClick={() => restoreInputRef.current?.click()}
            className="btn-secondary gap-1.5"
          >
            <CloudUpload className="size-4" />
            Import backup
          </button>
          <input
            ref={restoreInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleRestore}
          />
        </div>
        {restoreState && (
          <p className="text-[12px] font-medium text-emerald-600">
            {restoreState}
          </p>
        )}
        <p className="text-[11px] text-ink-muted">
          Notes are stored locally in your browser. Export backups for safety,
          or move notes between the free and Pro edition by importing an export
          here.
        </p>
      </Section>

      {/* security */}
      <Section title="Change Password" icon={Lock}>
        <Field label="Current Password">
          <div className="relative">
            <input
              type={showCurrentPw ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="h-9 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-ink-muted/60 transition-colors focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
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
            <input
              type={showNewPw ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="h-9 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-ink-muted/60 transition-colors focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
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
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="h-9 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-ink-muted/60 transition-colors focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
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
          <select
            value={accessibility.fontSize}
            onChange={(e) => updateAccessibility({ fontSize: e.target.value })}
            className="h-9 rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink transition-colors focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
          >
            {[
              { value: 'small', label: 'Small (13px)' },
              { value: 'medium', label: 'Medium (15px) — Default' },
              { value: 'large', label: 'Large (17px)' },
              { value: 'x-large', label: 'Extra Large (19px)' },
            ].map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
          description="Show visible focus rings on interactive elements"
        />
        <Toggle
          checked={accessibility.animationsEnabled}
          onChange={(v) => updateAccessibility({ animationsEnabled: v })}
          label="Animations"
          description="Enable or disable UI animations"
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
            <span className="flex items-center gap-1.5">
              <Crown className="size-3.5 text-accent" />
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
                Pro
              </span>
            </span>
          </div>
        </div>
      </Section>
    </div>
  )
}