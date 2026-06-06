import React, { useState } from 'react';
import axios from 'axios';

const ENDPOINTS = [
  { value: 'ping',          label: '🔴 Ping (No Filter)',         vuln: 'Direct OS injection'  },
  { value: 'nslookup',      label: '🟡 DNS Lookup (Weak Filter)', vuln: 'Blacklist bypass'      },
  { value: 'readfile',      label: '🟠 File Reader (Partial)',    vuln: 'Path + cmd injection' },
  { value: 'process-image', label: '🔵 Image Processor (Blind)', vuln: 'Blind injection'       },
  { value: 'viewlog',       label: '🟣 Log Viewer (Chained)',     vuln: 'Chained injection'     },
];

const TECHNIQUES = [
  { value: 'raw',       label: 'Raw — No bypass'        },
  { value: 'newline',   label: 'Newline %0a bypass'      },
  { value: 'ifs',       label: 'IFS variable bypass'     },
  { value: 'urlencode', label: 'URL encoding bypass'     },
  { value: 'double',    label: 'Double URL encoding'     },
  { value: 'concat',    label: 'String concatenation'    },
  { value: 'wildcard',  label: 'Wildcard bypass'         },
  { value: 'variable',  label: 'Variable expansion'      },
  { value: 'base64',    label: 'Base64 encoding'         },
  { value: 'hex',       label: 'Hex encoding'            },
];

const QUICK_PAYLOADS = [
  '127.0.0.1; whoami',
  '127.0.0.1 && ipconfig',
  '127.0.0.1 | hostname',
  '127.0.0.1; net user',
  '127.0.0.1; systeminfo',
];

