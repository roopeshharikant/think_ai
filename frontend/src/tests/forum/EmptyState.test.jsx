import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EmptyState from "../../components/forum/EmptyState";

describe("EmptyState (Phase 4)", () => {
  it("renders default copy", () => {
    render(<EmptyState />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(
      screen.getByText("No discussions are available right now.")
    ).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    render(
      <EmptyState
        icon="🔖"
        title="No bookmarks yet"
        message="Bookmark discussions to find them quickly later."
      />
    );

    expect(screen.getByText("🔖")).toBeInTheDocument();
    expect(screen.getByText("No bookmarks yet")).toBeInTheDocument();
    expect(
      screen.getByText("Bookmark discussions to find them quickly later.")
    ).toBeInTheDocument();
  });

  it("renders the action button only when a handler is provided", () => {
    const onAction = vi.fn();
    const { rerender } = render(<EmptyState actionLabel="Create one" onAction={onAction} />);

    const button = screen.getByRole("button", { name: "Create one" });
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);

    rerender(<EmptyState />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
