import React from "react";
import { CareContinuityScreen } from "@/features/continuity/CareContinuityScreen";

export const metadata = {
  title: "Care Continuity — CareLoop",
  description: "Single point of failure protection: transfer operational care responsibility seamlessly when the primary caregiver is unavailable.",
};

export default function ContinuityPage() {
  return (
    <div className="py-2">
      <CareContinuityScreen />
    </div>
  );
}
