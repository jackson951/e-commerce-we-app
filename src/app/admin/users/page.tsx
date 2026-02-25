"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { AdminUser, AdminUserUpdatePayload } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { FormEvent, useEffect, useMemo, useState } from "react";

function isUserEnabled(user: AdminUser) {
  if (typeof user.enabled === "boolean") return user.enabled;
  if (typeof user.accountNonLocked === "boolean") return user.accountNonLocked;
  return true;
}

const DEFAULT_ROLES = ["ROLE_CUSTOMER", "ROLE_ADMIN"];

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingEditId, setSavingEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
    roles: [] as string[],
    enabled: true,
    phone: "",
    address: ""
  });

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
    const fromUsers = new Set<string>();
    users.forEach((entry) => (entry.roles || []).forEach((role) => fromUsers.add(role)));
    DEFAULT_ROLES.forEach((role) => fromUsers.add(role));
    return [...fromUsers].sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (entry) =>
        entry.fullName?.toLowerCase().includes(q) ||
        entry.email?.toLowerCase().includes(q) ||
        entry.roles?.join(" ").toLowerCase().includes(q)
    );
  }, [query, users]);

  function startEdit(entry: AdminUser) {
    setMessage(null);
    setError(null);
    setEditingId(entry.id);
    setForm({
      email: entry.email || "",
      fullName: entry.fullName || "",
      password: "",
      roles: entry.roles || [],
      enabled: isUserEnabled(entry),
      phone: entry.phone || "",
      address: entry.address || ""
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setSavingEditId(null);
    setForm({
      email: "",
      fullName: "",
      password: "",
      roles: [],
      enabled: true,
      phone: "",
      address: ""
    });
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!token || !editingId) return;
    if (!form.email.trim() || !form.fullName.trim()) {
      setError("Email and full name are required.");
      return;
    }
    if (!form.roles.length) {
      setError("At least one role is required.");
      return;
    }

    const payload: AdminUserUpdatePayload = {
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      roles: form.roles,
      enabled: form.enabled,
      ...(form.password.trim() ? { password: form.password.trim() } : {}),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.address.trim() ? { address: form.address.trim() } : {})
    };

    setSavingEditId(editingId);
    setError(null);
    setMessage(null);
    try {
      const updated = await api.adminUpdateUser(token, editingId, payload);
      setUsers((prev) => prev.map((entry) => (entry.id === editingId ? { ...entry, ...updated } : entry)));
      setMessage("User updated.");
      cancelEdit();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingEditId(null);
    }
  }

  async function setAccess(target: AdminUser, enabled: boolean) {
    if (!token) return;
    setPendingUserId(target.id);
    setError(null);
    setMessage(null);
    try {
      const updated = await api.adminSetUserAccess(token, target.id, enabled);
      setUsers((prev) =>
        prev.map((entry) =>
          entry.id === target.id
            ? {
                ...entry,
                ...updated,
                enabled
              }
            : entry
        )
      );
      setMessage(`User access ${enabled ? "enabled" : "disabled"}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <RequireAdmin>
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Users</h1>
            <p className="mt-1 text-sm text-slate-600">Edit user profile, password, roles, and account access in one place.</p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none ring-brand-500 focus:ring"
          />
        </div>

        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading users...</p> : null}
        {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}
        {!loading && !error && !filteredUsers.length ? <p className="rounded-xl bg-white p-4 text-sm">No users found.</p> : null}

        {editingId ? (
          <form onSubmit={saveEdit} className="rounded-3xl border border-brand-200 bg-brand-50/80 p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-800">Update User</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-slate-700">Email</span>
                <input
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                  required
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-700">Full name</span>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                  required
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-700">New password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                  placeholder="Leave blank to keep current password"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-700">Phone</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                  placeholder="+1-202-555-0199"
                />
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-slate-700">Address</span>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                  rows={2}
                />
              </label>
            </div>

            <div className="mt-3">
              <p className="text-sm text-slate-700">Roles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {roleOptions.map((role) => {
                  const selected = form.roles.includes(role);
                  return (
                    <label key={role} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((prev) => ({
                            ...prev,
                            roles: checked ? [...prev.roles, role] : prev.roles.filter((r) => r !== role)
                          }));
                        }}
                      />
                      {role}
                    </label>
                  );
                })}
              </div>
            </div>

            <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
              />
              Account enabled
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                disabled={savingEditId === editingId}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {savingEditId === editingId ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="space-y-3">
          {filteredUsers.map((entry) => {
            const enabled = isUserEnabled(entry);
            const isCurrentUser = currentUser?.id === entry.id;
            const isPending = pendingUserId === entry.id;
            return (
              <article key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{entry.fullName}</p>
                    <p className="text-sm text-slate-600">{entry.email}</p>
                    {entry.phone ? <p className="text-xs text-slate-500">Phone: {entry.phone}</p> : null}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">Roles: {entry.roles?.join(", ") || "N/A"}</p>
                  {entry.createdAt ? <p className="text-xs text-slate-500">Created {formatDate(entry.createdAt)}</p> : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => startEdit(entry)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit details
                  </button>
                  {enabled ? (
                    <button
                      onClick={() => setAccess(entry, false)}
                      disabled={isPending || isCurrentUser}
                      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending ? "Updating..." : isCurrentUser ? "Cannot disable self" : "Disable access"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setAccess(entry, true)}
                      disabled={isPending}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending ? "Updating..." : "Enable access"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </RequireAdmin>
  );
}
