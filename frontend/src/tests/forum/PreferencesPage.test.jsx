import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PreferencesPage from "../../pages/forum/PreferencesPage";
import { forumApi, CURRENT_USER } from "../../services/forumApi";

vi.mock("../../services/forumApi", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        forumApi: {
            ...actual.forumApi,
            getPreferences: vi.fn(),
            savePreferences: vi.fn()
        }
    };
});

afterEach(() => vi.clearAllMocks());

describe("PreferencesPage", () => {
    it("loads and displays the saved preferences", async () => {
        forumApi.getPreferences.mockResolvedValue({
            data: { email: true, inApp: false, sms: false }
        });
        render(<PreferencesPage />);

        await waitFor(() =>
            expect(screen.getByTestId("pref-toggle-email")).toHaveAttribute("aria-checked", "true")
        );
        expect(screen.getByTestId("pref-toggle-inApp")).toHaveAttribute("aria-checked", "false");
        expect(forumApi.getPreferences).toHaveBeenCalledWith(CURRENT_USER.id);
    });

    it("flips a channel and saves the new preference set", async () => {
        forumApi.getPreferences.mockResolvedValue({
            data: { email: true, inApp: true, sms: false }
        });
        forumApi.savePreferences.mockImplementation(async (prefs) => ({ data: prefs }));
        render(<PreferencesPage />);

        const smsToggle = await screen.findByTestId("pref-toggle-sms");
        await userEvent.click(smsToggle);
        expect(smsToggle).toHaveAttribute("aria-checked", "true");

        await userEvent.click(screen.getByRole("button", { name: /save preferences/i }));

        await waitFor(() =>
            expect(forumApi.savePreferences).toHaveBeenCalledWith(
                { email: true, inApp: true, sms: true },
                CURRENT_USER.id
            )
        );
        expect(await screen.findByText("Preferences saved")).toBeInTheDocument();
    });
});
