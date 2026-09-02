import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PollPanel from "../../components/liveStudio/PollPanel";

const polls = [
  {
    id: "poll1",
    question: "Which hook should we refactor first?",
    status: "open",
    totalVotes: 21,
    options: [
      { id: "opt1", text: "useState", votes: 7, percent: 33 },
      { id: "opt2", text: "useEffect", votes: 14, percent: 67 },
    ],
  },
];

describe("PollPanel (Phase 6/7)", () => {
  it("renders polls with question, options and result percentages", () => {
    render(<PollPanel polls={polls} onVote={vi.fn()} />);

    expect(screen.getByText("Which hook should we refactor first?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "useState" })).toBeInTheDocument();
    expect(screen.getByText("67% (14)")).toBeInTheDocument();
    expect(screen.getByText("21 votes · status: open")).toBeInTheDocument();
  });

  it("shows the empty prompt when no polls exist", () => {
    render(<PollPanel polls={[]} onVote={vi.fn()} />);
    expect(screen.getByText(/No polls yet/i)).toBeInTheDocument();
  });

  it("emits poll + option ids when voting", () => {
    const onVote = vi.fn();
    render(<PollPanel polls={polls} onVote={onVote} />);

    fireEvent.click(screen.getByRole("button", { name: "useEffect" }));
    expect(onVote).toHaveBeenCalledWith("poll1", "opt2");
  });

  it("creates a poll with parsed options", () => {
    const onCreatePoll = vi.fn();
    render(<PollPanel polls={polls} onVote={vi.fn()} onCreatePoll={onCreatePoll} canCreatePoll />);

    fireEvent.change(screen.getByLabelText("Poll question"), {
      target: { value: "Should we record sessions?" },
    });
    fireEvent.change(screen.getByLabelText("Poll options"), {
      target: { value: " Yes, No , Maybe" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create poll/i }));

    expect(onCreatePoll).toHaveBeenCalledWith({
      question: "Should we record sessions?",
      options: ["Yes", "No", "Maybe"],
    });
  });

  it("validates poll creation input (question length + option count)", () => {
    const onCreatePoll = vi.fn();
    render(<PollPanel polls={[]} onVote={vi.fn()} onCreatePoll={onCreatePoll} canCreatePoll />);

    // Question too short.
    fireEvent.change(screen.getByLabelText("Poll question"), { target: { value: "abc" } });
    fireEvent.change(screen.getByLabelText("Poll options"), { target: { value: "One, Two" } });
    fireEvent.click(screen.getByRole("button", { name: /create poll/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/at least 5 characters/i);

    // Not enough options.
    fireEvent.change(screen.getByLabelText("Poll question"), { target: { value: "Valid question?" } });
    fireEvent.change(screen.getByLabelText("Poll options"), { target: { value: "Only one" } });
    fireEvent.click(screen.getByRole("button", { name: /create poll/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/at least 2 comma-separated options/i);

    expect(onCreatePoll).not.toHaveBeenCalled();
  });

  it("hides the creation form unless canCreatePoll is true", () => {
    render(<PollPanel polls={polls} onVote={vi.fn()} canCreatePoll={false} />);
    expect(screen.queryByLabelText("Poll question")).not.toBeInTheDocument();
  });

  it("computes percentages from votes when the API omits them", () => {
    const rawPoll = [
      {
        id: "p2",
        question: "Next topic?",
        status: "open",
        totalVotes: undefined,
        options: [
          { id: "o1", text: "Testing", votes: 3 },
          { id: "o2", text: "Styling", votes: 1 },
        ],
      },
    ];
    render(<PollPanel polls={rawPoll} onVote={vi.fn()} />);
    expect(screen.getByText("75% (3)")).toBeInTheDocument();
    expect(screen.getByText("25% (1)")).toBeInTheDocument();
  });
});
