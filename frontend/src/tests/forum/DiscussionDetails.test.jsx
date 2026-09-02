import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DiscussionDetailsPage from "../../pages/forum/DiscussionDetailsPage";
import { commentFixture, discussionFixture } from "../helpers";

vi.mock("../../services/forumApi", async () => {
  const { discussionFixture } = await import("../helpers");
  return {
    fetchDiscussionById: vi.fn(),
    flagDiscussion: vi.fn().mockResolvedValue({ id: "d1", flagged: true }),
    setDiscussionSolved: vi.fn().mockResolvedValue(discussionFixture({ solved: true })),
    fetchComments: vi.fn(),
    postComment: vi.fn(),
  };
});

vi.mock("../../services/bookmarkApi", () => ({
  fetchBookmarks: vi.fn().mockResolvedValue([]),
  addBookmark: vi.fn().mockResolvedValue({}),
  removeBookmark: vi.fn().mockResolvedValue({}),
}));

import { fetchComments, fetchDiscussionById } from "../../services/forumApi";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/forum/d1"]}>
      <DiscussionDetailsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  fetchDiscussionById.mockResolvedValue(discussionFixture());
  fetchComments.mockResolvedValue([
    commentFixture(),
    commentFixture({ id: "cm2", body: "Joining from Bengaluru." }),
  ]);
});

describe("DiscussionDetailsPage", () => {
  it("renders the thread body, meta and comments", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Welcome to the Thinkz AI Community/i);
    });

    expect(screen.getByText(/Introduce yourself and tell us what you are learning/i)).toBeInTheDocument();
    expect(screen.getByText("💬 Comments (2)")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3); // thread card + 2 comments
  });

  it("highlights mentions inside the discussion body and comments", async () => {
    fetchDiscussionById.mockResolvedValue(
      discussionFixture({ body: "Thanks @priya for the pointer." })
    );
    renderPage();

    await waitFor(() => {
      const mention = screen.getAllByText(/@priya/i)[0];
      expect(mention).toHaveClass("mention");
    });
  });

  it("shows the solved badge and a toggle button (Phase 2)", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("✓ Solved")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /unmark solved/i })).toBeInTheDocument();
    });
  });

  it("displays an error when the discussion cannot be loaded", async () => {
    fetchDiscussionById.mockRejectedValue(new Error("Discussion not found"));
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to load discussion");
    });
  });
});
