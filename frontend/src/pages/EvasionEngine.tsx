import React, { useState } from 'react';
import axios from 'axios';

const ENDPOINTS = [
  { value: '/api/vuln/ping',          label: 'Ping (No filter)'          },
  { value: '/api/vuln/nslookup',      label: 'DNS Lookup (Weak filter)'  },
  { value: '/api/vuln/readfile',      label: 'File Reader (Partial)'     },
  { value: '/api/vuln/process-image', label: 'Image Processor (Blind)'   },
  { value: '/api/vuln/viewlog',       label: 'Log Viewer (Chained)'      },
];

export default function EvasionEngine() {
  const [payload,    setPayload]    = useState('127.0.0.1; whoami');
  const [results,    setResults]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [detecting,  setDetecting]  = useState(false);
  const [filterInfo, setFilterInfo] = useState<any>(null);
  const [endpoint,   setEndpoint]   = useState('/api/vuln/nslookup');
  const [copied,     setCopied]     = useState<number | null>(null);

  const generateAll = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/bypass/generate',
        { payload }
      );
      setResults(res.data.bypasses);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const detectFilter = async () => {
    setDetecting(true);
    setFilterInfo(null);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/bypass/detect',
        { endpoint }
      );
      setFilterInfo(res.data);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
    setDetecting(false);
  };

  const copyPayload = (p: string, id: number) => {
    navigator.clipboard.writeText(p);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const cardColor = (id: number) => {
    if (id <= 2)  return 'border-red-900 bg-red-950/30';
    if (id <= 5)  return 'border-orange-900 bg-orange-950/30';
    if (id <= 8)  return 'border-yellow-900 bg-yellow-950/30';
    return 'border-purple-900 bg-purple-950/30';
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">⚡ Evasion Engine</h2>
        <p className="text-gray-500 text-sm mt-1">
          Auto-generate all 10 filter bypass variants + detect what filters are active
        </p>
      </div>

      {/* Filter Detector */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">
          🔍 Step 1 — Detect Active Filters
        </h3>
        <div className="flex gap-3 mb-4">
          <select
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded
                       px-3 py-2 text-white text-sm focus:border-purple-500
                       focus:outline-none"
          >
            {ENDPOINTS.map(ep => (
              <option key={ep.value} value={ep.value}>{ep.label}</option>
            ))}
          </select>
          <button
            onClick={detectFilter}
            disabled={detecting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                       text-white px-5 py-2 rounded text-sm font-semibold"
          >
            {detecting ? '🔍 Scanning...' : '🔍 Detect Filter'}
          </button>
        </div>

        {filterInfo && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Filter Type Detected</p>
              <p className="text-yellow-400 font-semibold text-sm">
                {filterInfo.filter_type}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-2">Recommendations</p>
              {filterInfo.recommended?.map((r: string, i: number) => (
                <p key={i} className="text-green-400 text-xs">• {r}</p>
              ))}
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-2">
                🔴 Blocked ({filterInfo.blocked?.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {filterInfo.blocked?.map((b: any, i: number) => (
                  <span key={i} className="bg-red-900 text-red-300
                                           text-xs px-2 py-0.5 rounded font-mono">
                    {b.char}
                  </span>
                ))}
                {filterInfo.blocked?.length === 0 && (
                  <span className="text-gray-500 text-xs">Nothing blocked</span>
                )}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-2">
                🟢 Allowed ({filterInfo.allowed?.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {filterInfo.allowed?.map((b: any, i: number) => (
                  <span key={i} className="bg-green-900 text-green-300
                                           text-xs px-2 py-0.5 rounded font-mono">
                    {b.char}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bypass Generator */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">
          ⚡ Step 2 — Generate All 10 Bypass Variants
        </h3>
        <div className="flex gap-3 mb-4">
          <input
            value={payload}
            onChange={e => setPayload(e.target.value)}
            placeholder="Enter base payload e.g. 127.0.0.1; whoami"
            className="flex-1 bg-gray-800 border border-gray-700 rounded
                       px-3 py-2 text-green-400 font-mono text-sm
                       focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={generateAll}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50
                       text-white px-6 py-2 rounded font-semibold text-sm"
          >
            {loading ? '⏳ Generating...' : '⚡ Generate All 10'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-gray-400 text-xs mb-3">
              {results.length} bypass variants generated — click payload to copy
            </p>
            {results.map(r => (
              <div key={r.id}
                   className={`border rounded-lg p-3 ${cardColor(r.id)}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold text-sm">
                        [{String(r.id).padStart(2,'0')}] {r.name}
                      </span>
                      <span className="text-gray-500 text-xs">{r.cve}</span>
                    </div>
                    <code
                      className="text-green-400 font-mono text-xs
                                 block bg-black/50 rounded px-2 py-1 mb-1
                                 cursor-pointer hover:bg-black/80"
                      onClick={() => copyPayload(r.payload, r.id)}
                    >
                      {r.payload}
                    </code>
                    <p className="text-gray-500 text-xs">{r.description}</p>
                  </div>
                  <button
                    onClick={() => copyPayload(r.payload, r.id)}
                    className="text-gray-400 hover:text-white text-xs
                               bg-gray-800 px-2 py-1 rounded shrink-0"
                  >
                    {copied === r.id ? '✅' : '📋'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}