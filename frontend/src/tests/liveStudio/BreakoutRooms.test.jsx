import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BreakoutRooms from "../../components/liveStudio/BreakoutRooms";

vi.mock("../../services/studioApi", () => ({
  fetchBreakoutRooms: vi.fn().mockResolvedValue([
    { id: 1, name: "Room 1", status: "active", members: [{ userId: "u1" }] },
    { id: 2, name: "Room 2", status: "active", members: [] },
  ]),
  createBreakoutRoom: vi.fn().mockResolvedValue({}),
  joinBreakoutRoom: vi.fn().mockResolvedValue({}),
  leaveBreakoutRoom: vi.fn().mockResolvedValue({}),
}));

describe("BreakoutRooms (Phase 7)", () => {
  it("renders the panel with a list of rooms from the backend", async () => {
    render(<BreakoutRooms sessionId="s1" currentUserId="u2" />);
    expect(screen.getByTestId("breakout-panel")).toBeInTheDocument();
    expect(screen.getByText("Breakout Rooms")).toBeInTheDocument();
    expect(await screen.findByText("Room 2")).toBeInTheDocument();
  });

  it("shows an active-room summary", async () => {
    render(<BreakoutRooms sessionId="s1" currentUserId="u1" />);
    expect(await screen.findByText(/2 rooms currently active/i)).toBeInTheDocument();
  });

  it("marks the room the current user joined as their active room", async () => {
    render(<BreakoutRooms sessionId="s1" currentUserId="u1" />);
    const note = await screen.findByText(
      (_content, element) => element?.className === "loading-note" && element.textContent.includes("You are in Room 1")
    );
    expect(note).toBeInTheDocument();
  });

  it("hides the create form for non-hosts", async () => {
    render(<BreakoutRooms sessionId="s1" currentUserId="u2" isHost={false} />);
    expect(await screen.findByText(/2 rooms currently active/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create/i })).not.toBeInTheDocument();
  });

  it("shows the create form for hosts", async () => {
    render(<BreakoutRooms sessionId="s1" currentUserId="u2" isHost />);
    expect(await screen.findByText(/2 rooms currently active/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("calls onClose when the close button is pressed", async () => {
    const onClose = vi.fn();
    render(<BreakoutRooms sessionId="s1" currentUserId="u1" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close breakout rooms/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
