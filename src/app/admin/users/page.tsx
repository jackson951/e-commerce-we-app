"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { AdminUser, AdminUserUpdatePayload } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Mail,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

function isUserEnabled(user: AdminUser) {
  if (typeof user.enabled === "boolean") return user.enabled;
  if (typeof user.accountNonLocked === "boolean") return user.accountNonLocked;
  return true;
}

const DEFAULT_ROLES = ["ROLE_CUSTOMER", "ROLE_ADMIN"];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100";

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role.toLowerCase().includes("admin");
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
      isAdmin ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
    }`}>
      {isAdmin && <ShieldCheck className="h-3 w-3" />}
      {role.replace("ROLE_", "")}
    </span>
  );
}

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();

  const [users, setUsers]               = useState<AdminUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [message, setMessage]           = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [query, setQuery]               = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
    roles: [] as string[],
    enabled: true,
    phone: "",
    address: "",
  });

  function notify(text: string, type: "success" | "error" = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    api
      .adminListUsers(token)
      .then(setUsers)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [token]);

  const roleOptions = useMemo(() => {
    const all = new Set<string>(DEFAULT_ROLES);
    users.forEach((u) => (u.roles || []).forEach((r) => all.add(r)));
    return [...all].sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.roles?.join(" ").toLowerCase().includes(q)
    );
  }, [query, users]);

  function startEdit(entry: AdminUser) {
    setError(null);
    setEditingId(entry.id);
    setForm({
      email: entry.email || "",
      fullName: entry.fullName || "",
      password: "",
      roles: entry.roles || [],
      enabled: isUserEnabled(entry),
      phone: entry.phone || "",
      address: entry.address || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setSavingEditId(null);
    setForm({ email: "", fullName: "", password: "", roles: [], enabled: true, phone: "", address: "" });
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!token || !editingId) return;
    if (!form.email.trim() || !form.fullName.trim()) { notify("Email and full name are required.", "error"); return; }
    if (!form.roles.length) { notify("At least one role is required.", "error"); return; }

    const payload: AdminUserUpdatePayload = {
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      roles: form.roles,
      enabled: form.enabled,
      ...(form.password.trim() ? { password: form.password.trim() } : {}),
      ...(form.phone.trim()    ? { phone: form.phone.trim() }        : {}),
      ...(form.address.trim()  ? { address: form.address.trim() }    : {}),
    };

    setSavingEditId(editingId);
    setError(null);
    try {
      const updated = await api.adminUpdateUser(token, editingId, payload);
      setUsers((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...updated } : u)));
      notify("User updated successfully.");
      cancelEdit();
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setSavingEditId(null);
    }
  }

  async function setAccess(target: AdminUser, enabled: boolean) {
    if (!token) return;
    setPendingUserId(target.id);
    setError(null);
    try {
      const updated = await api.adminSetUserAccess(token, target.id, enabled);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, ...updated, enabled } : u)));
      notify(`Account ${enabled ? "enabled" : "disabled"}.`);
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setPendingUserId(null);
    }
  }

  const enabledCount  = users.filter(isUserEnabled).length;
  const disabledCount = users.length - enabledCount;

  return (
    <RequireAdmin>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Users</h1>
            <p className="text-sm text-slate-500">Manage account details, roles, and access for every user.</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email or role…"
              className={inputClass + " pl-10"}
            />
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <Users className="h-4 w-4 text-rose-500" />
            {users.length} total users
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {enabledCount} active
          </div>
          {disabledCount > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
              {disabledCount} disabled
            </div>
          )}
        </div>

        {/* Toast */}
        {message && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}>
            {message.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
            Loading users…
          </div>
        )}

        {/* Error */}
        {error && !message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Edit form */}
        {editingId && (
          <form
            onSubmit={saveEdit}
            className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-rose-500" />
                <h2 className="font-bold text-slate-900">Edit user</h2>
              </div>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">Full name</span>
                <input required className={inputClass} value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">Email address</span>
                <input required type="email" className={inputClass} value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">New password <span className="font-normal text-slate-400">(optional)</span></span>
                <input type="password" className={inputClass} value={form.password}
                  placeholder="Leave blank to keep current"
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">Phone <span className="font-normal text-slate-400">(optional)</span></span>
                <input className={inputClass} value={form.phone} placeholder="+27 82 123 4567"
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
                <span className="font-medium text-slate-700">Address <span className="font-normal text-slate-400">(optional)</span></span>
                <textarea className={inputClass + " resize-none"} rows={2} value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
              </label>
            </div>

            {/* Roles */}
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Roles</p>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((role) => {
                  const checked = form.roles.includes(role);
                  return (
                    <label
                      key={role}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        checked
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            roles: e.target.checked ? [...p.roles, role] : p.roles.filter((r) => r !== role),
                          }))
                        }
                      />
                      {role.replace("ROLE_", "")}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Account status */}
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-rose-500"
                checked={form.enabled}
                onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))}
              />
              <span className="font-medium text-slate-700">Account active</span>
              <span className="ml-auto text-xs text-slate-400">{form.enabled ? "User can sign in" : "User is locked out"}</span>
            </label>

            <button
              disabled={savingEditId === editingId}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {savingEditId === editingId ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving…</>
              ) : "Save changes"}
            </button>
          </form>
        )}

        {/* User list */}
        {!loading && !error && (
          <>
            {filteredUsers.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <Users className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">No users found</p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {filteredUsers.length > 0 && (
                <div className="border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                </div>
              )}

              <ul className="divide-y divide-slate-100">
                {filteredUsers.map((entry) => {
                  const enabled       = isUserEnabled(entry);
                  const isCurrentUser = currentUser?.id === entry.id;
                  const isPending     = pendingUserId === entry.id;
                  const isBeingEdited = editingId === entry.id;

                  return (
                    <li
                      key={entry.id}
                      className={`px-5 py-4 transition-colors ${isBeingEdited ? "bg-rose-50" : ""}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        {/* Info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            <UserRound className="h-5 w-5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-slate-900">{entry.fullName || "—"}</p>
                              {isCurrentUser && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600">You</span>
                              )}
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                              }`}>
                                {enabled ? "Active" : "Disabled"}
                              </span>
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{entry.email}</span>
                              {entry.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{entry.phone}</span>}
                              {entry.createdAt && <span>Joined {formatDate(entry.createdAt)}</span>}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {(entry.roles || []).map((role) => <RoleBadge key={role} role={role} />)}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => startEdit(entry)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-white transition-all"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>

                          {enabled ? (
                            <button
                              onClick={() => setAccess(entry, false)}
                              disabled={isPending || isCurrentUser}
                              title={isCurrentUser ? "You can't disable your own account" : undefined}
                              className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isPending ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" /> : null}
                              {isCurrentUser ? "Can't disable self" : isPending ? "Updating…" : "Disable"}
                            </button>
                          ) : (
                            <button
                              onClick={() => setAccess(entry, true)}
                              disabled={isPending}
                              className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isPending ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" /> : null}
                              {isPending ? "Updating…" : "Enable"}
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </RequireAdmin>
  );
}