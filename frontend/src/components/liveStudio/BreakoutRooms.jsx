import { useCallback, useEffect, useState } from "react";
import {
  createBreakoutRoom,
  fetchBreakoutRooms,
  joinBreakoutRoom,
  leaveBreakoutRoom,
} from "../../services/studioApi";

/**
 * Breakout rooms — contextual panel backed by the DB `/api/studio/breakouts`
 * endpoints. The host can create rooms; everyone (host included) can join and
 * leave them.
 */
export default function BreakoutRooms({ sessionId, isHost, currentUserId, onClose }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!sessionId) return;
    fetchBreakoutRooms(sessionId)
      .then(setRooms)
      .catch((err) => setError(err.message || "Could not load breakout rooms"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  const myActiveRoom = rooms.find((room) =>
    (room.members || []).some((member) => member.userId === currentUserId)
  );

  const handleCreate = async () => {
    const name = roomName.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      await createBreakoutRoom(sessionId, name);
      setRoomName("");
      load();
    } catch (err) {
      setError(err.message || "Could not create room");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (roomId) => {
    setBusy(true);
    setError(null);
    try {
      await joinBreakoutRoom(roomId);
      load();
    } catch (err) {
      setError(err.message || "Could not join room");
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async (roomId) => {
    setBusy(true);
    setError(null);
    try {
      await leaveBreakoutRoom(roomId);
      load();
    } catch (err) {
      setError(err.message || "Could not leave room");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="studio-panel studio-drawer" data-testid="breakout-panel">
      <div className="studio-drawer__header">
        <h2>Breakout Rooms</h2>
        {onClose && (
          <button
            type="button"
            className="studio-close-btn"
            onClick={onClose}
            aria-label="Close breakout rooms"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <p className="loading-note error-note" role="alert">
          {error}
        </p>
      )}

      {isHost && (
        <form
          className="breakout-create"
          onSubmit={(event) => {
            event.preventDefault();
            handleCreate();
          }}
        >
          <input
            type="text"
            value={roomName}
            onChange={(event) => setRoomName(event.target.value)}
            placeholder="New room name"
            aria-label="New room name"
          />
          <button
            type="submit"
            className="btn btn--primary btn--small"
            disabled={busy || !roomName.trim()}
          >
            Create
          </button>
        </form>
      )}

      {myActiveRoom && (
        <p className="loading-note" style={{ textAlign: "left" }}>
          You are in <strong>{myActiveRoom.name}</strong>.
        </p>
      )}

      <p className="loading-note">
        {loading
          ? "Loading rooms…"
          : `${rooms.length} room${rooms.length === 1 ? "" : "s"} currently active.`}
      </p>

      {loading ? (
        <p className="loading-note">Loading…</p>
      ) : rooms.length === 0 ? (
        <p className="loading-note">
          {isHost ? "Create a room to start a breakout." : "No breakout rooms right now."}
        </p>
      ) : (
        <ul className="breakout-list">
          {rooms.map((room) => {
            const memberCount = (room.members || []).length;
            const joined = Boolean(
              (room.members || []).some((member) => member.userId === currentUserId)
            );
            return (
              <li key={room.id} className="breakout-room">
                <div className="breakout-room__row">
                  <div className="breakout-room__info">
                    <span className="breakout-room__name">{room.name}</span>
                    <span className="breakout-room__meta">
                      {memberCount} member{memberCount === 1 ? "" : "s"} · {room.status}
                    </span>
                  </div>
                  {joined ? (
                    <button
                      type="button"
                      className="btn btn--ghost btn--small"
                      disabled={busy}
                      onClick={() => handleLeave(room.id)}
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--primary btn--small"
                      disabled={busy || Boolean(myActiveRoom)}
                      onClick={() => handleJoin(room.id)}
                    >
                      Join
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
