"use client";

import {
  CaretDownIcon,
  GearSixIcon,
  SignOutIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { FormEvent } from "react";

import { normalizeUsername } from "@/lib/public-ids";

type Profile = {
  email: string;
  username: string;
};

export function AccountMenu({
  open,
  profile,
  setOpen,
  onAccount,
  onSignOut,
}: {
  open: boolean;
  profile: Profile;
  setOpen: (open: boolean) => void;
  onAccount: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="relative">
      <button className="secondary-button" onClick={() => setOpen(!open)} type="button">
        <UserCircleIcon className="size-5" aria-hidden="true" />
        <span className="max-w-40 truncate">
          {profile.username ? `${profile.username}.modulate.news` : profile.email}
        </span>
        <CaretDownIcon className="size-4" aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-xs border border-slate-200 bg-white p-2 text-left shadow-[0_18px_50px_rgb(15_23_42_/_0.14)]">
          <div className="px-2 py-2">
            <p className="truncate text-sm font-semibold">{profile.email}</p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {profile.username ? `${profile.username}.modulate.news` : "Choose a username"}
            </p>
          </div>
          <button
            className="flex w-full items-center gap-2 rounded-xs px-2 py-2 text-sm font-semibold text-slate-700 transition hover:bg-mist-50"
            onClick={onAccount}
            type="button"
          >
            <GearSixIcon className="size-4" aria-hidden="true" />
            Account
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-xs px-2 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            onClick={onSignOut}
            type="button"
          >
            <SignOutIcon className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AccountScreen({
  accountMessage,
  savingAccount,
  username,
  setUsername,
  onBack,
  onSave,
}: {
  accountMessage: string;
  savingAccount: boolean;
  username: string;
  setUsername: (username: string) => void;
  onBack: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="max-w-xl py-8">
      <button
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
        onClick={onBack}
        type="button"
      >
        My Episodes
      </button>
      <p className="text-sm font-semibold uppercase text-mist-700">Account</p>
      <h1 className="font-heading mt-2 text-4xl font-black">Choose username</h1>
      <p className="mt-3 text-slate-600">
        This becomes your public episode subdomain when you make an episode public.
      </p>
      <form className="mt-6 grid gap-3" onSubmit={onSave}>
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Username</span>
          <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-xs border border-slate-300/80 bg-gradient-to-br from-white to-mist-50/80 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.88)] transition focus-within:border-mist-500/70 focus-within:shadow-[0_0_0_3px_rgb(92_122_145_/_0.10),inset_0_1px_0_rgb(255_255_255_/_0.88)]">
            <input
              className="h-12 min-w-0 bg-transparent px-3 text-base text-slate-950 outline-none placeholder:text-slate-400"
              onChange={(event) => setUsername(normalizeUsername(event.target.value))}
              placeholder="alex"
              value={username}
            />
            <span className="flex items-center border-l border-slate-200/90 bg-white/52 px-3 text-sm text-mist-600">
              .modulate.news
            </span>
          </div>
        </label>
        <button className="primary-button h-12 w-full sm:w-auto" disabled={savingAccount}>
          {savingAccount ? "Saving..." : "Save username"}
        </button>
        {accountMessage ? (
          <p className={accountMessage === "Saved." ? "text-sm text-mist-700" : "text-sm text-red-600"}>
            {accountMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}
