/**
 * User moderation table (Phase 8): ban / unban members.
 */
export default function UserModeration({ users = [], onToggleBan, busyIds }) {
  if (users.length === 0) {
    return <p className="loading-note">No users found.</p>;
  }

  return (
    <div className="studio-panel" style={{ overflowX: "auto" }}>
      <h2>Members</h2>
      <table className="moderation-table" data-testid="user-moderation" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr style={{ color: "var(--forum-text-dim)", textAlign: "left" }}>
            <th style={{ padding: "6px 8px" }}>User</th>
            <th style={{ padding: "6px 8px" }}>Role</th>
            <th style={{ padding: "6px 8px" }}>Status</th>
            <th style={{ padding: "6px 8px" }} aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const busy = busyIds ? busyIds.has(user.id) : false;
            return (
              <tr key={user.id} data-user-id={user.id} style={{ borderTop: "1px solid var(--forum-border)" }}>
                <td style={{ padding: "8px" }}>
                  {user.name}
                  <span style={{ color: "var(--forum-text-dim)" }}> @{user.username}</span>
                </td>
                <td style={{ padding: "8px" }}>{user.role}</td>
                <td style={{ padding: "8px" }}>
                  {user.banned ? (
                    <span style={{ color: "#fda4af" }}>Banned</span>
                  ) : (
                    <span style={{ color: "#6ee7b7" }}>Active</span>
                  )}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  <button
                    type="button"
                    className={`btn btn--small ${user.banned ? "" : "btn--danger"}`}
                    disabled={busy}
                    onClick={() => onToggleBan(user)}
                  >
                    {user.banned ? "Unban" : "Ban"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
