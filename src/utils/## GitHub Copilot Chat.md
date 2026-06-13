## GitHub Copilot Chat

- Extension: 0.46.2 (prod)
- VS Code: 1.118.1 (034f571df509819cc10b0c8129f66ef77a542f0e)
- OS: win32 10.0.19045 x64
- GitHub Account: oyebamiji2006

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 140.82.121.5 (28 ms)
- DNS ipv6 Lookup: Error (704 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (3 ms)
- Electron fetch (configured): timed out after 10 seconds
- Node.js https: timed out after 10 seconds
- Node.js fetch: timed out after 10 seconds

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.114.21 (790 ms)
- DNS ipv6 Lookup: Error (1697 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (68 ms)
- Electron fetch (configured): HTTP 200 (4896 ms)
- Node.js https: HTTP 200 (7674 ms)
- Node.js fetch: HTTP 200 (4395 ms)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: 4.225.11.192 (878 ms)
- DNS ipv6 Lookup: Error (733 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (26 ms)
- Electron fetch (configured): HTTP 200 (6292 ms)
- Node.js https: timed out after 10 seconds
- Node.js fetch: HTTP 200 (2391 ms)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (624 ms)
Connecting to https://dc.services.visualstudio.com: HTTP 404 (5614 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (3720 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: timed out after 10 seconds
Connecting to https://default.exp-tas.com: HTTP 400 (8068 ms)

Number of system certificates: 70

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).