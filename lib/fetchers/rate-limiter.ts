type RateLimit = {
  lastRequest: number;
  requestCount: number;
  ipCounts: Map<string, number>;
};

export class RateLimiter {
  private readonly maxRequestsPerIp: number;
  private limits = new Map<string, RateLimit>();

  constructor(
    private readonly maxRequestsPerWindow: number = 10,
    private readonly windowMs: number = 60000,
    private readonly getCurrentTime: () => number = Date.now,
    maxRequestsPerIp: number = 5
  ) {
    this.maxRequestsPerIp = maxRequestsPerIp;
  }

  checkLimit(url: string, ip?: string): boolean {
    const domain = this.getDomain(url);
    const now = this.getCurrentTime();
    const limit = this.limits.get(domain);

    if (ip && (limit?.ipCounts?.get(ip) ?? 0) >= this.maxRequestsPerIp) {
      return false;
    }

    if (!limit) {
      this.limits.set(domain, {
        lastRequest: now,
        requestCount: 1,
        ipCounts: new Map(),
      });
      return true;
    }

    if (now - limit.lastRequest >= this.windowMs) {
      this.limits.set(domain, {
        lastRequest: now,
        requestCount: 1,
        ipCounts: new Map(),
      });
      return true;
    }

    if (limit.requestCount >= this.maxRequestsPerWindow) {
      return false;
    }

    this.limits.set(domain, {
      lastRequest: limit.lastRequest,
      requestCount: limit.requestCount + 1,
      ipCounts: limit.ipCounts,
    });

    if (ip) {
      const currentIpCount = limit.ipCounts.get(ip) || 0;
      limit.ipCounts.set(ip, currentIpCount + 1);
    }

    return true;
  }

  private getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  clearLimits(): void {
    this.limits.clear();
  }
}
