import React, { useState } from 'react'
import axios from 'axios'
import Editor from '@monaco-editor/react'

const DEFENSES = [
  {
    id: 1,
    title: 'Input Whitelisting',
    subtitle: 'Ping Endpoint',
    cve: 'CVE-2021-41773',
    severity: 'Critical',
    endpoint_vuln: 'ping',
    endpoint_safe: 'ping',
    test_payload: '127.0.0.1; whoami',
    technique: 'Regex whitelist — only valid IPs allowed',
    vulnerable_code: `# ❌ VULNERABLE — Ping Endpoint
# No input validation whatsoever
# Attacker input: "127.0.0.1; whoami"
# Result: pings 127.0.0.1 AND runs whoami

import subprocess
from flask import request, jsonify

@app.route('/api/vuln/ping', methods=['POST'])
def ping():
    host = request.json.get('host')
    
    # DANGER: Direct shell execution
    # shell=True means the OS shell interprets
    # ALL characters including ; & | $ \` ()
    output = subprocess.check_output(
        f"ping -n 2 {host}",
        shell=True          # ← Root cause of vulnerability
    )
    return jsonify({'output': output.decode()})

# Attack examples that WORK:
# "127.0.0.1; whoami"        → runs whoami
# "127.0.0.1 && ipconfig"   → runs ipconfig  
# "127.0.0.1 | net user"    → dumps all users
# "127.0.0.1 & systeminfo"  → full system info`,

    secure_code: `# ✅ SECURE — Ping Endpoint
# Fix 1: Strict IP address whitelist regex
# Fix 2: subprocess list args (no shell=True)
# Fix 3: Timeout protection

import subprocess
import re
from flask import request, jsonify

# Strict whitelist: only valid IPv4 addresses
IP_PATTERN = re.compile(
    r'^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}'
    r'(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$'
)

@app.route('/api/safe/ping', methods=['POST'])
def safe_ping():
    host = request.json.get('host', '')
    
    # ✅ FIX 1: Whitelist validation
    # Rejects ANYTHING that isn't a valid IP
    if not IP_PATTERN.match(host):
        return jsonify({
            'error': 'Invalid input — only IPv4 allowed',
            'blocked': True
        }), 400
    
    # ✅ FIX 2: List args — shell NEVER invoked
    # OS receives ['ping', '-n', '2', '1.2.3.4']
    # No shell means no ; & | $ interpretation
    result = subprocess.run(
        ['ping', '-n', '2', host],  # ← List, not string
        capture_output=True,
        text=True,
        timeout=10,
        shell=False   # ← Explicit: no shell
    )
    return jsonify({'output': result.stdout})

# Attack attempts that are NOW BLOCKED:
# "127.0.0.1; whoami"    → BLOCKED (semicolon)
# "127.0.0.1 && whoami"  → BLOCKED (&&)
# "$(whoami)"            → BLOCKED (not an IP)
# "; cat /etc/passwd"    → BLOCKED (not an IP)`,

    fixes: [
      { icon: '🔍', title: 'Regex IP Whitelist', desc: 'Only accepts valid IPv4 format — rejects all special chars' },
      { icon: '📋', title: 'List Arguments',     desc: 'subprocess receives a list — OS never invokes a shell' },
      { icon: '🚫', title: 'shell=False',         desc: 'Explicit shell=False prevents shell interpretation' },
      { icon: '⏱️', title: 'Timeout Protection',  desc: 'timeout=10 prevents resource exhaustion attacks' },
    ]
  },
  {
    id: 2,
    title: 'Subprocess List Args',
    subtitle: 'DNS Lookup Endpoint',
    cve: 'CVE-2019-11510',
    severity: 'High',
    endpoint_vuln: 'nslookup',
    endpoint_safe: 'nslookup',
    test_payload: 'google.com | whoami',
    technique: 'subprocess list args + domain whitelist',
    vulnerable_code: `# ❌ VULNERABLE — DNS Lookup
# Weak blacklist: only blocks ; && ||
# Easily bypassed with | or newline %0a

import subprocess
from flask import request, jsonify

# Only blocks 3 patterns — easily bypassed
BLACKLIST = [';', '&&', '||']

@app.route('/api/vuln/nslookup', methods=['POST'])
def dns_lookup():
    domain = request.json.get('domain')
    
    # WEAK: Blacklist approach always fails
    # Attacker just uses a different separator
    for char in BLACKLIST:
        if char in domain:
            return jsonify({'error': 'Blocked'}), 400
    
    # Still vulnerable to:
    # "google.com | whoami"     ← pipe not in blacklist
    # "google.com %0a whoami"   ← newline not blocked
    # "google.com \`whoami\`"  ← backtick not blocked
    output = subprocess.check_output(
        f"nslookup {domain}",  # ← String = danger
        shell=True
    )
    return jsonify({'output': output.decode()})`,

    secure_code: `# ✅ SECURE — DNS Lookup Endpoint
# Fix 1: Whitelist regex for domain names
# Fix 2: subprocess list args
# Fix 3: No shell=True

import subprocess
import re
from flask import request, jsonify

# Whitelist: only valid domain name characters
# Letters, numbers, hyphens, dots — nothing else
DOMAIN_PATTERN = re.compile(
    r'^[a-zA-Z0-9][a-zA-Z0-9\\-\\.]{1,253}\\.[a-zA-Z]{2,}$'
)

@app.route('/api/safe/nslookup', methods=['POST'])
def safe_dns():
    domain = request.json.get('domain', '')
    
    # ✅ FIX 1: Whitelist validation
    # A domain can ONLY contain a-z 0-9 - and .
    # Any injection character fails this check
    if not DOMAIN_PATTERN.match(domain):
        return jsonify({
            'error': 'Invalid domain format',
            'blocked': True
        }), 400
    
    # ✅ FIX 2: List args — no shell interpretation
    result = subprocess.run(
        ['nslookup', domain],  # ← Safe: list of args
        capture_output=True,
        text=True,
        timeout=10,
        shell=False
    )
    return jsonify({'output': result.stdout})

# All bypass attempts BLOCKED:
# "google.com | whoami"    → BLOCKED (pipe char)
# "google.com; whoami"     → BLOCKED (semicolon)
# "google.com && whoami"   → BLOCKED (&&)
# "google.com %0a whoami"  → BLOCKED (not in pattern)`,

    fixes: [
      { icon: '✅', title: 'Domain Whitelist',   desc: 'Only a-z 0-9 . and - allowed — all injection chars blocked' },
      { icon: '📋', title: 'List Arguments',     desc: 'subprocess list args — no shell invoked at all' },
      { icon: '🔒', title: 'No Blacklist',        desc: 'Whitelist approach is always safer than blacklist' },
      { icon: '⚡', title: 'Fail Fast',           desc: 'Validation happens before any command execution' },
    ]
  },
  {
    id: 3,
    title: 'shlex.quote() Escaping',
    subtitle: 'Universal Shell Escaping',
    cve: 'CVE-2022-22963',
    severity: 'High',
    endpoint_vuln: 'ping',
    endpoint_safe: 'ping',
    test_payload: '127.0.0.1; whoami',
    technique: 'shlex.quote() auto-escapes all metacharacters',
    vulnerable_code: `# ❌ VULNERABLE — No Shell Escaping
# Raw user input inserted directly into
# shell command string — never do this

import subprocess
from flask import request, jsonify

@app.route('/api/vuln/process', methods=['POST'])
def process():
    user_input = request.json.get('input')
    
    # DANGER: f-string with shell=True
    # Every shell metacharacter executes:
    # ; chains commands
    # && runs if previous succeeded
    # || runs if previous failed
    # | pipes output
    # \` runs subshell
    # $() runs subshell
    # > redirects output
    # < reads from file
    
    cmd = f"process_tool {user_input}"
    output = subprocess.check_output(
        cmd,
        shell=True   # ← All metachar active
    )
    return jsonify({'output': output.decode()})

# All of these inject successfully:
# "; whoami"
# "&& ipconfig"  
# "| net user"
# "\`systeminfo\`"
# "$(hostname)"`,

    secure_code: `# ✅ SECURE — shlex.quote() Escaping
# shlex.quote() wraps input in single quotes
# and escapes any existing single quotes
# Making ALL shell metacharacters literal

import subprocess
import shlex
from flask import request, jsonify

@app.route('/api/safe/process', methods=['POST'])
def safe_process():
    user_input = request.json.get('input', '')
    
    # ✅ FIX: shlex.quote() escapes everything
    # Input: "127.0.0.1; whoami"
    # After: "'127.0.0.1; whoami'"
    # Shell treats the WHOLE thing as one string
    safe_input = shlex.quote(user_input)
    
    # Even with shell=True, input is now safe
    # The shell sees: process_tool '127.0.0.1; whoami'
    # The ; is inside quotes — not a separator
    cmd = f"process_tool {safe_input}"
    output = subprocess.run(
        cmd,
        shell=True,      # Still works but safe now
        capture_output=True,
        text=True,
        timeout=10
    )
    return jsonify({'output': output.stdout})

# What shlex.quote() does to attacks:
# "; whoami"    → "'; whoami'"    (literal string)
# "&& ipconfig" → "'&& ipconfig'" (literal string)
# "\`id\`"      → "'\`id\`'"     (literal string)
# "$(hostname)" → "'$(hostname)'" (literal string)`,

    fixes: [
      { icon: '🔐', title: 'shlex.quote()',      desc: 'Wraps input in single quotes — all metacharacters become literal' },
      { icon: '🛡️', title: 'Auto-Escaping',      desc: 'No manual blacklist needed — works on ALL shell operators' },
      { icon: '✅', title: 'Industry Standard',  desc: 'Python stdlib function specifically for shell escaping' },
      { icon: '🔄', title: 'Works with shell=True', desc: 'Use when you genuinely need shell features' },
    ]
  },
  {
    id: 4,
    title: 'Path Traversal Prevention',
    subtitle: 'File Reader Endpoint',
    cve: 'CVE-2021-41773',
    severity: 'Critical',
    endpoint_vuln: 'readfile',
    endpoint_safe: 'readfile',
    test_payload: '../../Windows/System32/drivers/etc/hosts',
    technique: 'os.path.realpath() canonicalization + directory jail',
    vulnerable_code: `# ❌ VULNERABLE — File Reader
# Only blocks /etc prefix — trivially bypassed
# with relative path traversal ../../

import os
from flask import request, jsonify

@app.route('/api/vuln/readfile', methods=['POST'])
def read_file():
    filename = request.json.get('filename')
    
    # WEAK FILTER: Only checks for /etc prefix
    # Bypass: "../../etc/passwd"
    # Bypass: "....//....//etc/passwd"
    # Bypass: "%2e%2e%2fetc%2fpasswd" (URL encoded)
    if filename.startswith('/etc'):
        return jsonify({'error': 'Blocked'}), 400
    
    # Uses os.popen with shell=True
    # Double vulnerability: path traversal + injection
    # Attack: "../../etc/passwd; whoami"
    output = os.popen(
        f"cat /logs/{filename}"
    ).read()
    
    return jsonify({'output': output})

# Working attacks:
# "../../etc/passwd"          → reads passwd file
# "../../../Windows/win.ini"  → reads Windows files
# "test; whoami"              → command injection too`,

    secure_code: `# ✅ SECURE — File Reader
# Fix 1: Filename character whitelist
# Fix 2: os.path.realpath() resolves ALL
#        ../ sequences and symlinks
# Fix 3: Directory jail check
# Fix 4: Direct Python file read (no shell)

import os
import re
from flask import request, jsonify

# The ONLY directory we allow reads from
SAFE_DIRECTORY = os.path.realpath('/app/logs')

@app.route('/api/safe/readfile', methods=['POST'])
def safe_read():
    filename = request.json.get('filename', '')
    
    # ✅ FIX 1: Strict filename whitelist
    # Only letters, numbers, underscore, dash, dot
    # This alone blocks most traversal attempts
    if not re.match(r'^[a-zA-Z0-9_\\-\\.]+$', filename):
        return jsonify({'error': 'Invalid filename'}), 400
    
    # ✅ FIX 2: Build full path then canonicalize
    # realpath() resolves: ../ symlinks %2e etc.
    # "../../etc/passwd" becomes "/etc/passwd"
    full_path = os.path.join(SAFE_DIRECTORY, filename)
    real_path = os.path.realpath(full_path)
    
    # ✅ FIX 3: Directory jail
    # After canonicalization, MUST still be in
    # our allowed directory — if not, it's traversal
    if not real_path.startswith(SAFE_DIRECTORY + os.sep):
        return jsonify({'error': 'Access denied'}), 403
    
    # ✅ FIX 4: Direct Python read — no shell at all
    with open(real_path) as f:
        return jsonify({'output': f.read()})`,

    fixes: [
      { icon: '📂', title: 'Directory Jail',     desc: 'os.path.realpath() resolves all ../ and symlinks before checking' },
      { icon: '🔍', title: 'Filename Whitelist', desc: 'Alphanumeric only — blocks traversal characters' },
      { icon: '🚫', title: 'No Shell Execution', desc: 'Direct Python file.read() — shell never involved' },
      { icon: '🔒', title: 'Path Canonicalization', desc: 'startswith(SAFE_DIR) check after realpath()' },
    ]
  },
]

