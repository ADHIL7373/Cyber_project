import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, LineChart, Line
} from 'recharts'

const COLORS = ['#E24B4A', '#EF9F27', '#7F77DD', '#1D9E75', '#3B8BD4']

export default function SIEM() {
  const [stats,   setStats]   = useState<any>(null)
  const [logs,    setLogs]    = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/siem/stats'),
        axios.get('http://localhost:5000/api/siem/logs?limit=20')
      ])
      setStats(statsRes.data)
      setLogs(logsRes.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const severityColor = (s: string) => {
    if (s === 'Critical') return '#E24B4A'
    if (s === 'High')     return '#EF9F27'
    if (s === 'Blocked')  return '#1D9E75'
    return '#7F77DD'
  }

  const techniqueData = stats
    ? Object.entries(stats.by_technique).map(([k, v]) => ({
        name: k, value: v as number
      }))
    : []

  const endpointData = stats
    ? Object.entries(stats.by_endpoint).map(([k, v]) => ({
        name: k, value: v as number
      }))
    : []

  const severityData = stats
    ? Object.entries(stats.by_severity).map(([k, v]) => ({
        name: k, value: v as number
      }))
    : []

  const card = (label: string, value: any, color: string) => (
    <div style={{
      backgroundColor: '#16213e',
      border: '1px solid #1f2937',
      borderRadius: '8px',
      padding: '20px',
    }}>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color }}>
        {value ?? 0}
      </div>
      <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  )

  return (
    <div style={{ color: '#e2e8f0' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
          👁️ SIEM Dashboard
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
          Real-time attack monitoring — auto-refreshes every 5 seconds
        </p>
      </div>

      {loading && (
        <p style={{ color: '#6b7280' }}>Loading data...</p>
      )}

      {/* Stat cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {card('Total Attacks',  stats.total,   '#E24B4A')}
          {card('Successful',     stats.success, '#EF9F27')}
          {card('Blocked',        stats.blocked, '#1D9E75')}
          {card('Techniques Used',
            Object.keys(stats.by_technique).length, '#7F77DD')}
        </div>
      )}

      {/* Charts row */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>

          {/* Techniques bar chart */}
          <div style={{
            backgroundColor: '#16213e',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h3 style={{ color: '#d1d5db', fontSize: '13px',
                         marginBottom: '12px', textTransform: 'uppercase',
                         letterSpacing: '0.05em' }}>
              Attacks by Technique
            </h3>
            {techniqueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={techniqueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }}/>
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }}/>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16213e',
                                    border: '1px solid #374151' }}
                  />
                  <Bar dataKey="value" fill="#7F77DD" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#4b5563', fontSize: '12px' }}>
                No data yet — fire some attacks first
              </p>
            )}
          </div>

          {/* Severity pie chart */}
          <div style={{
            backgroundColor: '#16213e',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h3 style={{ color: '#d1d5db', fontSize: '13px',
                         marginBottom: '12px', textTransform: 'uppercase',
                         letterSpacing: '0.05em' }}>
              Severity Distribution
            </h3>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%" cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {severityData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16213e',
                                    border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#4b5563', fontSize: '12px' }}>
                No data yet
              </p>
            )}
          </div>

          {/* Endpoints bar chart */}
          <div style={{
            backgroundColor: '#16213e',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h3 style={{ color: '#d1d5db', fontSize: '13px',
                         marginBottom: '12px', textTransform: 'uppercase',
                         letterSpacing: '0.05em' }}>
              Attacks by Endpoint
            </h3>
            {endpointData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={endpointData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }}/>
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }}/>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16213e',
                                    border: '1px solid #374151' }}
                  />
                  <Bar dataKey="value" fill="#E24B4A" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#4b5563', fontSize: '12px' }}>
                No data yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Live Attack Log */}
      <div style={{
        backgroundColor: '#16213e',
        border: '1px solid #1f2937',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ color: '#d1d5db', fontSize: '13px',
                       textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Attack Log
          </h3>
          <button
            onClick={fetchData}
            style={{
              backgroundColor: '#1f2937',
              color: '#9ca3af',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {logs.length === 0 ? (
          <p style={{ color: '#4b5563', fontSize: '13px' }}>
            No attacks logged yet. Go to Attack Console and fire some payloads!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse',
                            fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1f2937' }}>
                  {['ID','Time','Endpoint','Technique',
                    'Severity','Payload Preview'].map(h => (
                    <th key={h} style={{ padding: '8px', textAlign: 'left',
                                         color: '#6b7280', fontWeight: '500' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id}
                      style={{ borderBottom: '1px solid #111827' }}>
                    <td style={{ padding: '8px', color: '#4b5563' }}>
                      #{log.id}
                    </td>
                    <td style={{ padding: '8px', color: '#6b7280',
                                 fontFamily: 'monospace' }}>
                      {log.timestamp?.slice(11, 19)}
                    </td>
                    <td style={{ padding: '8px', color: '#a78bfa' }}>
                      {log.endpoint}
                    </td>
                    <td style={{ padding: '8px', color: '#6b7280' }}>
                      {log.technique}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{
                        color: severityColor(log.severity),
                        backgroundColor: severityColor(log.severity) + '20',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {log.severity}
                      </span>
                    </td>
                    <td style={{ padding: '8px', color: '#34d399',
                                 fontFamily: 'monospace',
                                 maxWidth: '200px',
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 whiteSpace: 'nowrap' }}>
                      {log.payload}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}