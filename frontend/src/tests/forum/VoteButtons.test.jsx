import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VoteButtons from "../../components/forum/VoteButtons";

describe("VoteButtons (Phase 2)", () => {
  it("renders the current score", () => {
    render(<VoteButtons score={42} userVote="none" onVote={vi.fn()} />);
    expect(screen.getByLabelText("Score 42")).toHaveTextContent("42");
  });

  it("emits 'up' when upvote is clicked from a neutral state", () => {
    const onVote = vi.fn();
    render(<VoteButtons score={1} userVote="none" onVote={onVote} />);

    fireEvent.click(screen.getByRole("button", { name: "Upvote" }));
    expect(onVote).toHaveBeenCalledWith("up");
  });

  it("emits 'down' when downvote is clicked from a neutral state", () => {
    const onVote = vi.fn();
    render(<VoteButtons score={0} userVote="none" onVote={onVote} />);

    fireEvent.click(screen.getByRole("button", { name: "Downvote" }));
    expect(onVote).toHaveBeenCalledWith("down");
  });

  it("toggles an active upvote back to none", () => {
    const onVote = vi.fn();
    render(<VoteButtons score={5} userVote="up" onVote={onVote} />);

    const upButton = screen.getByRole("button", { name: "Upvote" });
    expect(upButton).toHaveClass("is-active");
    expect(upButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(upButton);
    expect(onVote).toHaveBeenCalledWith("none");
  });

  it("highlights the active downvote state", () => {
    render(<VoteButtons score={-2} userVote="down" onVote={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Downvote" })).toHaveClass("is-active");
    expect(screen.getByRole("button", { name: "Upvote" })).not.toHaveClass("is-active");
  });

  it("ignores clicks while disabled (pending request)", () => {
    const onVote = vi.fn();
    render(<VoteButtons score={3} userVote="none" onVote={onVote} disabled />);

    fireEvent.click(screen.getByRole("button", { name: "Upvote" }));
    expect(onVote).not.toHaveBeenCalled();
  });
});
