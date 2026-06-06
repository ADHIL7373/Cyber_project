import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard      from './pages/Dashboard'
import AttackConsole  from './pages/AttackConsole'
import PayloadLibrary from './pages/PayloadLibrary'
import EvasionEngine  from './pages/EvasionEngine'
import DefensePanel   from './pages/DefensePanel'
import SIEM           from './pages/SIEM'
import ReportGen      from './pages/ReportGen'

const NAV_ITEMS = [
  { path: '/',          label: '📊 Dashboard'      },
  { path: '/attack',    label: '🔴 Attack Console'  },
  { path: '/payloads',  label: '📦 Payload Library' },
  { path: '/evasion',   label: '⚡ Evasion Engine'  },
  { path: '/defense',   label: '🛡️ Defense Panel'   },
  { path: '/siem',      label: '👁️ SIEM'            },
  { path: '/report',    label: '📄 Report'          },
]

function NavLink({ path, label }: { path: string; label: string }) {
  const location = useLocation()
  const active   = location.pathname === path
  return (
    <Link
      to={path}
      className={`block px-4 py-2 rounded text-sm transition-all ${
        active
          ? 'bg-purple-600 text-white font-semibold'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {label}
    </Link>
  )
}

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1a1a2e' }}>

        {/* Sidebar */}
        <aside style={{
          width: '220px',
          backgroundColor: '#16213e',
          borderRight: '1px solid #1f2937',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          gap: '4px'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ color: '#f87171', fontWeight: 'bold', fontSize: '18px' }}>
              🔴 RCE Lab
            </h1>
            <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
              Command Injection Research
            </p>
          </div>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} {...item} />
          ))}
          <div style={{
            marginTop: 'auto',
            borderTop: '1px solid #1f2937',
            paddingTop: '12px',
            color: '#374151',
            fontSize: '11px'
          }}>
            ⚠️ Educational use only<br />
            Isolated lab environment
          </div>
        </aside>

        {/* Main content */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          <Routes>
            <Route path="/"         element={<Dashboard />}      />
            <Route path="/attack"   element={<AttackConsole />}  />
            <Route path="/payloads" element={<PayloadLibrary />} />
            <Route path="/evasion"  element={<EvasionEngine />}  />
            <Route path="/defense"  element={<DefensePanel />}   />
            <Route path="/siem"     element={<SIEM />}           />
            <Route path="/report"   element={<ReportGen />}      />
          </Routes>
        </main>

      </div>
    </Router>
  )
}