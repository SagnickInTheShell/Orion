import React from 'react';
import { Leaf, User } from 'lucide-react';

interface TopBarProps {
  userName: string;
  profileVersion: number;
  calmMode: boolean;
  setCalmMode: (v: boolean) => void;
  onResetDemo: () => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export const TopBar: React.FC<TopBarProps> = ({
  userName,
  calmMode,
  setCalmMode,
  onResetDemo,
}) => {
  const displayName = !userName || userName === 'Alex' || userName === 'Demo User' ? 'Sagnick' : userName.split(' ')[0];

  return (
    <div style={{
      position: 'relative',
      padding: '24px 36px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      flexShrink: 0,
      minHeight: 110,
      overflow: 'hidden',
    }}>
      {/* Background Pastel Hills & Sun Panorama matching reference */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}>
        <svg
          viewBox="0 0 700 140"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          fill="none"
        >
          {/* Subtle warm golden sun */}
          <circle cx="510" cy="50" r="36" fill="#FDE68A" fillOpacity="0.45" />

          {/* Birds in flight */}
          <path d="M420 38 Q424 33 428 37 Q432 33 436 38" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
          <path d="M450 28 Q453 24 457 27 Q461 24 465 28" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
          <path d="M485 45 Q488 42 491 44 Q494 42 497 45" stroke="#94A3B8" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.4" />

          {/* Distant soft hill layer */}
          <path
            d="M180 140 Q320 75 460 100 Q580 70 700 105 L700 140 Z"
            fill="#D5ECE3"
            fillOpacity="0.4"
          />

          {/* Mid hill layer */}
          <path
            d="M320 140 Q450 85 550 115 Q630 92 700 125 L700 140 Z"
            fill="#B9DFD2"
            fillOpacity="0.5"
          />

          {/* Fore hill layer */}
          <path
            d="M460 140 Q550 98 640 124 L700 140 Z"
            fill="#9CCEB0"
            fillOpacity="0.35"
          />
        </svg>
      </div>

      {/* Left: Greeting Text matching reference */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: 13,
          color: '#64748B',
          fontWeight: 500,
          marginBottom: 4,
        }}>
          {formatDate()}
        </div>

        <h1 style={{
          fontSize: 27,
          fontWeight: 800,
          color: '#1E293B',
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          margin: 0,
        }}>
          <span>{getGreeting()}, {displayName}</span>
          <span style={{ fontSize: 24 }}>☀️</span>
        </h1>

        <p style={{
          fontSize: 13.5,
          color: '#64748B',
          marginTop: 5,
          fontWeight: 400,
          letterSpacing: '-0.1px',
          margin: '5px 0 0 0',
        }}>
          You're doing great. Take things at your own pace.
        </p>
      </div>

      {/* Right: Calm Mode Pill & Dark User Avatar */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        paddingTop: 6,
      }}>
        {/* Calm Mode Button */}
        <button
          onClick={() => setCalmMode(!calmMode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '9px 18px',
            borderRadius: 50,
            border: 'none',
            background: calmMode ? '#2E7D63' : '#E6F4EA',
            color: calmMode ? 'white' : '#1E6B52',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
          title="Toggle Calm Mode"
        >
          <Leaf size={15} strokeWidth={2.2} color={calmMode ? 'white' : '#1E6B52'} />
          Calm Mode
        </button>

        {/* User avatar button (dark navy circle with white user icon matching reference) */}
        <button
          onClick={onResetDemo}
          title="Profile & Options"
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: '#1E293B',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            boxShadow: '0 2px 6px rgba(30,41,59,0.2)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <User size={18} strokeWidth={2} color="white" />
        </button>
      </div>
    </div>
  );
};
