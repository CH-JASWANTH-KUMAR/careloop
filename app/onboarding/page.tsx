import React from "react";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";

export const metadata = {
  title: "Family Onboarding — CareLoop",
  description: "Set up a new family care group, assign roles, configure explicit permissions, and activate external care rails.",
};

export default function OnboardingPage() {
  return (
    <div className="py-2">
      <OnboardingWizard />
    </div>
  );
}
