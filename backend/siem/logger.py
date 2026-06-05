import json
import os
from datetime import datetime
from collections import defaultdict, Counter

LOG_PATH = 'logs/attacks.json'

class AttackLogger:
    def __init__(self):
        os.makedirs('logs', exist_ok=True)
        if not os.path.exists(LOG_PATH):
            with open(LOG_PATH, 'w') as f:
                json.dump([], f)

    def log(self, endpoint, payload, output,
            blocked=False, technique=None):
        entry = {
            'id':             self._next_id(),
            'timestamp':      datetime.now().isoformat(),
            'endpoint':       endpoint,
            'payload':        payload,
            'output_preview': output[:200] if output else '',
            'blocked':        blocked,
            'technique':      technique or 'raw',
            'severity':       self._classify(payload, blocked)
        }
        logs = self._read()
        logs.append(entry)
        with open(LOG_PATH, 'w') as f:
            json.dump(logs, f, indent=2)
        return entry

    def get_recent(self, limit=50):
        logs = self._read()
        return logs[-limit:][::-1]

    def get_stats(self):
        logs = self._read()
        if not logs:
            return self._empty_stats()

        by_technique = defaultdict(int)
        by_endpoint  = defaultdict(int)
        by_severity  = defaultdict(int)
        success = blocked = 0

        for l in logs:
            by_technique[l.get('technique', 'raw')] += 1
            by_endpoint [l.get('endpoint',  '?')]   += 1
            by_severity [l.get('severity',  'Low')] += 1
            if l.get('blocked'):
                blocked += 1
            else:
                success += 1

        return {
            'total':        len(logs),
            'success':      success,
            'blocked':      blocked,
            'by_technique': dict(by_technique),
            'by_endpoint':  dict(by_endpoint),
            'by_severity':  dict(by_severity),
            'timeline':     self._timeline(logs)
        }

    def _classify(self, payload, blocked):
        if blocked:
            return 'Blocked'
        for kw in ['passwd', 'shadow', 'id_rsa', 'whoami', '/etc']:
            if kw in payload:
                return 'Critical'
        if any(c in payload for c in [';', '&&', '||', '|']):
            return 'High'
        return 'Medium'

    def _timeline(self, logs):
        dates = [l['timestamp'][:10] for l in logs]
        return [{'date': d, 'count': c}
                for d, c in sorted(Counter(dates).items())]

    def _read(self):
        with open(LOG_PATH) as f:
            return json.load(f)

    def _next_id(self):
        return len(self._read()) + 1

    def _empty_stats(self):
        return {
            'total': 0, 'success': 0, 'blocked': 0,
            'by_technique': {}, 'by_endpoint': {},
            'by_severity':  {}, 'timeline':    []
        }