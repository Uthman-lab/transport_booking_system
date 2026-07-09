"use client";

import { useActionState } from "react";
import { bulkInviteAction, type BulkInviteState } from "@/app/admin/users/actions";
import { SmtpNotice } from "@/components/admin/smtp-notice";
import { ActionButton } from "@/components/ui/action-button";

const initialState: BulkInviteState = { status: "idle" };

const buttonClass =
  "self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60";
const secondaryButton =
  "rounded-md border border-card-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background disabled:opacity-60";

// Keep in sync with the columns validateBulkRows / the action's header mapping accept.
const COLUMNS: { name: string; required: boolean; notes: string }[] = [
  { name: "fullName", required: true, notes: "Passenger's full name" },
  { name: "email", required: true, notes: "Must be valid, unique, and not already registered" },
  { name: "role", required: false, notes: "student, staff, or admin (blank = student)" },
  { name: "studentId", required: false, notes: "Optional" },
  { name: "phone", required: false, notes: "Optional" },
];

const TEMPLATE_CSV = [
  "fullName,email,role,studentId,phone",
  "Ama Mensah,ama@example.com,student,UEB1234,0201234567",
  "Kofi Boateng,kofi@example.com,staff,,0209876543",
  "Yaa Owusu,yaa@example.com,admin,,",
].join("\n");

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function BulkInviteForm({
  configured,
  mailerConfigured,
}: {
  configured: boolean;
  mailerConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(bulkInviteAction, initialState);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-card-border bg-card p-6"
    >
      <div>
        <h3 className="text-base font-semibold">Bulk invite from a file</h3>
        <p className="mt-1 text-sm text-muted">
          Upload a <code>.csv</code> or <code>.xlsx</code>. The whole file is
          validated first — if every row is valid, all accounts are created
          together (all-or-nothing). Otherwise nothing is created and you get a
          list of what to fix.
        </p>
      </div>

      {/* Expected format */}
      <div className="rounded-lg border border-card-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Expected format
        </p>
        <p className="mt-1 text-xs text-muted">
          First row must be the header. Columns (any order, case-insensitive):
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="pb-2 pr-4 font-medium">Column</th>
                <th className="pb-2 pr-4 font-medium">Required</th>
                <th className="pb-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {COLUMNS.map((c) => (
                <tr key={c.name} className="align-top">
                  <td className="py-1 pr-4 font-mono text-xs">{c.name}</td>
                  <td className="py-1 pr-4">
                    {c.required ? (
                      <span className="font-medium">Required</span>
                    ) : (
                      <span className="text-muted">Optional</span>
                    )}
                  </td>
                  <td className="py-1 text-muted">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() => downloadFile("ubbs-invite-template.csv", TEMPLATE_CSV)}
          className={`${secondaryButton} mt-3`}
        >
          Download template
        </button>
      </div>

      {!configured ? (
        <p className="rounded-md border border-card-border bg-background px-3 py-2 text-xs text-muted">
          Invites are disabled until <code>SUPABASE_SERVICE_ROLE_KEY</code> is set
          on the server.
        </p>
      ) : null}

      {configured ? <SmtpNotice configured={mailerConfigured} /> : null}

      <input
        type="file"
        name="file"
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        required
        disabled={!configured}
        className="text-sm file:mr-3 file:rounded-md file:border file:border-card-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
      />

      <ActionButton
        pending={pending}
        pendingText="Validating…"
        disabled={!configured}
        className={buttonClass}
      >
        Validate & upload
      </ActionButton>

      {/* Validation failed — nothing created */}
      {state.status === "invalid" ? (
        <div className="flex flex-col gap-3">
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            {state.message}
          </p>
          {state.errors && state.errors.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-red-300 dark:border-red-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border text-left text-muted">
                    <th className="px-3 py-2 font-medium">Row</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Problem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {state.errors.map((e, i) => (
                    <tr key={`${e.rowNumber}-${i}`}>
                      <td className="px-3 py-2 text-muted">{e.rowNumber}</td>
                      <td className="px-3 py-2">{e.email || "—"}</td>
                      <td className="px-3 py-2 text-red-600 dark:text-red-400">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Generic error (e.g. commit rolled back, unreadable file) */}
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      {/* Success — everything created */}
      {state.status === "success" ? (
        <div className="flex flex-col gap-3">
          <p role="status" className="text-sm font-medium text-green-700 dark:text-green-400">
            {state.message}
          </p>
          {state.csv ? (
            <button
              type="button"
              onClick={() => downloadFile("ubbs-invite-results.csv", state.csv!)}
              className={secondaryButton}
            >
              Download results (with invite links)
            </button>
          ) : null}
          {state.results && state.results.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-card-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border text-left text-muted">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {state.results.map((r) => (
                    <tr key={r.rowNumber}>
                      <td className="px-3 py-2 text-muted">{r.rowNumber}</td>
                      <td className="px-3 py-2">{r.email}</td>
                      <td className="px-3 py-2">{r.role ?? "—"}</td>
                      <td className="px-3 py-2 text-green-700 dark:text-green-400">Invited</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
