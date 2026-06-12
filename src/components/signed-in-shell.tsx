"use client";

import { AccountMenu } from "@/components/account-controls";
import { Brand, Shell } from "@/components/app-shell";

export function SignedInShell({
  accountOpen,
  children,
  onAccount,
  onHome,
  onSignOut,
  profile,
  setAccountOpen,
}: {
  accountOpen: boolean;
  children: React.ReactNode;
  onAccount: () => void;
  onHome: () => void;
  onSignOut: () => void;
  profile: { email: string; username: string };
  setAccountOpen: (open: boolean) => void;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Shell>
        <header className="flex items-center justify-between border-b border-slate-200 py-4">
          <button aria-label="Go home" className="text-left" onClick={onHome} type="button">
            <Brand />
          </button>
          <AccountMenu
            open={accountOpen}
            profile={profile}
            setOpen={setAccountOpen}
            onAccount={onAccount}
            onSignOut={onSignOut}
          />
        </header>
        {children}
      </Shell>
    </main>
  );
}
