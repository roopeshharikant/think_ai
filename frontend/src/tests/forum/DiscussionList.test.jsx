import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import DiscussionList from "../../components/forum/DiscussionList";
import { discussionFixture } from "../helpers";

const noop = () => {};

function renderList(props) {
  return render(
    <MemoryRouter>
      <DiscussionList {...props} />
    </MemoryRouter>
  );
}

describe("DiscussionList", () => {
  it("renders one card per discussion", () => {
    const discussions = [
      discussionFixture(),
      discussionFixture({ id: "d2", title: "Second thread about websockets" }),
    ];

    renderList({
      discussions,
      onVote: noop,
      onToggleBookmark: noop,
    });

    expect(screen.getByRole("link", { name: discussions[0].title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: discussions[1].title })).toBeInTheDocument();
    expect(screen.getAllByTestId("discussion-card")).toHaveLength(2);
  });

  it("shows the empty state when no discussions are available (Phase 4)", () => {
    renderList({ discussions: [] });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("No discussions yet")).toBeInTheDocument();
    expect(screen.queryAllByTestId("discussion-card")).toHaveLength(0);
  });

  it("shows filter-specific empty copy when filters are active", () => {
    renderList({
      discussions: [],
      emptyTitle: "No matching discussions",
      emptyMessage: "Try adjusting your search or filters.",
    });

    expect(screen.getByText("No matching discussions")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search or filters.")).toBeInTheDocument();
  });

  it("passes bookmark + vote handlers down to cards", () => {
    const onVote = vi.fn();
    const onToggleBookmark = vi.fn();

    renderList({
      discussions: [discussionFixture()],
      onVote,
      isBookmarked: () => true,
      onToggleBookmark,
    });

    const voteButton = screen.getByRole("button", { name: "Upvote" });
    const bookmarkButton = screen.getByRole("button", { name: /remove bookmark/i });

    voteButton.click();
    bookmarkButton.click();

    expect(onVote).toHaveBeenCalledWith(expect.objectContaining({ id: "d1" }), "up");
    expect(onToggleBookmark).toHaveBeenCalledWith("d1");
  });
});
