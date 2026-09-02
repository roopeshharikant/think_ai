import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ChatPanel from "../../components/liveStudio/ChatPanel";

const messages = [
  { id: "m1", userId: "u3", userName: "Rahul Verma", text: "Welcome everyone!", timestamp: "2026-08-24T11:00:00.000Z" },
  { id: "m2", userId: "u1", userName: "Aarav Sharma", text: "Audio is clear on my side.", timestamp: "2026-08-24T11:01:30.000Z" },
];

describe("ChatPanel (Phase 6/7)", () => {
  it("renders message history with author and timestamp", () => {
    render(<ChatPanel messages={messages} onSend={vi.fn()} />);

    expect(screen.getByText("Rahul Verma")).toBeInTheDocument();
    expect(screen.getByText("Welcome everyone!")).toBeInTheDocument();
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    // Timestamps are formatted as HH:MM
    const times = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(times.length).toBeGreaterThanOrEqual(2);
  });

  it("shows an empty prompt when there are no messages", () => {
    render(<ChatPanel messages={[]} onSend={vi.fn()} />);
    expect(screen.getByText(/No messages yet/i)).toBeInTheDocument();
  });

  it("sends a message through the handler and clears the input", () => {
    const onSend = vi.fn();
    render(<ChatPanel messages={messages} onSend={onSend} />);

    const input = screen.getByLabelText("Chat message");
    fireEvent.change(input, { target: { value: "Hello studio!" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(onSend).toHaveBeenCalledWith("Hello studio!");
    expect(input).toHaveValue("");
  });

  it("ignores empty or whitespace-only messages", () => {
    const onSend = vi.fn();
    render(<ChatPanel messages={[]} onSend={onSend} />);

    const input = screen.getByLabelText("Chat message");
    fireEvent.change(input, { target: { value: "   " } });
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
    fireEvent.submit(input.closest("form"));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("offers delete actions to moderators only", () => {
    const onDelete = vi.fn();
    const { rerender } = render(
      <ChatPanel messages={messages} onSend={vi.fn()} onDeleteMessage={onDelete} canModerate />
    );

    expect(screen.getAllByRole("button", { name: /^delete message from/i })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /delete message from Rahul Verma/i }));
    expect(onDelete).toHaveBeenCalledWith("m1");

    rerender(<ChatPanel messages={messages} onSend={vi.fn()} onDeleteMessage={onDelete} canModerate={false} />);
    expect(screen.queryByRole("button", { name: /^delete message from/i })).not.toBeInTheDocument();
  });

  it("renders deleted messages struck through", () => {
    render(
      <ChatPanel
        messages={[{ ...messages[0], deleted: true }]}
        onSend={vi.fn()}
      />
    );
    expect(screen.getByText("Welcome everyone!").closest(".chat-message")).toHaveClass(
      "chat-message--deleted"
    );
  });
});
