import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CreateDiscussionForm from "../../components/forum/CreateDiscussionForm";
import { categoryFixture } from "../helpers";

const categories = [categoryFixture(), categoryFixture({ id: "c-qa", name: "Q&A" })];

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /publish discussion/i }));
}

describe("CreateDiscussion (Phase 1)", () => {
  it("renders all fields", () => {
    render(<CreateDiscussionForm categories={categories} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^body$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
  });

  it("blocks submission and shows errors when title/body are invalid", async () => {
    const onSubmit = vi.fn();
    render(<CreateDiscussionForm categories={categories} onSubmit={onSubmit} />);

    submit();

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(screen.getByText("Body is required")).toBeInTheDocument();
    });
  });

  it("rejects a title shorter than the minimum length", async () => {
    const onSubmit = vi.fn();
    render(<CreateDiscussionForm categories={categories} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "abc" } });
    fireEvent.change(screen.getByLabelText(/^body$/i), {
      target: { value: "long enough body for validation" },
    });
    submit();

    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 5 characters/)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed values with parsed tags on success", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ id: "d9" });
    render(<CreateDiscussionForm categories={categories} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "  Optimistic UI question  " } });
    fireEvent.change(screen.getByLabelText(/^body$/i), {
      target: { value: "  How do I revert votes when the API fails?  " },
    });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "c-qa" } });
    fireEvent.change(screen.getByLabelText(/tags/i), { target: { value: " React, API , testing" } });

    submit();

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Optimistic UI question",
        body: "How do I revert votes when the API fails?",
        tags: ["react", "api", "testing"],
        categoryId: "c-qa",
      });
    });
  });

  it("surfaces server-side validation errors without clearing the form", async () => {
    const onSubmit = vi.fn().mockRejectedValue({
      message: "Validation failed",
      errors: { title: "Title must be at most 150 characters" },
    });
    render(<CreateDiscussionForm categories={categories} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Valid title here" } });
    fireEvent.change(screen.getByLabelText(/^body$/i), {
      target: { value: "Valid body that is long enough." },
    });
    submit();

    await waitFor(() => {
      expect(
        screen.getByText("Title must be at most 150 characters")
      ).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/title/i)).toHaveValue("Valid title here");
  });
});
