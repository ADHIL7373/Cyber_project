import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    axios.get('http://localhost:5000/api/siem/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Attacks',  value: stats?.total   ?? 0, color: '#ef4444' },
    { label: 'Successful',     value: stats?.success ?? 0, color: '#f97316' },
    { label: 'Blocked',        value: stats?.blocked ?? 0, color: '#22c55e' },
    { label: 'Techniques',     value: 10,                  color: '#a78bfa' },
  ]

  const features = [
    { title: '🔴 Attack Console',  desc: 'Fire payloads at 5 vulnerable endpoints', href: '/attack'   },
    { title: '⚡ Evasion Engine',  desc: 'Auto-generate 10 filter bypass variants',  href: '/evasion'  },
    { title: '🛡️ Defense Panel',   desc: 'Vulnerable vs patched code comparison',    href: '/defense'  },
    { title: '📦 Payload Library', desc: '35+ categorized injection payloads',       href: '/payloads' },
    { title: '👁️ SIEM Dashboard',  desc: 'Real-time attack logs and charts',         href: '/siem'     },
    { title: '📄 Report',          desc: 'Generate professional pentest report',     href: '/report'   },
  ]

  return (
    <div style={{ color: '#e2e8f0' }}>

      <h2 style={{ fontSize: '24px', fontWeight: 'bold',
                   color: '#fff', marginBottom: '8px' }}>
        RCE Lab — Command Injection Research Platform
      </h2>
      <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
        Isolated educational lab for OS command injection
        and filter evasion research.
      </p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                    gap: '16px', marginBottom: '32px' }}>
        {cards.map(card => (
          <div key={card.label} style={{
            backgroundColor: '#16213e',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold',
                          color: card.color }}>
              {card.value}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '13px',
                          marginTop: '4px' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                    gap: '16px' }}>
        {features.map(card => (
          <a key={card.href} href={card.href} style={{
            backgroundColor: '#16213e',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            padding: '20px',
            textDecoration: 'none',
            display: 'block',
            transition: 'border-color 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.borderColor = '#7c3aed')}
          onMouseLeave={e =>
            (e.currentTarget.style.borderColor = '#1f2937')}
          >
            <div style={{ fontWeight: '600', color: '#fff',
                          marginBottom: '4px' }}>
              {card.title}
            </div>
            <div style={{ color: '#6b7280', fontSize: '13px' }}>
              {card.desc}
            </div>
          </a>
        ))}
      </div>

    </div>
  )
}