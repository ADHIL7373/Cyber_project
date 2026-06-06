import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CATEGORIES = [
  { key: 'basic',   label: '🔴 Basic Injection',  color: 'text-red-400'    },
  { key: 'evasion', label: '⚡ Filter Evasion',    color: 'text-purple-400' },
  { key: 'recon',   label: '🔍 Reconnaissance',   color: 'text-blue-400'   },
  { key: 'blind',   label: '👁️ Blind Injection',  color: 'text-amber-400'  },
];

export default function PayloadLibrary() {
  const [payloads, setPayloads] = useState<any>({});
  const [category, setCategory] = useState('basic');
  const [search,   setSearch]   = useState('');
  const [copied,   setCopied]   = useState<number | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/payloads')
      .then(r => setPayloads(r.data))
      .catch(() => {});
  }, []);

  const copyPayload = (payload: string, id: number) => {
    navigator.clipboard.writeText(payload);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = (payloads[category] || []).filter((p: any) =>
    p.payload.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase())
  );

  const severityColor = (s: string) => {
    if (s === 'Critical') return 'text-red-400 bg-red-950 border-red-800';
    if (s === 'High')     return 'text-orange-400 bg-orange-950 border-orange-800';
    return 'text-yellow-400 bg-yellow-950 border-yellow-800';
  };

  const totalCount = Object.values(payloads)
    .reduce((a: any, b: any) => a + b.length, 0);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">📦 Payload Library</h2>
        <p className="text-gray-500 text-sm mt-1">
          {totalCount}+ categorized OS command injection payloads
        </p>
      </div>

      {/* Search bar */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Search payloads by command or description..."
        className="w-full bg-gray-900 border border-gray-700 rounded-lg
                   px-4 py-2 text-white text-sm focus:border-purple-500
                   focus:outline-none"
      />

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold
                        transition-all ${
              category === cat.key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {cat.label}
            <span className="ml-2 text-xs opacity-60">
              ({(payloads[cat.key] || []).length})
            </span>
          </button>
        ))}
      </div>

      {/* Payload count */}
      <p className="text-gray-600 text-xs">
        Showing {filtered.length} payloads in this category
      </p>

      {/* Payload list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            No payloads found. Try a different search term.
          </div>
        )}
        {filtered.map((p: any) => (
          <div
            key={p.id}
            className="bg-gray-900 border border-gray-800 rounded-lg
                       px-4 py-3 flex items-center gap-3
                       hover:border-gray-700 transition-all"
          >
            <span className="text-gray-700 text-xs font-mono w-6 shrink-0">
              {String(p.id).padStart(2, '0')}
            </span>
            <code className="text-green-400 font-mono text-sm flex-1 truncate">
              {p.payload}
            </code>
            <span className="text-gray-500 text-xs w-48 shrink-0 truncate">
              {p.desc}
            </span>
            <span className={`text-xs border px-2 py-0.5 rounded
                              shrink-0 ${severityColor(p.severity)}`}>
              {p.severity}
            </span>
            <button
              onClick={() => copyPayload(p.payload, p.id)}
              className="text-gray-400 hover:text-white text-xs
                         bg-gray-800 hover:bg-gray-700 px-3 py-1
                         rounded transition-all shrink-0"
            >
              {copied === p.id ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}