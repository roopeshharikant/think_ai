import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StudioToolbar from "../../components/liveStudio/StudioToolbar";

function renderToolbar(overrides = {}) {
  const handlers = {
    onToggleMute: vi.fn(),
    onToggleCamera: vi.fn(),
    onToggleShare: vi.fn(),
    onToggleHand: vi.fn(),
    onOpenChat: vi.fn(),
    onOpenAttendees: vi.fn(),
    onOpenPolls: vi.fn(),
    onOpenBreakout: vi.fn(),
  };
  const props = {
    muted: true,
    cameraOn: false,
    sharing: false,
    handRaised: false,
    ...handlers,
    ...overrides,
  };
  render(<StudioToolbar {...props} />);
  return { ...handlers };
}

describe("StudioToolbar (Phase 6)", () => {
  it("renders all four controls", () => {
    renderToolbar();
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /unmute/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /camera/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hand/i })).toBeInTheDocument();
  });

  it("reflects mute state visually and via aria-pressed", () => {
    renderToolbar({ muted: true });
    const mute = screen.getByRole("button", { name: /unmute/i });
    expect(mute).toHaveClass("is-off");
    expect(mute).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the unmuted style when the mic is live", () => {
    renderToolbar({ muted: false });
    expect(screen.getByRole("button", { name: /^mute$/i })).toHaveClass("is-on");
  });

  it("marks an active screen share", () => {
    renderToolbar({ sharing: true });
    expect(screen.getByRole("button", { name: /share/i })).toHaveClass("is-on");
  });

  it("highlights a raised hand", () => {
    renderToolbar({ handRaised: true });
    expect(screen.getByRole("button", { name: /hand/i })).toHaveClass("is-active-hand");
  });

  it("invokes the matching handler for each button", () => {
    const handlers = renderToolbar();

    fireEvent.click(screen.getByRole("button", { name: /unmute|mute/i }));
    fireEvent.click(screen.getByRole("button", { name: /camera/i }));
    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    fireEvent.click(screen.getByRole("button", { name: /hand/i }));

    expect(handlers.onToggleMute).toHaveBeenCalledTimes(1);
    expect(handlers.onToggleCamera).toHaveBeenCalledTimes(1);
    expect(handlers.onToggleShare).toHaveBeenCalledTimes(1);
    expect(handlers.onToggleHand).toHaveBeenCalledTimes(1);
  });

  it("invokes the matching handler for contextual panel buttons", () => {
    const handlers = renderToolbar();

    fireEvent.click(screen.getByRole("button", { name: /chat/i }));
    fireEvent.click(screen.getByRole("button", { name: /attendees/i }));
    fireEvent.click(screen.getByRole("button", { name: /polls/i }));
    fireEvent.click(screen.getByRole("button", { name: /rooms/i }));

    expect(handlers.onOpenChat).toHaveBeenCalledTimes(1);
    expect(handlers.onOpenAttendees).toHaveBeenCalledTimes(1);
    expect(handlers.onOpenPolls).toHaveBeenCalledTimes(1);
    expect(handlers.onOpenBreakout).toHaveBeenCalledTimes(1);
  });

  it("marks the active contextual tool button", () => {
    renderToolbar({ activePanel: "chat" });
    expect(screen.getByRole("button", { name: /chat/i })).toHaveClass("is-active-tool");
  });
});
