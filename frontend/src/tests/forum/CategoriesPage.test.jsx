import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoriesPage from "../../pages/forum/CategoriesPage";
import { categoryApi } from "../../services/categoryApi";

vi.mock("../../services/categoryApi", () => ({
    categoryApi: {
        list: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn()
    }
}));

const categories = [
    { id: "c1", name: "React", color: "#61dafb", description: "Frontend", discussionCount: 12 },
    { id: "c2", name: "APIs", color: "#f59e0b", description: "", discussionCount: 4 }
];

afterEach(() => {
    vi.clearAllMocks();
});

describe("CategoriesPage", () => {
    it("lists categories returned by the API with discussion counts", async () => {
        categoryApi.list.mockResolvedValue({ data: categories });
        render(<CategoriesPage />);

        await waitFor(() => expect(screen.getByTestId("categories-table")).toBeInTheDocument());
        expect(screen.getByText("React")).toBeInTheDocument();
        expect(screen.getByText("APIs")).toBeInTheDocument();
        expect(categoryApi.list).toHaveBeenCalledTimes(1);
    });

    it("creates a category through the form and reloads the list", async () => {
        categoryApi.list
            .mockResolvedValueOnce({ data: categories })
            .mockResolvedValueOnce({ data: [...categories, { id: "c3", name: "Testing", discussionCount: 0 }] });
        categoryApi.create.mockResolvedValue({ data: { id: "c3" } });
        render(<CategoriesPage />);

        await waitFor(() => expect(screen.getByTestId("categories-table")).toBeInTheDocument());
        await userEvent.type(screen.getByLabelText("Name"), "Testing");
        await userEvent.click(screen.getByRole("button", { name: /create category/i }));

        await waitFor(() =>
            expect(categoryApi.create).toHaveBeenCalledWith(
                expect.objectContaining({ name: "Testing" })
            )
        );
        expect(await screen.findByText("Testing")).toBeInTheDocument();
    });

    it("shows a validation error for an empty name instead of calling the API", async () => {
        categoryApi.list.mockResolvedValue({ data: categories });
        render(<CategoriesPage />);
        await waitFor(() => expect(screen.getByTestId("categories-table")).toBeInTheDocument());

        await userEvent.click(screen.getByRole("button", { name: /create category/i }));
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(categoryApi.create).not.toHaveBeenCalled();
    });

    it("deletes a category via the table action", async () => {
        categoryApi.list.mockResolvedValue({ data: categories });
        categoryApi.remove.mockResolvedValue({ success: true });
        render(<CategoriesPage />);
        await waitFor(() => expect(screen.getByTestId("categories-table")).toBeInTheDocument());

        const rows = screen.getAllByRole("row");
        await userEvent.click(withinRow(rows[1], "Delete"));
        expect(categoryApi.remove).toHaveBeenCalledWith("c1");
    });

    it("pre-fills the form when editing an existing category", async () => {
        categoryApi.list.mockResolvedValue({ data: categories });
        render(<CategoriesPage />);
        await waitFor(() => expect(screen.getByTestId("categories-table")).toBeInTheDocument());

        const rows = screen.getAllByRole("row");
        await userEvent.click(withinRow(rows[2], "Edit"));

        expect(screen.getByLabelText("Name")).toHaveValue("APIs");
        expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });
});

function withinRow(row, name) {
    return [...row.querySelectorAll("button")].find((b) => b.textContent.trim() === name);
}
