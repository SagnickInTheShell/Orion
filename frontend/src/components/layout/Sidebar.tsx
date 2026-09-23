import React from 'react';
import {
  Home, User, Activity, Heart, CalendarDays,
  Compass, BarChart2, Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onShowOnboarding: () => void;
}

const navItems = [
  { id: 'home',        label: 'Home',             Icon: Home         },
  { id: 'space',       label: 'My Space',         Icon: User         },
  { id: 'environment', label: 'Live Environment', Icon: Activity     },
  { id: 'whatif',      label: 'Get Support',      Icon: Heart        },
  { id: 'prep',        label: 'Plan Ahead',       Icon: CalendarDays },
  { id: 'patterns',    label: 'Explore',          Icon: Compass      },
  { id: 'history',     label: 'My Progress',      Icon: BarChart2    },
  { id: 'privacy',     label: 'Settings',         Icon: Settings     },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onShowOnboarding }) => {
  return (
    <aside style={{
      width: 230,
      minWidth: 230,
      background: '#FFFFFF',
      borderRight: '1px solid #ECEEF1',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
      justifyContent: 'space-between',
    }}>
      <div>
        {/* Logo matching exact reference */}
        <div style={{ padding: '24px 22px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Circular pastel gradient logo icon */}
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FDE68A 0%, #F472B6 45%, #60A5FA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 3px 10px rgba(244,114,182,0.25)',
          }}>
            {/* Subtle inner geometric detail */}
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(2px)',
            }} />
          </div>

          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#1E293B',
              letterSpacing: '-0.3px',
              lineHeight: 1.15
            }}>
              ORION
            </div>
            <div style={{
              fontSize: 12,
              color: '#94A3B8',
              fontWeight: 400,
              lineHeight: 1.25,
              marginTop: 2
            }}>
              Your space.<br />Your pace.
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navItems.map(item => {
            // treat 'space' as active if activeTab is 'space' or 'environment' when needed
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 14,
                  border: 'none',
                  background: isActive ? '#EEF2FF' : 'transparent',
                  color: isActive ? '#4361EE' : '#64748B',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC';
                    (e.currentTarget as HTMLButtonElement).style.color = '#1E293B';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = '#64748B';
                  }
                }}
              >
                <item.Icon
                  size={19}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  color={isActive ? '#4361EE' : '#64748B'}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer — Botanical twig illustration + Tagline matching reference */}
      <div style={{
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 12,
      }}>
        {/* Botanical stem illustration */}
        <svg width="34" height="60" viewBox="0 0 34 60" fill="none" style={{ flexShrink: 0 }}>
          {/* Main curved stem */}
          <path d="M14 56 C14 42, 20 28, 12 4" stroke="#5E8E78" strokeWidth="2.5" strokeLinecap="round" />
          {/* Bottom left leaf */}
          <path d="M14 46 C6 44, 2 37, 4 33 C10 33, 14 40, 14 46 Z" fill="#6B9E87" opacity="0.85" />
          {/* Middle right leaf */}
          <path d="M16 34 C24 33, 29 27, 28 22 C22 23, 17 28, 16 34 Z" fill="#7EAE97" opacity="0.9" />
          {/* Upper left leaf */}
          <path d="M13 22 C7 20, 4 14, 6 10 C11 11, 13 16, 13 22 Z" fill="#6B9E87" opacity="0.85" />
          {/* Top leaf */}
          <path d="M12 4 C10 -1, 14 -1, 16 2 C16 4, 14 4, 12 4 Z" fill="#7EAE97" />
        </svg>

        <div>
          <div style={{
            fontSize: 13,
            color: '#64748B',
            fontWeight: 600,
            lineHeight: 1.45,
          }}>
            Small steps.<br />Brighter days.
          </div>
          <button
            onClick={onShowOnboarding}
            style={{
              fontSize: 11,
              color: '#94A3B8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: 4,
              padding: 0,
              textDecoration: 'underline',
              display: 'block',
            }}
          >
            Re-run setup wizard
          </button>
        </div>
      </div>
    </aside>
  );
};
