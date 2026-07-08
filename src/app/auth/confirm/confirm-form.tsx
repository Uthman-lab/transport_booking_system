"use client";

import { confirmAction } from "@/app/auth/confirm/actions";
import { SubmitButton } from "@/components/ui/submit-button";

type ConfirmFormProps = {
  tokenHash: string;
  code: string;
  type: string;
  next: string;
  settingPassword: boolean;
};

export function ConfirmForm({
  tokenHash,
  code,
  type,
  next,
  settingPassword,
}: ConfirmFormProps) {
  return (
    <>
      <h1 className="text-lg font-semibold">You&apos;re almost there</h1>
      <p className="mt-2 text-sm text-muted">
        Click continue to finish and{" "}
        {settingPassword ? "set your password" : "sign in"}.
      </p>
      <form action={confirmAction} className="mt-6">
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next} />
        <SubmitButton
          pendingText="Verifying…"
          className="w-full rounded-md"
        >
          Continue
        </SubmitButton>
      </form>
    </>
  );
}
