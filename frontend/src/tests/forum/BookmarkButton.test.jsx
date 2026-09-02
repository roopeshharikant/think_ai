import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BookmarkButton from "../../components/forum/BookmarkButton";
import { useBookmarks } from "../../hooks/useBookmarks";
import { discussionFixture } from "../helpers";

vi.mock("../../services/bookmarkApi", () => ({
  fetchBookmarks: vi.fn().mockResolvedValue([{ id: "bk1", userId: "u1", discussionId: "d2" }]),
  addBookmark: vi.fn().mockResolvedValue({ bookmarked: true }),
  removeBookmark: vi.fn().mockResolvedValue({ bookmarked: false }),
}));

describe("BookmarkButton (Phase 5)", () => {
  it("renders unbookmarked state with aria-pressed=false", () => {
    render(<BookmarkButton isBookmarked={false} onToggle={vi.fn()} />);

    const button = screen.getByRole("button", { name: /add bookmark/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).not.toHaveClass("is-active");
  });

  it("renders bookmarked state with the active class", () => {
    render(<BookmarkButton isBookmarked onToggle={vi.fn()} />);

    const button = screen.getByRole("button", { name: /remove bookmark/i });
    expect(button).toHaveClass("is-active");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("invokes the toggle handler on click", () => {
    const onToggle = vi.fn();
    render(<BookmarkButton isBookmarked={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("does not invoke the handler while disabled", () => {
    const onToggle = vi.fn();
    render(<BookmarkButton isBookmarked={false} onToggle={onToggle} disabled />);

    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).not.toHaveBeenCalled();
  });
});

describe("useBookmarks hook (optimistic + persistence)", () => {
  function HookProbe({ onToggle }) {
    const { isBookmarked, toggleBookmark, loading } = useBookmarks();
    return (
      <div>
        <span data-testid="loading">{String(loading)}</span>
        <span data-testid="state">{String(isBookmarked(discussionFixture().id))}</span>
        <span data-testid="seeded">{String(isBookmarked("d2"))}</span>
        <button type="button" onClick={() => { toggleBookmark("d1"); onToggle(); }}>
          toggle
        </button>
      </div>
    );
  }

  it("loads persisted bookmarks and flips optimistically", async () => {
    render(<HookProbe onToggle={vi.fn()} />);

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("seeded")).toHaveTextContent("true");
    expect(screen.getByTestId("state")).toHaveTextContent("false");

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));

    // Optimistic: flips immediately without waiting for the API.
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("true"));
  });
});
