import { VoiceProvider, VoiceCallRequest, VoiceCallResponse } from "@/types/providers";
import { isSandboxMode, formatProviderId } from "@/services/providerConfig";

export class MockGnaniVoiceProvider implements VoiceProvider {
  name = "Gnani.ai Conversational Voice Rail";
  providerStatus: "SANDBOX_SIMULATED" | "LIVE_CONFIGURED" = isSandboxMode()
    ? "SANDBOX_SIMULATED"
    : "LIVE_CONFIGURED";

  async initiateCall(request: VoiceCallRequest): Promise<VoiceCallResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const rawCall = Date.now().toString(36).toUpperCase();
    const callId = formatProviderId("CALL", rawCall);

    // Call failure simulation (e.g. invalid phone or uncontactable)
    if (request.targetPhone === "+910000000000") {
      return {
        callId,
        status: "NO_ANSWER",
        durationSeconds: 0,
        transcript: [],
        extractedOutcome: {
          confirmedStock: false,
          needsRefill: false,
          escalationTriggered: true,
          symptomMentioned: "Call could not be completed: Recipient phone unreachable.",
        },
      };
    }

    // Symptom escalation scenario - CRITICAL SAFETY BOUNDARY
    if (request.simulateSymptomConcern) {
      const isTelugu = request.language === "te-IN";
      const transcript = isTelugu
        ? [
            {
              speaker: "AGENT" as const,
              text: `నమస్కారం ${request.recipientName} గారు. కేర్‌లూప్ నుండి అర్జున్ తరఫున మాట్లాడుతున్నాము. ఈ ఉదయం మీ ఆరోగ్యం ఎలా ఉంది?`,
              timestamp: "00:03",
            },
            {
              speaker: "PATIENT" as const,
              text: "టాబ్లెట్ వేసుకున్నాను బాబూ, కానీ నిలబడితే బాగా తల తిరుగుతోంది, కళ్ళు చీకట్లు కమ్ముతున్నాయి.",
              timestamp: "00:11",
            },
            {
              speaker: "AGENT" as const,
              text: "అనిత గారు, దయచేసి వెంటనే విశ్రాంతిగా కూర్చోండి. కేర్‌లూప్ ఎటువంటి వైద్య రోగనిర్ధారణ చేయదు. నేను వెంటనే అర్జున్ మరియు మీరాకు అత్యవసర సమాచారం పంపిస్తున్నాను. డాక్టర్ గారితో మాట్లాడించండి.",
              timestamp: "00:23",
            },
          ]
        : [
            {
              speaker: "AGENT" as const,
              text: `Namaskaram ${request.recipientName} garu. This is CareLoop calling on behalf of Arjun. How are you feeling this morning?`,
              timestamp: "00:03",
            },
            {
              speaker: "PATIENT" as const,
              text: "I took my morning medicine, but I am feeling quite dizzy and lightheaded when I stand up today.",
              timestamp: "00:11",
            },
            {
              speaker: "AGENT" as const,
              text: "Anita garu, please sit down comfortably and do not attempt to walk unaided. CareLoop does not diagnose or assess symptoms. I am immediately alerting Arjun and Meera so a doctor can evaluate you.",
              timestamp: "00:22",
            },
          ];

      return {
        callId,
        status: "ESCALATED_TO_HUMAN",
        durationSeconds: 28,
        transcript,
        extractedOutcome: {
          confirmedStock: true,
          needsRefill: false,
          reportedSideEffects: "Dizziness and lightheadedness reported upon standing.",
          escalationTriggered: true,
          symptomMentioned: "Postural dizziness and lightheadedness",
        },
      };
    }

    // Standard routine stock check dialogue (Multilingual: Telugu + Indian English)
    const isTelugu = request.language === "te-IN";
    const transcript = isTelugu
      ? [
          {
            speaker: "AGENT" as const,
            text: `నమస్కారం ${request.recipientName} గారు. కేర్‌లూప్ నుండి కాల్ చేస్తున్నాము. ఉదయం థైరాయిడ్ మందు తీసుకున్నారా?`,
            timestamp: "00:03",
          },
          {
            speaker: "PATIENT" as const,
            text: "అవును, ఉదయాన్నే 6:30 కి ఖాళీ కడుపుతో వేసుకున్నాను. కానీ బాటిల్‌లో ఇంకో 3 టాబ్లెట్లే ఉన్నాయి, అయిపోవచ్చాయి.",
            timestamp: "00:14",
          },
          {
            speaker: "AGENT" as const,
            text: "సరేనండి అనిత గారు. మీ స్టాక్ వివరాలు నోట్ చేసుకున్నాము. మీరా మరియు అర్జున్‌లకు రీఫిల్ ఆర్డర్ వివరాలు పంపిస్తున్నాము. అపోలో ఫార్మసీ వారు రేపటికల్లా డెలివరీ చేస్తారు. నమస్కారం!",
            timestamp: "00:27",
          },
        ]
      : [
          {
            speaker: "AGENT" as const,
            text: `Namaskaram ${request.recipientName} garu. This is CareLoop calling on behalf of Arjun. I hope you are having a pleasant morning.`,
            timestamp: "00:03",
          },
          {
            speaker: "PATIENT" as const,
            text: "Yes, hello. I was just having my morning coffee.",
            timestamp: "00:09",
          },
          {
            speaker: "AGENT" as const,
            text: "We noticed your Thyronorm 50 microgram strip only has about 3 tablets left. Did you manage to take your morning dose before tea today?",
            timestamp: "00:16",
          },
          {
            speaker: "PATIENT" as const,
            text: "Yes, I took it at 6:30 AM on empty stomach. But yes, the bottle is almost empty. Please tell Meera or Arjun to arrange the refill.",
            timestamp: "00:26",
          },
          {
            speaker: "AGENT" as const,
            text: "Understood Anita garu. I am creating a refill request for your coordinators to approve right away. Apollo Pharmacy will deliver it to your Jubilee Hills doorstep. Take care!",
            timestamp: "00:36",
          },
        ];

    return {
      callId,
      status: "COMPLETED",
      durationSeconds: 42,
      transcript,
      extractedOutcome: {
        confirmedStock: false,
        needsRefill: true,
        reportedSideEffects: "None reported. Morning dose adherence confirmed.",
        escalationTriggered: false,
      },
    };
  }

  async getCallStatus(callId: string): Promise<VoiceCallResponse> {
    return {
      callId,
      status: "COMPLETED",
      durationSeconds: 42,
    };
  }

  async escalateToHuman(
    callId: string,
    reason: string
  ): Promise<{ success: boolean; supportTicketId: string; urgentNotificationSent: boolean }> {
    const rawId = Math.abs(
      callId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + reason.length
    ).toString();

    return {
      success: true,
      supportTicketId: formatProviderId("ESC", rawId),
      urgentNotificationSent: true,
    };
  }
}

export const gnaniVoiceProvider: VoiceProvider = new MockGnaniVoiceProvider();
