import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationToast, { useToastList } from "../../components/forum/NotificationToast";

const toasts = [
    { id: "t1", message: "@priya mentioned you", type: "success" },
    { id: "t2", message: "Vote failed", type: "error" }
];

describe("NotificationToast", () => {
    it("renders each toast with its message", () => {
        render(<NotificationToast toasts={toasts} onDismiss={() => {}} />);
        expect(screen.getAllByTestId("toast")).toHaveLength(2);
        expect(screen.getByText("@priya mentioned you")).toBeInTheDocument();
        expect(screen.getByText("Vote failed")).toBeInTheDocument();
    });

    it("dismisses a toast from its close button", async () => {
        const onDismiss = vi.fn();
        render(<NotificationToast toasts={toasts} onDismiss={onDismiss} />);
        await userEvent.click(screen.getAllByRole("button", { name: "Dismiss notification" })[1]);
        expect(onDismiss).toHaveBeenCalledWith("t2");
    });

    it("renders nothing when the list is empty", () => {
        const { container } = render(<NotificationToast toasts={[]} onDismiss={() => {}} />);
        expect(container.firstChild).toBeNull();
    });

    it("auto-dismisses after the configured delay", () => {
        vi.useFakeTimers();
        const onDismiss = vi.fn();
        render(<NotificationToast toasts={[{ id: "t1", message: "Hi" }]} onDismiss={onDismiss} autoDismissMs={4000} />);
        expect(onDismiss).not.toHaveBeenCalled();
        vi.advanceTimersByTime(4100);
        expect(onDismiss).toHaveBeenCalledWith("t1");
        vi.useRealTimers();
    });
});

describe("useToastList helper", () => {
    function Harness() {
        const { toasts: list, pushToast, dismissToast } = useToastList();
        return (
            <div>
                <button type="button" onClick={() => pushToast("hello", "success")}>push</button>
                <button
                    type="button"
                    onClick={() => list.forEach((toast) => dismissToast(toast.id))}
                >
                    clear
                </button>
                <span data-testid="count">{list.length}</span>
                <NotificationToast toasts={list} />
            </div>
        );
    }

    it("pushes and clears toasts through the hook", async () => {
        render(<Harness />);
        expect(screen.getByTestId("count")).toHaveTextContent("0");
        await userEvent.click(screen.getByRole("button", { name: "push" }));
        expect(screen.getByTestId("count")).toHaveTextContent("1");
        await userEvent.click(screen.getByRole("button", { name: "clear" }));
        expect(screen.getByTestId("count")).toHaveTextContent("0");
    });
});
