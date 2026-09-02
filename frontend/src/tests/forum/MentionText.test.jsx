import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MentionText from "../../components/forum/MentionText";
import { extractMentions, parseMentionSegments } from "../../utils/mentionParser";

describe("mentionParser utils (Phase 5)", () => {
  it("extracts unique lowercase mentions", () => {
    expect(extractMentions("Hey @Priya and @priya, look at @rahul!")).toEqual([
      "priya",
      "rahul",
    ]);
  });

  it("ignores email-like text and single-character tokens", () => {
    expect(extractMentions("mail me at foo@bar.com")).toEqual([]);
  });

  it("handles empty and non-string input", () => {
    expect(extractMentions(null)).toEqual([]);
    expect(extractMentions("")).toEqual([]);
  });

  it("splits text into text + mention segments", () => {
    const segments = parseMentionSegments("Thanks @vikram, see you @meera tomorrow");
    expect(segments).toHaveLength(5);
    expect(segments[1]).toEqual({ type: "mention", value: "vikram" });
    expect(segments[3]).toEqual({ type: "mention", value: "meera" });
    expect(
      segments
        .filter((segment) => segment.type === "text")
        .map((segment) => segment.value)
        .join("|")
    ).toBe("Thanks |, see you | tomorrow");
  });

  it("keeps plain text intact when no mentions exist", () => {
    const segments = parseMentionSegments("No mentions here.");
    expect(segments).toEqual([{ type: "text", value: "No mentions here." }]);
  });
});

describe("MentionText component", () => {
  it("renders mentions as highlighted marks with data attributes", () => {
    render(<MentionText text="Ping @aarav about the deploy" />);

    const mark = screen.getByText("@aarav");
    expect(mark).toHaveClass("mention");
    expect(mark).toHaveAttribute("data-mention", "aarav");
    expect(mark.closest("span")).toHaveTextContent("Ping @aarav about the deploy");
  });

  it("renders multiple mentions", () => {
    render(<MentionText text="@aarav @sneha please review" />);
    expect(screen.getByText("@aarav")).toBeInTheDocument();
    expect(screen.getByText("@sneha")).toBeInTheDocument();
  });

  it("applies the passed className to the wrapper", () => {
    render(<MentionText className="comment__body" text="hello" />);
    const wrapper = screen.getByText("hello").closest("span");
    expect(wrapper).toHaveClass("comment__body");
  });

  it("renders nothing extra for empty bodies", () => {
    const { container } = render(<MentionText text="" />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
