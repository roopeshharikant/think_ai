import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateDiscussionForm from "../../components/forum/CreateDiscussionForm";

const fill = async ({ title, body }) => {
    await userEvent.type(screen.getByLabelText("Title"), title);
    await userEvent.type(screen.getByLabelText("Body"), body);
};

describe("CreateDiscussionForm", () => {
    it("rejects a too-short body with inline validation", async () => {
        render(<CreateDiscussionForm onSubmit={vi.fn()} />);
        await fill({ title: "Valid title here", body: "short" });
        await userEvent.click(screen.getByRole("button", { name: /publish/i }));
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.queryByText(/discussion published/i)).not.toBeInTheDocument();
    });

    it("submits trimmed values and normalises tags", async () => {
        const onSubmit = vi.fn();
        render(
            <CreateDiscussionForm
                categories={[{ id: "c1", name: "React" }]}
                onSubmit={onSubmit}
            />
        );
        await fill({ title: "  useEffect not firing  ", body: "My effect never runs on mount, what could cause this?" });
        await userEvent.type(screen.getByLabelText(/Tags/), " React, Hooks ,");
        await userEvent.click(screen.getByRole("button", { name: /publish/i }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({
            title: "useEffect not firing",
            body: "My effect never runs on mount, what could cause this?",
            tags: ["react", "hooks"],
            categoryId: undefined
        });
    });

    it("surfaces server-side field errors", () => {
        render(<CreateDiscussionForm serverErrors={{ title: "A discussion with this title already exists." }} />);
        expect(screen.getByRole("alert")).toHaveTextContent(/already exists/i);
    });

    it("disables the submit button while submitting", () => {
        render(<CreateDiscussionForm submitting />);
        expect(screen.getByRole("button", { name: /publishing/i })).toBeDisabled();
    });
});
