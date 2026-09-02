import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NotificationToast from "../../components/forum/NotificationToast";

const notifications = [
  { id: "n1", type: "mention", message: "rahul mentioned you in “Optimistic UI…”", link: "/forum/d2" },
  { id: "n2", type: "system", message: "Welcome to the Thinkz AI community!" },
];

describe("NotificationToast (Phase 8)", () => {
  it("renders nothing without notifications", () => {
    const { container } = render(<NotificationToast notifications={[]} onDismiss={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one toast per notification with a dismiss button", () => {
    const onDismiss = vi.fn();
    render(<NotificationToast notifications={notifications} onDismiss={onDismiss} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/rahul mentioned you/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /dismiss notification/i })).toHaveLength(2);
  });

  it("dismisses a specific notification via its close button", () => {
    const onDismiss = vi.fn();
    render(<NotificationToast notifications={notifications} onDismiss={onDismiss} />);

    fireEvent.click(screen.getAllByRole("button", { name: /dismiss notification/i })[0]);
    expect(onDismiss).toHaveBeenCalledWith("n1");
  });

  it("auto-dismisses each notification after autoCloseMs", () => {
    vi.useFakeTimers();
    try {
      const onDismiss = vi.fn();
      render(
        <NotificationToast
          notifications={[notifications[0]]}
          onDismiss={onDismiss}
          autoCloseMs={1000}
        />
      );

      expect(onDismiss).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1200);
      expect(onDismiss).toHaveBeenCalledWith("n1");
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps toasts when autoCloseMs is disabled", () => {
    vi.useFakeTimers();
    try {
      const onDismiss = vi.fn();
      render(
        <NotificationToast
          notifications={[notifications[0]]}
          onDismiss={onDismiss}
          autoCloseMs={null}
        />
      );
      vi.advanceTimersByTime(10000);
      expect(onDismiss).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
