import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/siem/stats')
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Attacks', value: stats?.total   ?? 0, color: 'text-red-400'    },
    { label: 'Successful',    value: stats?.success ?? 0, color: 'text-green-400'  },
    { label: 'Blocked',       value: stats?.blocked ?? 0, color: 'text-amber-400'  },
    { label: 'Techniques',    value: 10,                  color: 'text-purple-400' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">
        RCE Lab — Command Injection Research Platform
      </h2>
      <p className="text-gray-400 mb-6 text-sm">
        Isolated educational lab for OS command injection and filter evasion research.
      </p>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-gray-400 text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: '🔴 Attack Console',  desc: 'Fire payloads at 5 vulnerable endpoints', href: '/attack'   },
          { title: '⚡ Evasion Engine',  desc: 'Auto-generate filter bypass variants',    href: '/evasion'  },
          { title: '🛡️ Defense Panel',   desc: 'Patched vs vulnerable code diff',         href: '/defense'  },
          { title: '📦 Payload Library', desc: '100+ categorized injection payloads',     href: '/payloads' },
          { title: '👁️ SIEM Dashboard',  desc: 'Real-time attack logs and analytics',     href: '/siem'     },
          { title: '📄 Report',          desc: 'Generate professional PDF pentest report', href: '/report'  },
        ].map(card => (
          <a key={card.href} href={card.href}
            className="bg-gray-900 border border-gray-800 rounded-lg p-5
                       hover:border-purple-600 transition-all cursor-pointer block">
            <div className="font-semibold text-white mb-1">{card.title}</div>
            <div className="text-gray-400 text-sm">{card.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}