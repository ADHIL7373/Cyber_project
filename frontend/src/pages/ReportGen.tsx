import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function ReportGen() {
  const [stats,      setStats]      = useState<any>(null)
  const [logs,       setLogs]       = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [generated,  setGenerated]  = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    axios.get('http://localhost:5000/api/siem/stats')
      .then(r => setStats(r.data)).catch(() => {})
    axios.get('http://localhost:5000/api/siem/logs?limit=50')
      .then(r => setLogs(r.data)).catch(() => {})
  }, [])

  const generateReport = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 2000))
    setReportData({
      title:    'RCE Lab — Penetration Test Report',
      date:     new Date().toLocaleDateString(),
      time:     new Date().toLocaleTimeString(),
      stats,
      logs,
      findings: [
        {
          id: 'FIND-001',
          title: 'OS Command Injection — No Input Validation',
          severity: 'Critical',
          endpoint: '/api/vuln/ping',
          cve: 'CVE-2021-41773',
          description: 'The ping endpoint passes user input directly to subprocess with shell=True, allowing arbitrary OS command execution.',
          payload: '127.0.0.1; whoami',
          impact: 'Full server compromise, data exfiltration, lateral movement',
          remediation: 'Use subprocess list args, validate input with regex whitelist, set shell=False'
        },
        {
          id: 'FIND-002',
          title: 'Blacklist Filter Bypass via Operator Substitution',
          severity: 'High',
          endpoint: '/api/vuln/nslookup',
          cve: 'CVE-2019-11510',
          description: 'The DNS lookup endpoint uses a blacklist that only blocks semicolons, allowing bypass with &&, ||, newline and other operators.',
          payload: '127.0.0.1 && whoami',
          impact: 'Command injection via filter bypass, information disclosure',
          remediation: 'Use whitelist validation instead of blacklist, subprocess list args'
        },
        {
          id: 'FIND-003',
          title: 'Path Traversal + Command Injection',
          severity: 'High',
          endpoint: '/api/vuln/readfile',
          cve: 'CVE-2021-41773',
          description: 'File reader only blocks /etc prefix, allowing bypass with relative path traversal and command injection via semicolons.',
          payload: '../../etc/passwd; whoami',
          impact: 'Arbitrary file read, command execution',
          remediation: 'Use os.path.realpath() for path canonicalization, whitelist filename chars'
        },
        {
          id: 'FIND-004',
          title: 'Blind Command Injection — No Output Returned',
          severity: 'High',
          endpoint: '/api/vuln/process-image',
          cve: 'General',
          description: 'Image processor executes commands without returning output. Exploitable via time-based or out-of-band techniques.',
          payload: '; ping -n 10 127.0.0.1',
          impact: 'Blind RCE, OOB data exfiltration',
          remediation: 'Input validation, avoid shell execution for file processing'
        },
      ]
    })
    setGenerating(false)
    setGenerated(true)
  }

  const severityColor = (s: string) => {
    if (s === 'Critical') return { color: '#ef4444', bg: '#450a0a' }
    if (s === 'High')     return { color: '#f97316', bg: '#431407' }
    if (s === 'Medium')   return { color: '#eab308', bg: '#422006' }
    return { color: '#22c55e', bg: '#052e16' }
  }

  return (
    <div style={{ color: '#e2e8f0' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
          📄 Report Generator
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
          Generate a professional penetration testing report
        </p>
      </div>

      {/* Generate button */}
      {!generated && (
        <div style={{
          backgroundColor: '#16213e',
          border: '1px solid #1f2937',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>
            Generate Pentest Report
          </h3>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
            Compiles all attack logs, findings, CVE references and
            remediation recommendations into a professional report
          </p>
          <button
            onClick={generateReport}
            disabled={generating}
            style={{
              backgroundColor: generating ? '#374151' : '#7c3aed',
              color: '#fff',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600'
            }}
          >
            {generating ? '⏳ Generating Report...' : '📄 Generate Report'}
          </button>
        </div>
      )}

      {/* Generated Report */}
      {generated && reportData && (
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1f2937',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>

          {/* Report Header */}
          <div style={{
            backgroundColor: '#1e1b4b',
            borderBottom: '2px solid #4c1d95',
            padding: '24px 32px'
          }}>
            <div style={{ display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: '#a78bfa', fontSize: '11px',
                              letterSpacing: '0.1em', marginBottom: '8px' }}>
                  CONFIDENTIAL — PENETRATION TEST REPORT
                </div>
                <h1 style={{ color: '#fff', fontSize: '22px',
                             fontWeight: 'bold', marginBottom: '4px' }}>
                  {reportData.title}
                </h1>
                <p style={{ color: '#9ca3af', fontSize: '13px' }}>
                  Generated: {reportData.date} at {reportData.time}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#ef4444', fontSize: '24px',
                              fontWeight: 'bold' }}>
                  🔴 RCE Lab
                </div>
                <div style={{ color: '#6b7280', fontSize: '11px' }}>
                  Command Injection Research Platform
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px' }}>

            {/* Executive Summary */}
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#fff', fontSize: '18px',
                           borderBottom: '1px solid #1f2937',
                           paddingBottom: '8px', marginBottom: '16px' }}>
                1. Executive Summary
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '13px',
                          lineHeight: '1.8', marginBottom: '16px' }}>
                This penetration test was conducted on the RCE Lab
                research platform to demonstrate OS command injection
                vulnerabilities and filter evasion techniques.
                The assessment identified <strong style={{ color: '#ef4444' }}>
                4 critical/high severity vulnerabilities</strong> across
                5 endpoints, all exploitable via various command injection
                and filter bypass techniques.
              </p>

              {/* Stats grid */}
              <div style={{ display: 'grid',
                            gridTemplateColumns: 'repeat(4,1fr)',
                            gap: '12px' }}>
                {[
                  { label: 'Total Attacks',  value: stats?.total   ?? 0, color: '#ef4444' },
                  { label: 'Successful',     value: stats?.success ?? 0, color: '#f97316' },
                  { label: 'Blocked',        value: stats?.blocked ?? 0, color: '#22c55e' },
                  { label: 'Findings',       value: 4,                   color: '#a78bfa' },
                ].map(s => (
                  <div key={s.label} style={{
                    backgroundColor: '#16213e',
                    border: '1px solid #1f2937',
                    borderRadius: '6px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold',
                                  color: s.color }}>
                      {s.value}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Findings */}
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#fff', fontSize: '18px',
                           borderBottom: '1px solid #1f2937',
                           paddingBottom: '8px', marginBottom: '16px' }}>
                2. Vulnerability Findings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column',
                            gap: '16px' }}>
                {reportData.findings.map((f: any) => {
                  const sc = severityColor(f.severity)
                  return (
                    <div key={f.id} style={{
                      backgroundColor: '#16213e',
                      border: `1px solid ${sc.color}40`,
                      borderLeft: `4px solid ${sc.color}`,
                      borderRadius: '8px',
                      padding: '16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <span style={{ color: '#6b7280', fontSize: '11px' }}>
                            {f.id}
                          </span>
                          <h3 style={{ color: '#fff', fontSize: '15px',
                                       fontWeight: '600' }}>
                            {f.title}
                          </h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{
                            backgroundColor: sc.bg,
                            color: sc.color,
                            padding: '2px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            border: `1px solid ${sc.color}40`
                          }}>
                            {f.severity}
                          </span>
                          <span style={{
                            backgroundColor: '#1f2937',
                            color: '#9ca3af',
                            padding: '2px 10px',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}>
                            {f.cve}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '12px', fontSize: '13px' }}>
                        <div>
                          <p style={{ color: '#6b7280', marginBottom: '4px' }}>
                            Endpoint
                          </p>
                          <p style={{ color: '#a78bfa', fontFamily: 'monospace' }}>
                            {f.endpoint}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: '#6b7280', marginBottom: '4px' }}>
                            Proof of Concept
                          </p>
                          <code style={{ color: '#34d399',
                                         fontFamily: 'monospace',
                                         backgroundColor: '#0f2417',
                                         padding: '2px 8px',
                                         borderRadius: '4px' }}>
                            {f.payload}
                          </code>
                        </div>
                        <div>
                          <p style={{ color: '#6b7280', marginBottom: '4px' }}>
                            Description
                          </p>
                          <p style={{ color: '#d1d5db', lineHeight: '1.6' }}>
                            {f.description}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: '#6b7280', marginBottom: '4px' }}>
                            Remediation
                          </p>
                          <p style={{ color: '#86efac', lineHeight: '1.6' }}>
                            {f.remediation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Attack Log */}
            {logs.length > 0 && (
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#fff', fontSize: '18px',
                             borderBottom: '1px solid #1f2937',
                             paddingBottom: '8px', marginBottom: '16px' }}>
                  3. Attack Evidence Log
                </h2>
                <table style={{ width: '100%', borderCollapse: 'collapse',
                                fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1f2937' }}>
                      {['ID','Timestamp','Endpoint',
                        'Technique','Severity','Payload'].map(h => (
                        <th key={h} style={{ padding: '8px 12px',
                                             textAlign: 'left',
                                             color: '#9ca3af' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 10).map((log: any, i: number) => (
                      <tr key={log.id} style={{
                        backgroundColor: i % 2 === 0 ? '#16213e' : '#0f172a',
                        borderBottom: '1px solid #1f2937'
                      }}>
                        <td style={{ padding: '8px 12px',
                                     color: '#6b7280' }}>#{log.id}</td>
                        <td style={{ padding: '8px 12px', color: '#6b7280',
                                     fontFamily: 'monospace' }}>
                          {log.timestamp?.slice(0, 19)}
                        </td>
                        <td style={{ padding: '8px 12px',
                                     color: '#a78bfa' }}>{log.endpoint}</td>
                        <td style={{ padding: '8px 12px',
                                     color: '#9ca3af' }}>{log.technique}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            color: severityColor(log.severity).color,
                            fontSize: '11px'
                          }}>
                            {log.severity}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', color: '#34d399',
                                     fontFamily: 'monospace' }}>
                          {log.payload?.slice(0, 30)}
                          {log.payload?.length > 30 ? '...' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Recommendations */}
            <section>
              <h2 style={{ color: '#fff', fontSize: '18px',
                           borderBottom: '1px solid #1f2937',
                           paddingBottom: '8px', marginBottom: '16px' }}>
                4. Remediation Recommendations
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column',
                            gap: '8px' }}>
                {[
                  'Never use shell=True with user-controlled input in subprocess calls',
                  'Always validate input with strict whitelist regex patterns',
                  'Use subprocess list arguments instead of string commands',
                  'Apply shlex.quote() when shell execution is unavoidable',
                  'Implement path canonicalization with os.path.realpath()',
                  'Use WAF with comprehensive rule sets for web-facing apps',
                  'Apply principle of least privilege — run as non-root user',
                  'Implement centralized logging and alerting for command execution'
                ].map((rec, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    backgroundColor: '#16213e',
                    border: '1px solid #1f2937',
                    borderRadius: '6px',
                    padding: '10px 14px'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold',
                                   minWidth: '20px' }}>
                      {i + 1}.
                    </span>
                    <span style={{ color: '#d1d5db', fontSize: '13px' }}>
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: '#16213e',
            borderTop: '1px solid #1f2937',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#4b5563', fontSize: '12px' }}>
              RCE Lab Research Platform — Educational Use Only
            </span>
            <button
              onClick={() => window.print()}
              style={{
                backgroundColor: '#7c3aed',
                color: '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}