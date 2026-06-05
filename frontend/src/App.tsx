import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AttackConsole from './pages/AttackConsole';
import PayloadLibrary from './pages/PayloadLibrary';
import EvasionEngine from './pages/EvasionEngine';
import DefensePanel from './pages/DefensePanel';
import SIEM from './pages/SIEM';
import ReportGen from './pages/ReportGen';

const NAV_ITEMS = [
  { path: '/',          label: '📊 Dashboard'      },
  { path: '/attack',    label: '🔴 Attack Console'  },
  { path: '/payloads',  label: '📦 Payload Library' },
  { path: '/evasion',   label: '⚡ Evasion Engine'  },
  { path: '/defense',   label: '🛡️ Defense Panel'   },
  { path: '/siem',      label: '👁️ SIEM'            },
  { path: '/report',    label: '📄 Report'          },
];

function NavLink({ path, label }: { path: string; label: string }) {
  const location = useLocation();
  const active = location.pathname === path;
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
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-lab-dark">
        <aside className="w-56 bg-lab-darker border-r border-gray-800 flex flex-col p-4 gap-1">
          <div className="mb-6">
            <h1 className="text-red-400 font-bold text-lg">🔴 RCE Lab</h1>
            <p className="text-gray-500 text-xs mt-1">Command Injection Research</p>
          </div>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} {...item} />
          ))}
          <div className="mt-auto">
            <div className="text-xs text-gray-600 border-t border-gray-800 pt-3">
              ⚠️ Educational use only<br />
              Isolated lab environment
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/"         element={<Dashboard />}     />
            <Route path="/attack"   element={<AttackConsole />} />
            <Route path="/payloads" element={<PayloadLibrary />}/>
            <Route path="/evasion"  element={<EvasionEngine />} />
            <Route path="/defense"  element={<DefensePanel />}  />
            <Route path="/siem"     element={<SIEM />}          />
            <Route path="/report"   element={<ReportGen />}     />
          </Routes>
        </main>
      </div>
    </Router>
  );
}