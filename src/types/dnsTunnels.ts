// A MasterDnsVPN server run by the panel (backend: dns_tunnels table).
export interface DnsTunnelStatus {
  running: boolean
  pid?: number
  restarts: number
  lastError?: string
  since?: number
}

export interface DnsTunnel {
  id: number
  tag: string
  enable: boolean
  domain: string
  listen: string
  port: number
  method: number
  key: string
  inbound: string
  client: string
  options?: Record<string, unknown> | null
  status?: DnsTunnelStatus
}

// MasterDnsVPN DATA_ENCRYPTION_METHOD values.
export const DnsTunnelMethods = [
  { title: 'None', value: 0 },
  { title: 'XOR', value: 1 },
  { title: 'ChaCha20', value: 2 },
  { title: 'AES-128-GCM', value: 3 },
  { title: 'AES-192-GCM', value: 4 },
  { title: 'AES-256-GCM', value: 5 },
]

export function createDnsTunnel(tag: string): DnsTunnel {
  return {
    id: 0,
    tag,
    enable: true,
    domain: '',
    listen: '',
    port: 53,
    method: 5,
    key: '',
    inbound: '',
    client: '',
    options: null,
  }
}
