/**
 * CareLoop Provider Configuration & Mode Controller
 *
 * Enforces strict separation between Sandbox/Simulated executions and Live Provider Rails.
 * Never misrepresents simulation as real-world financial capture, telephonic dispatch, or courier movement.
 */

export type ProviderMode = "sandbox" | "live";

export interface ProviderStatusInfo {
  mode: ProviderMode;
  isSandbox: boolean;
  badgeLabel: string;
  badgeDescription: string;
  providers: {
    gnani: {
      name: string;
      status: "SANDBOX_SIMULATED" | "LIVE_CONFIGURED";
      configured: boolean;
      endpoint: string;
      supportedLanguages: string[];
    };
    pineLabs: {
      name: string;
      status: "SANDBOX_SIMULATED" | "LIVE_CONFIGURED";
      configured: boolean;
      merchantId: string;
      currency: string;
    };
    delhivery: {
      name: string;
      status: "SANDBOX_SIMULATED" | "LIVE_CONFIGURED";
      configured: boolean;
      hubCode: string;
      serviceType: string;
    };
  };
}

export function getProviderMode(): ProviderMode {
  // Respect environment variable if set to 'live'
  const envMode =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_CARELOOP_PROVIDER_MODE ||
        process.env.CARELOOP_PROVIDER_MODE
      : "sandbox";

  return envMode?.toLowerCase() === "live" ? "live" : "sandbox";
}

export function isSandboxMode(): boolean {
  return getProviderMode() === "sandbox";
}

/**
 * Format provider reference IDs with clear sandbox attribution when not running in live mode.
 * Example: 'SANDBOX-PL-AUTH-90812' vs 'PL-AUTH-90812'
 */
export function formatProviderId(prefix: string, rawId: string): string {
  if (isSandboxMode()) {
    const cleanId = rawId.replace(/^SANDBOX-/, "");
    return `SANDBOX-${prefix}-${cleanId}`;
  }
  return `${prefix}-${rawId}`;
}

export function getProviderStatusInfo(): ProviderStatusInfo {
  const mode = getProviderMode();
  const isSandbox = mode === "sandbox";

  const hasGnaniKey = Boolean(
    typeof process !== "undefined" &&
      (process.env.GNANI_API_KEY || process.env.NEXT_PUBLIC_GNANI_API_KEY)
  );

  const hasPineLabsKey = Boolean(
    typeof process !== "undefined" &&
      (process.env.PINELABS_MERCHANT_KEY || process.env.NEXT_PUBLIC_PINELABS_MERCHANT_KEY)
  );

  const hasDelhiveryToken = Boolean(
    typeof process !== "undefined" &&
      (process.env.DELHIVERY_API_TOKEN || process.env.NEXT_PUBLIC_DELHIVERY_API_TOKEN)
  );

  return {
    mode,
    isSandbox,
    badgeLabel: isSandbox ? "SANDBOX / SIMULATED" : "LIVE RAILS CONNECTED",
    badgeDescription: isSandbox
      ? "Simulated sandbox execution with verified transaction lifecycle and mock identifiers."
      : "Connected to verified live enterprise API endpoints.",
    providers: {
      gnani: {
        name: "Gnani.ai Voice Rail",
        status: !isSandbox && hasGnaniKey ? "LIVE_CONFIGURED" : "SANDBOX_SIMULATED",
        configured: !isSandbox && hasGnaniKey,
        endpoint: "https://api.gnani.ai/v1/voice/outbound",
        supportedLanguages: ["Telugu (te-IN)", "Indian English (en-IN)", "Hindi (hi-IN)"],
      },
      pineLabs: {
        name: "Pine Labs Healthcare Gateway",
        status: !isSandbox && hasPineLabsKey ? "LIVE_CONFIGURED" : "SANDBOX_SIMULATED",
        configured: !isSandbox && hasPineLabsKey,
        merchantId: isSandbox ? "MERC-SANDBOX-HYD-0042" : (process.env.PINELABS_MERCHANT_ID || "LIVE-MERC-0042"),
        currency: "INR (₹)",
      },
      delhivery: {
        name: "Delhivery Healthcare Express Logistics",
        status: !isSandbox && hasDelhiveryToken ? "LIVE_CONFIGURED" : "SANDBOX_SIMULATED",
        configured: !isSandbox && hasDelhiveryToken,
        hubCode: "HYD-BEGUMPET-COLDCHAIN-01",
        serviceType: "Surface / Temperature-Controlled Cold Chain",
      },
    },
  };
}
