import { useEffect, useState } from "react";
import "../../styles/forum.css";

import { CURRENT_USER, forumApi } from "../../services/forumApi";

const CHANNELS = [
  { key: "email", label: "Email notifications", hint: "Replies and mentions sent to your inbox." },
  { key: "inApp", label: "In-app notifications", hint: "Bell updates while you browse the forum." },
  { key: "sms", label: "SMS alerts", hint: "Critical moderation notices only." },
];

/** Notification preferences page (Phase 8/9): email / in-app / SMS toggles. */
export default function PreferencesPage() {
  const [prefs, setPrefs] = useState({ email: true, inApp: true, sms: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    forumApi.getPreferences(CURRENT_USER.id)
      .then((payload) => {
        if (!cancelled) setPrefs({ ...prefs, ...(payload.data || {}) });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load preferences");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleChannel = (key) =>
    setPrefs((previous) => ({ ...previous, [key]: !previous[key] }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = await forumApi.savePreferences(prefs, CURRENT_USER.id);
      setPrefs({ ...prefs, ...(payload.data || prefs) });
      setSavedMessage("Preferences saved");
    } catch (err) {
      setError(err.message || "Could not save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="forum-page">
      <div className="forum-container" style={{ maxWidth: 640 }}>
        <header className="forum-header">
          <h1>Notification preferences</h1>
          <a href="/forum" className="btn btn--ghost">← Forum</a>
        </header>

        {error && (
          <div className="error-banner" role="alert">{error}</div>
        )}
        {loading && <p className="loading-note">Loading preferences…</p>}

        {!loading && (
          <>
            <ul className="preferences-list" style={{ listStyle: "none", padding: 0 }}>
              {CHANNELS.map((channel) => (
                <li
                  key={channel.key}
                  className="card"
                  style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(prefs[channel.key])}
                    data-testid={`pref-toggle-${channel.key}`}
                    className={`btn btn--small ${prefs[channel.key] ? "btn--primary" : "btn--ghost"}`}
                    onClick={() => toggleChannel(channel.key)}
                  >
                    {prefs[channel.key] ? "On" : "Off"}
                  </button>
                  <div>
                    <strong>{channel.label}</strong>
                    <p style={{ margin: "2px 0 0", color: "var(--forum-muted)" }}>
                      {channel.hint}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save preferences"}
              </button>
              {savedMessage && (
                <span role="status" className="badge badge--solved">
                  <span aria-hidden="true">✓</span> {savedMessage}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
