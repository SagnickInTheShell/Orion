import React from 'react';
import {
  Activity,
  Sliders,
  Calendar,
  BarChart3,
  Clock,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Volume2,
  Sun,
  Moon,
  Search,
  Bell
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profileVersion: number;
  userName: string;
  onResetDemo: () => void;
  isDark: boolean;
  setIsDark: (v: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profileVersion,
  userName,
  onResetDemo,
  isDark,
  setIsDark
}) => {
  const navItems = [
    { id: 'dashboard',   label: 'Dashboard',       icon: Activity    },
    { id: 'environment', label: 'Environment',      icon: Volume2     },
    { id: 'whatif',      label: 'What-If',          icon: Sliders     },
    { id: 'prep',        label: 'Prep Mode',        icon: Calendar    },
    { id: 'patterns',    label: 'Patterns',         icon: BarChart3   },
    { id: 'history',     label: 'History',          icon: Clock       },
    { id: 'privacy',     label: 'Privacy',          icon: ShieldCheck },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      width: '100%',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 78, gap: 16 }}>

          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 180 }}
            onClick={() => setActiveTab('dashboard')}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 4,
              background: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)'
            }}>
              <div style={{ width: 10, height: 10, borderLeft: '2px solid var(--bg-surface)', borderBottom: '2px solid var(--bg-surface)', transform: 'rotate(45deg) translateX(-1px)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>ORION</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Personal Intelligence</div>
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 24px'
          }}>
            <div style={{
              width: '100%',
              maxWidth: 520,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-raised)',
              color: 'var(--text-muted)'
            }}>
              <Search size={16} />
              <span style={{ fontSize: 14 }}>Search anything...</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>Ctrl K</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setIsDark(!isDark)} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={onResetDemo} title="Reseed demo profile & data" style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <Bell size={15} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, borderLeft: '1px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>{userName.charAt(0)}</div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{userName}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Personal Twin</div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden no-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: 6, paddingBottom: 10, borderTop: '1px solid var(--border)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 10px', borderRadius: 8,
                  fontSize: 12, whiteSpace: 'nowrap',
                  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                  background: isActive ? 'var(--accent-soft)' : 'var(--bg-raised)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
