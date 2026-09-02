import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LiveStudioPage from "../../pages/liveStudio/LiveStudioPage";

vi.mock("../../services/studioApi", () => ({
  fetchStudioSession: vi.fn().mockResolvedValue({
    id: "s1",
    title: "React Performance Patterns",
    hostId: "u-moderator",
    attendees: [{ userId: "u-user", name: "You", online: true }],
    messages: [],
    polls: [],
  }),
  joinStudioSession: vi.fn().mockResolvedValue({ joined: true }),
  createStudioPoll: vi.fn().mockResolvedValue({}),
  voteStudioPoll: vi.fn().mockResolvedValue({}),
  fetchBreakoutRooms: vi.fn().mockResolvedValue([]),
  createBreakoutRoom: vi.fn().mockResolvedValue({}),
  joinBreakoutRoom: vi.fn().mockResolvedValue({}),
  leaveBreakoutRoom: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../services/forumHttpClient", () => ({
  getCurrentUserId: vi.fn().mockReturnValue("u-user"),
}));

vi.mock("../../hooks/useWebSocket", () => ({
  useStudioSocket: () => ({
    mode: "mock",
    subscribe: () => () => {},
    emit: vi.fn(),
  }),
}));

function renderStudio() {
  return render(
    <MemoryRouter initialEntries={["/forum/studio"]}>
      <Routes>
        <Route path="/forum/studio" element={<LiveStudioPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LiveStudioPage (Phase 6/7 interactions)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not auto-render the camera preview on load", async () => {
    renderStudio();
    expect(
      await screen.findByRole("heading", { name: /React Performance Patterns/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("video-placeholder")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Camera preview" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("camera-preview")).not.toBeInTheDocument();
  });

  it("opens the camera modal when Start Video is clicked", async () => {
    renderStudio();
    await screen.findByRole("heading", { name: /React Performance Patterns/i });
    fireEvent.click(screen.getByRole("button", { name: /start video/i }));
    expect(screen.getByRole("dialog", { name: "Camera preview" })).toBeInTheDocument();
  });

  it("closing the camera modal returns to the normal page and keeps it intact", async () => {
    renderStudio();
    await screen.findByRole("heading", { name: /React Performance Patterns/i });
    fireEvent.click(screen.getByRole("button", { name: /start video/i }));
    const dialog = screen.getByRole("dialog", { name: "Camera preview" });
    fireEvent.click(screen.getByRole("button", { name: /close camera|stop video/i }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Camera preview" })).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("video-placeholder")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /React Performance Patterns/i })).toBeInTheDocument();
    expect(dialog).not.toBeInTheDocument();
  });

  it("opens the chat panel from the toolbar and hides it on close", async () => {
    renderStudio();
    await screen.findByRole("heading", { name: /React Performance Patterns/i });
    fireEvent.click(screen.getByRole("button", { name: "Chat" }));
    expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close chat" }));
    await waitFor(() =>
      expect(screen.queryByTestId("chat-panel")).not.toBeInTheDocument()
    );
  });

  it("opens the attendees panel from the toolbar", async () => {
    renderStudio();
    await screen.findByRole("heading", { name: /React Performance Patterns/i });
    fireEvent.click(screen.getByRole("button", { name: "Attendees" }));
    expect(screen.getByTestId("attendee-list")).toBeInTheDocument();
  });

  it("opens the polls panel from the toolbar", async () => {
    renderStudio();
    await screen.findByRole("heading", { name: /React Performance Patterns/i });
    fireEvent.click(screen.getByRole("button", { name: "Polls" }));
    expect(screen.getByTestId("poll-panel")).toBeInTheDocument();
  });

  it("opens the breakout rooms panel from the toolbar", async () => {
    renderStudio();
    await screen.findByRole("heading", { name: /React Performance Patterns/i });
    fireEvent.click(screen.getByRole("button", { name: "Rooms" }));
    expect(screen.getByTestId("breakout-panel")).toBeInTheDocument();
  });

  it("only keeps one panel open at a time", async () => {
    renderStudio();
    await screen.findByRole("heading", { name: /React Performance Patterns/i });
    fireEvent.click(screen.getByRole("button", { name: "Chat" }));
    expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Attendees" }));
    expect(screen.getByTestId("attendee-list")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-panel")).not.toBeInTheDocument();
  });
});
