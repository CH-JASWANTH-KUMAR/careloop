"use client";

import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  User,
  Share2,
  ArrowRight,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StructuredAuthorizationData } from "@/types/agent";

interface AuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: StructuredAuthorizationData;
  approverName: string;
  onApprove: () => void;
  onReject: () => void;
  onEdit?: () => void;
  onAskLater?: () => void;
  isLoading?: boolean;
}

export function AuthorizationModal({
  isOpen,
  onClose,
  title,
  data,
  approverName,
  onApprove,
  onReject,
  onEdit,
  onAskLater,
  isLoading = false,
}: AuthorizationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="CareLoop never executes sensitive actions or financial transactions without explicit human sign-off."
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* WHAT WILL HAPPEN */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            What will happen
          </span>
          <p className="font-semibold text-slate-900 text-sm leading-snug">
            {data.whatWillHappen}
          </p>
        </div>

        {/* 2-Column Details: WHY & WHO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Why this is requested
            </span>
            <p className="text-slate-700 leading-relaxed">{data.why}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" /> Who it affects
            </span>
            <p className="font-semibold text-slate-900">{data.whoItAffects}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Approver on file: <strong className="text-slate-700">{approverName}</strong>
            </p>
          </div>
        </div>

        {/* Cost & Data Shared */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.cost !== undefined && (
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Authorized Cost
              </span>
              <p className="text-base font-bold font-mono text-emerald-950">
                ₹{data.cost.toFixed(2)} INR
              </p>
              <span className="text-[10px] text-slate-500">
                Protected via Pine Labs 2FA
              </span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-slate-500" /> Data being shared
            </span>
            <p className="text-slate-700 leading-relaxed">{data.dataBeingShared}</p>
          </div>
        </div>

        {/* WHAT HAPPENS NEXT */}
        <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5 text-sky-700" /> What happens next
          </span>
          <p className="text-slate-800 leading-relaxed">{data.whatHappensNext}</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onAskLater && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onAskLater}
                className="text-xs text-slate-500"
              >
                Ask me later
              </Button>
            )}
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="text-xs"
              >
                Edit Parameters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReject}
              className="text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              onClick={onApprove}
              className="bg-slate-900 text-white gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sign &amp; Approve</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
