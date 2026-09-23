import {
  PaymentProvider,
  PaymentAuthRequest,
  PaymentAuthResponse,
  PaymentReceipt,
} from "@/types/providers";
import { isSandboxMode, formatProviderId } from "@/services/providerConfig";

export class MockPineLabsPaymentProvider implements PaymentProvider {
  name = "Pine Labs Plural Healthcare Payment Gateway";
  providerStatus: "SANDBOX_SIMULATED" | "LIVE_CONFIGURED" = isSandboxMode()
    ? "SANDBOX_SIMULATED"
    : "LIVE_CONFIGURED";

  private authorizations: Map<string, PaymentAuthResponse> = new Map();

  async createAuthorization(request: PaymentAuthRequest): Promise<PaymentAuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const isSandbox = isSandboxMode();
    const timestamp = new Date().toISOString();

    if (request.amount > request.spendingLimit) {
      const failedAuthId = formatProviderId("AUTH", Math.random().toString(36).substring(2, 9).toUpperCase());
      const errorRecord: PaymentAuthResponse = {
        authorizationId: failedAuthId,
        status: "EXCEEDED_LIMIT",
        amount: request.amount,
        spendingLimit: request.spendingLimit,
        approverId: request.approverId,
        merchantName: request.merchantName,
        timestamp,
        isSandboxSimulated: isSandbox,
        errorMessage: `Requested amount ₹${request.amount} exceeds family spending threshold limit of ₹${request.spendingLimit}`,
        auditTrail: [
          {
            step: `Authorization declined: Amount ₹${request.amount} exceeds ceiling ₹${request.spendingLimit}`,
            timestamp,
          },
        ],
      };
      this.authorizations.set(failedAuthId, errorRecord);
      throw new Error(
        `Requested amount ₹${request.amount} exceeds family spending threshold limit of ₹${request.spendingLimit}`
      );
    }

    const rawId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const authorizationId = formatProviderId("AUTH", rawId);

    const authRecord: PaymentAuthResponse = {
      authorizationId,
      status: "AUTHORIZATION_REQUESTED",
      amount: request.amount,
      spendingLimit: request.spendingLimit,
      approverId: request.approverId,
      merchantName: request.merchantName,
      timestamp,
      isSandboxSimulated: isSandbox,
      auditTrail: [
        {
          step: `Consent requested for ₹${request.amount} at ${request.merchantName} (${request.purpose})`,
          timestamp,
        },
      ],
    };

    this.authorizations.set(authorizationId, authRecord);
    return authRecord;
  }

  async capturePayment(
    authorizationId: string,
    securityPinOrOtp = "1234"
  ): Promise<{ success: boolean; transactionId: string; timestamp: string; receipt: PaymentReceipt }> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const isSandbox = isSandboxMode();
    const now = new Date().toISOString();
    const rawTxn = Math.floor(10000000 + Math.random() * 90000000).toString();
    const txnId = formatProviderId("TXN", rawTxn);
    const rawRec = Math.random().toString(36).substring(2, 8).toUpperCase();
    const receiptId = formatProviderId("REC", rawRec);

    const auth = this.authorizations.get(authorizationId);

    if (securityPinOrOtp === "0000") {
      if (auth) {
        auth.status = "DECLINED";
        auth.errorMessage = "Payment 2FA verification failed or cancelled by user.";
        auth.auditTrail.push({
          step: "Consent declined by user during OTP verification.",
          timestamp: now,
        });
      }
      throw new Error("Payment declined during 2FA authorization verification.");
    }

    const receipt: PaymentReceipt = {
      receiptId,
      transactionId: txnId,
      merchantName: auth?.merchantName || "Apollo Pharmacy Jubilee Hills",
      amount: auth?.amount || 485,
      currency: "INR",
      paymentMethod: "Pine Labs UPI / NetBanking Gateway (Pre-Authorized)",
      paidAt: now,
      authorizedBy: auth?.approverId === "mem-arjun" ? "Arjun Rao (Primary Coordinator)" : "Meera Rao (Care Coordinator)",
      patientName: "Anita Rao",
      itemDescription: "Thyronorm 50mcg (60 days supply)",
      isSandboxSimulated: isSandbox,
      sandboxNotice: isSandbox
        ? "[SANDBOX / SIMULATED] Simulated payment authorization verified via Pine Labs test harness."
        : undefined,
    };

    if (auth) {
      auth.status = "RECEIPT_AVAILABLE";
      auth.approvalToken = formatProviderId("TOK", Math.random().toString(36).substring(2, 8).toUpperCase());
      auth.receipt = receipt;
      auth.auditTrail.push({
        step: `Captured and confirmed via 2FA pin ${securityPinOrOtp.replace(/./g, "*")}`,
        timestamp: now,
      });
      this.authorizations.set(authorizationId, auth);
    }

    return {
      success: true,
      transactionId: txnId,
      timestamp: now,
      receipt,
    };
  }

  async getPaymentStatus(authorizationId: string): Promise<PaymentAuthResponse> {
    const auth = this.authorizations.get(authorizationId);
    if (auth) return auth;

    const isSandbox = isSandboxMode();
    return {
      authorizationId,
      status: "RECEIPT_AVAILABLE",
      amount: 485,
      spendingLimit: 1500,
      approverId: "mem-arjun",
      merchantName: "Apollo Pharmacy Jubilee Hills",
      timestamp: new Date().toISOString(),
      isSandboxSimulated: isSandbox,
      auditTrail: [{ step: "Authorized successfully via Pine Labs", timestamp: new Date().toISOString() }],
    };
  }
}

export const pineLabsPaymentProvider: PaymentProvider = new MockPineLabsPaymentProvider();
