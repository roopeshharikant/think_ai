import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "../../components/forum/SearchBar";

describe("SearchBar", () => {
    it("submits the search text", async () => {
        const onChange = vi.fn();
        render(<SearchBar filters={{}} onChange={onChange} />);
        await userEvent.type(screen.getByLabelText("Search discussions"), "websocket");
        await userEvent.click(screen.getByRole("button", { name: "Search" }));
        expect(onChange).toHaveBeenCalledWith({ search: "websocket" });
    });

    it("emits filter patches for solved status and sort order", async () => {
        const onChange = vi.fn();
        render(<SearchBar filters={{}} onChange={onChange} />);

        await userEvent.selectOptions(screen.getByLabelText("Solved status filter"), "true");
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ solved: "true" }));

        await userEvent.selectOptions(screen.getByLabelText("Sort order"), "votes");
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ sort: "votes" }));
    });

    it("normalises the author filter by stripping the @ prefix on blur", async () => {
        const onChange = vi.fn();
        render(<SearchBar filters={{}} onChange={onChange} />);
        const author = screen.getByLabelText("Filter by author");
        await userEvent.type(author, "priya");
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith({ author: "priya" });
    });

    it("clears every filter with the Clear button", async () => {
        const onChange = vi.fn();
        render(
            <SearchBar
                filters={{ tag: "react", solved: "true" }}
                onChange={onChange}
            />
        );
        await userEvent.click(screen.getByRole("button", { name: "Clear" }));
        expect(onChange).toHaveBeenCalledWith({
            search: "",
            tag: "",
            author: "",
            solved: "",
            dateFrom: "",
            dateTo: "",
            sort: "recent"
        });
    });

    it("supports date range filtering", async () => {
        const onChange = vi.fn();
        render(<SearchBar filters={{}} onChange={onChange} />);
        await userEvent.type(screen.getByLabelText("Date from"), "2026-01-01");
        expect(onChange).toHaveBeenLastCalledWith({ dateFrom: "2026-01-01" });
    });
});