export default function DefensePanel() {
  const [selected,     setSelected]     = useState(0)
  const [view,         setView]         = useState<'both'|'vuln'|'safe'>('both')
  const [testing,      setTesting]      = useState(false)
  const [testResult,   setTestResult]   = useState<any>(null)
  const [testType,     setTestType]     = useState<'vuln'|'safe'|null>(null)
  const [isDark,       setIsDark]       = useState(true)

  const defense = DEFENSES[selected]

  const tryAttack = async (safe: boolean) => {
    setTesting(true)
    setTestResult(null)
    setTestType(safe ? 'safe' : 'vuln')
    try {
      const endpoint = safe
        ? `http://localhost:5000/api/safe/${defense.endpoint_safe}`
        : `http://localhost:5000/api/vuln/${defense.endpoint_vuln}`
      const res = await axios.post(endpoint, {
        host:     defense.test_payload,
        domain:   defense.test_payload,
        filename: defense.test_payload,
        lines:    defense.test_payload,
      })
      setTestResult(res.data)
    } catch (err: any) {
      setTestResult({
        output:  err.response?.data?.error || err.message,
        blocked: true
      })
    }
    setTesting(false)
  }

  const severityStyle = (s: string) => {
    if (s === 'Critical') return 'badge-red'
    if (s === 'High')     return 'badge-amber'
    return 'badge-blue'
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1>🛡️ Defense Panel</h1>
        <p>
          Side-by-side vulnerable vs secure code with Monaco Editor.
          Test each defense live with the "Try to Bypass" button.
        </p>
      </div>

      {/* Defense selector */}
      <div style={{
        display: 'flex', gap: '8px',
        marginBottom: '16px', flexWrap: 'wrap'
      }}>
        {DEFENSES.map((d, i) => (
          <button
            key={d.id}
            onClick={() => { setSelected(i); setTestResult(null) }}
            style={{
              padding: '8px 16px',
              borderRadius: '7px',
              border: '1px solid',
              borderColor: selected === i
                ? 'var(--purple)' : 'var(--border)',
              background: selected === i
                ? 'var(--purple)' : 'var(--bg2)',
              color: selected === i ? '#fff' : 'var(--text2)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: selected === i ? 600 : 400,
              transition: 'all 0.15s'
            }}
          >
            {d.title}
          </button>
        ))}
      </div>

      {/* Info bar */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-body" style={{ padding: '12px 16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div className="form-label">CVE Reference</div>
              <code style={{
                color: 'var(--red-text)',
                fontSize: '13px',
                fontWeight: 700
              }}>
                {defense.cve}
              </code>
            </div>
            <div>
              <div className="form-label">Endpoint</div>
              <span style={{
                color: 'var(--text)',
                fontSize: '13px'
              }}>
                {defense.subtitle}
              </span>
            </div>
            <div>
              <div className="form-label">Severity</div>
              <span className={`badge ${severityStyle(defense.severity)}`}>
                {defense.severity}
              </span>
            </div>
            <div>
              <div className="form-label">Defense Technique</div>
              <span style={{
                color: 'var(--text2)',
                fontSize: '12px'
              }}>
                {defense.technique}
              </span>
            </div>

            {/* View toggle */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
              {(['both','vuln','safe'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: view === v
                      ? 'var(--bg3)' : 'transparent',
                    color: view === v
                      ? 'var(--text)' : 'var(--text3)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: view === v ? 600 : 400
                  }}
                >
                  {v === 'both' ? '⬛ Both'
                    : v === 'vuln' ? '❌ Vulnerable'
                    : '✅ Secure'}
                </button>
              ))}
              <button
                onClick={() => setIsDark(!isDark)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg3)',
                  color: 'var(--text2)',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monaco Editor — Code comparison */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: view === 'both' ? '1fr 1fr' : '1fr',
        gap: '14px',
        marginBottom: '16px'
      }}>

        {/* Vulnerable code */}
        {(view === 'both' || view === 'vuln') && (
          <div style={{
            border: '1px solid #7f1d1d',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#7f1d1d',
              padding: '9px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>❌</span>
                <span style={{
                  color: '#fca5a5',
                  fontWeight: 600,
                  fontSize: '13px'
                }}>
                  Vulnerable Code
                </span>
                <code style={{
                  background: '#991b1b',
                  color: '#fca5a5',
                  padding: '1px 8px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  shell=True
                </code>
              </div>
              <button
                onClick={() => tryAttack(false)}
                disabled={testing}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '5px',
                  cursor: testing ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  opacity: testing ? 0.6 : 1
                }}
              >
                {testing && testType === 'vuln'
                  ? '⏳ Testing...'
                  : '🔴 Try Attack'}
              </button>
            </div>
            <Editor
              height="380px"
              language="python"
              value={defense.vulnerable_code}
              theme={isDark ? 'vs-dark' : 'light'}
              options={{
                readOnly:          true,
                minimap:           { enabled: false },
                fontSize:          12,
                lineNumbers:       'on',
                scrollBeyondLastLine: false,
                wordWrap:          'on',
                renderLineHighlight: 'none',
                scrollbar: {
                  vertical:   'hidden',
                  horizontal: 'hidden'
                }
              }}
            />
          </div>
        )}

        {/* Secure code */}
        {(view === 'both' || view === 'safe') && (
          <div style={{
            border: '1px solid #14532d',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#14532d',
              padding: '9px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>✅</span>
                <span style={{
                  color: '#86efac',
                  fontWeight: 600,
                  fontSize: '13px'
                }}>
                  Secure Code
                </span>
                <code style={{
                  background: '#166534',
                  color: '#86efac',
                  padding: '1px 8px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  shell=False
                </code>
              </div>
              <button
                onClick={() => tryAttack(true)}
                disabled={testing}
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '5px',
                  cursor: testing ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  opacity: testing ? 0.6 : 1
                }}
              >
                {testing && testType === 'safe'
                  ? '⏳ Testing...'
                  : '🛡️ Try to Bypass Me'}
              </button>
            </div>
            <Editor
              height="380px"
              language="python"
              value={defense.secure_code}
              theme={isDark ? 'vs-dark' : 'light'}
              options={{
                readOnly:          true,
                minimap:           { enabled: false },
                fontSize:          12,
                lineNumbers:       'on',
                scrollBeyondLastLine: false,
                wordWrap:          'on',
                renderLineHighlight: 'none',
                scrollbar: {
                  vertical:   'hidden',
                  horizontal: 'hidden'
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Live test result */}
      {testResult && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>
                {testResult.blocked ? '🛡️' : '💥'}
              </span>
              <span className="card-title">
                Live Test Result —{' '}
                {testType === 'safe'
                  ? 'Secure Endpoint'
                  : 'Vulnerable Endpoint'}
              </span>
            </div>
            <span className={`badge ${
              testResult.blocked
                ? 'badge-green' : 'badge-red'
            }`}>
              {testResult.blocked
                ? '✅ Attack Blocked!'
                : '❌ Injection Successful!'}
            </span>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '8px' }}>
              <span className="form-label">Test Payload Used</span>
              <code style={{
                display: 'block',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: testResult.blocked
                  ? 'var(--green-text)' : 'var(--red-text)',
                fontFamily: 'monospace',
                fontSize: '13px',
                marginTop: '4px'
              }}>
                {defense.test_payload}
              </code>
            </div>
            <div>
              <span className="form-label">Server Response</span>
              <pre style={{
                background: '#0a0d14',
                border: '1px solid #1e2436',
                borderRadius: '6px',
                padding: '12px',
                color: testResult.blocked ? '#4ade80' : '#f87171',
                fontFamily: 'monospace',
                fontSize: '12px',
                marginTop: '4px',
                whiteSpace: 'pre-wrap',
                maxHeight: '150px',
                overflow: 'auto'
              }}>
                {testResult.output
                  || testResult.error
                  || JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
            {testResult.fix && (
              <div style={{
                marginTop: '10px',
                background: 'var(--green-bg)',
                border: '1px solid var(--green-text)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                color: 'var(--green-text)'
              }}>
                ✅ Fix applied: <strong>{testResult.fix}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fix cards */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            ✅ Security Fixes Applied in This Defense
          </span>
        </div>
        <div className="card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: '10px'
          }}>
            {defense.fixes.map((fix, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: 'var(--green-bg)',
                border: '1px solid',
                borderColor: 'var(--green-text)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>{fix.icon}</span>
                <div>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: 'var(--green-text)',
                    marginBottom: '3px'
                  }}>
                    {fix.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text2)'
                  }}>
                    {fix.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}