export default function AttackConsole() {
  const [endpoint,  setEndpoint]  = useState('ping');
  const [payload,   setPayload]   = useState('127.0.0.1; whoami');
  const [technique, setTechnique] = useState('raw');
  const [output,    setOutput]    = useState('');
  const [loading,   setLoading]   = useState(false);
  const [severity,  setSeverity]  = useState('');
  const [history,   setHistory]   = useState<any[]>([]);

  const selectedEndpoint = ENDPOINTS.find(e => e.value === endpoint);

  const severityColor = (s: string) => {
    if (s === 'Critical') return 'text-red-400 border-red-400';
    if (s === 'High')     return 'text-orange-400 border-orange-400';
    if (s === 'Medium')   return 'text-yellow-400 border-yellow-400';
    if (s === 'Blocked')  return 'text-green-400 border-green-400';
    return 'text-gray-400 border-gray-400';
  };

  const fireAttack = async () => {
    setLoading(true);
    setOutput('');
    try {
      const res = await axios.post(
        `http://localhost:5000/api/vuln/${endpoint}`,
        {
          host:      payload,
          filename:  payload,
          domain:    payload,
          lines:     payload,
          technique: technique
        }
      );
      const out = res.data.output || JSON.stringify(res.data, null, 2);
      setOutput(out);
      setSeverity(res.data.severity || 'Medium');
      setHistory(prev => [{
        id:       Date.now(),
        endpoint,
        payload,
        technique,
        output:   out,
        severity: res.data.severity || 'Medium',
        time:     new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setOutput(`[ERROR] ${err.message}`);
    }
    setLoading(false);
  };

  const generateBypasses = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/bypass/generate',
        { payload }
      );
      const bypasses = res.data.bypasses;
      const formatted = bypasses.map((b: any) =>
        `[${b.id}] ${b.name}\n    Payload : ${b.payload}\n    Info    : ${b.description}\n    CVE     : ${b.cve}\n`
      ).join('\n');
      setOutput(`=== 10 BYPASS VARIANTS GENERATED ===\n\n${formatted}`);
    } catch (err: any) {
      setOutput(`[ERROR] ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">🔴 Attack Console</h2>
          <p className="text-gray-500 text-xs mt-1">
            Fire injection payloads at vulnerable endpoints
          </p>
        </div>
        {severity && (
          <span className={`border px-3 py-1 rounded text-sm font-mono ${severityColor(severity)}`}>
            Severity: {severity}
          </span>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-4">

        {/* LEFT — Config */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="text-gray-300 font-semibold text-xs uppercase tracking-wider">
            Target Configuration
          </h3>

          {/* Endpoint selector */}
          <div>
            <label className="text-gray-500 text-xs mb-1 block">
              Vulnerable Endpoint
            </label>
            <select
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded
                         px-3 py-2 text-white text-sm focus:border-purple-500
                         focus:outline-none"
            >
              {ENDPOINTS.map(ep => (
                <option key={ep.value} value={ep.value}>{ep.label}</option>
              ))}
            </select>
            {selectedEndpoint && (
              <p className="text-gray-600 text-xs mt-1">
                Vulnerability: {selectedEndpoint.vuln}
              </p>
            )}
          </div>

          {/* Technique selector */}
          <div>
            <label className="text-gray-500 text-xs mb-1 block">
              Evasion Technique
            </label>
            <select
              value={technique}
              onChange={e => setTechnique(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded
                         px-3 py-2 text-white text-sm focus:border-purple-500
                         focus:outline-none"
            >
              {TECHNIQUES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Payload input */}
          <div>
            <label className="text-gray-500 text-xs mb-1 block">
              Payload
            </label>
            <input
              value={payload}
              onChange={e => setPayload(e.target.value)}
              placeholder="e.g. 127.0.0.1; whoami"
              className="w-full bg-gray-800 border border-gray-700 rounded
                         px-3 py-2 text-green-400 font-mono text-sm
                         focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={fireAttack}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700
                         disabled:opacity-50 text-white font-semibold
                         py-2 rounded transition-all text-sm"
            >
              {loading ? '⏳ Executing...' : '🔴 Fire Attack'}
            </button>
            <button
              onClick={generateBypasses}
              className="flex-1 bg-purple-600 hover:bg-purple-700
                         text-white font-semibold py-2 rounded
                         transition-all text-sm"
            >
              ⚡ Gen Bypasses
            </button>
          </div>

          {/* Quick payloads */}
          <div>
            <label className="text-gray-500 text-xs mb-2 block">
              Quick Payloads
            </label>
            <div className="flex flex-wrap gap-1">
              {QUICK_PAYLOADS.map(p => (
                <button
                  key={p}
                  onClick={() => setPayload(p)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300
                             text-xs px-2 py-1 rounded font-mono
                             transition-all border border-gray-700"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Terminal output */}
        <div className="bg-black border border-gray-800 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600 text-xs ml-2 font-mono">
                terminal — rce-lab
              </span>
            </div>
            <button
              onClick={() => setOutput('')}
              className="text-gray-600 hover:text-gray-400 text-xs"
            >
              Clear
            </button>
          </div>
          <pre className="text-green-400 font-mono text-xs leading-relaxed
                          overflow-auto flex-1 whitespace-pre-wrap min-h-64">
            {loading
              ? '> Sending payload...\n> Waiting for response...\n> ...'
              : output
              || '> RCE Lab Terminal Ready\n> Configure your attack and press Fire Attack\n> Output will appear here\n>\n> ⚠️  Educational use only — isolated lab'}
          </pre>
        </div>
      </div>

      {/* Attack History */}
      {history.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-gray-300 font-semibold text-xs uppercase
                         tracking-wider mb-3">
            Attack History (click to view output)
          </h3>
          <div className="space-y-1">
            {history.map(h => (
              <div
                key={h.id}
                onClick={() => { setOutput(h.output); setSeverity(h.severity); }}
                className="flex items-center gap-3 bg-gray-800 rounded
                           px-3 py-2 text-sm cursor-pointer hover:bg-gray-700
                           transition-all"
              >
                <span className={`text-xs border px-2 py-0.5 rounded
                                  ${severityColor(h.severity)}`}>
                  {h.severity}
                </span>
                <span className="text-gray-500 font-mono text-xs w-16">
                  {h.time}
                </span>
                <span className="text-purple-400 text-xs w-24">
                  {h.endpoint}
                </span>
                <span className="text-green-400 font-mono text-xs flex-1 truncate">
                  {h.payload}
                </span>
                <span className="text-gray-600 text-xs">
                  {h.technique}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}