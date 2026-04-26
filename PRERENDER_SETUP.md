# Prerender Setup

## Coolify Variablen
- `PRERENDER_TOKEN` **(Pflicht)** = dein Prerender.io Token
- `PRERENDER_HOST` *(optional)* = `service.prerender.io`
- `OLLAMA_AUTH_KEY` bleibt wie bisher bestehen

## Cloudflare / Firewall
- Prerender-IP-Ranges und Prerender-User-Agents in Cloudflare/WAF **allowlisten**, damit keine 403/504 oder JS-Challenges entstehen.
- Für Bot-Tests nach Deploy: `curl -A Googlebot https://deine-domain.tld` und im Response auf `x-prerender-requestid` prüfen.
