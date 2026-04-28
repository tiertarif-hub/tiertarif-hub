import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "@/components/layout/Header";

vi.mock("@/hooks/useSettings", () => ({
  useHeaderConfig: () => ({
    button_text: "Jetzt vergleichen",
    button_url: "/#schwerpunkte",
    nav_links: [
      { label: "Hunde", url: "/hundekrankenversicherung-vergleich" },
      { label: "Katzen", url: "/katzenversicherung-vergleich" },
      { label: "Pferde", url: "/pferde-op-versicherung-vergleich" },
    ],
    hub_links: [],
    tools_links: [],
  }),
  useSiteBrandName: () => "TierTarif",
}));

describe("Header", () => {
  it("zeigt den Desktop-CTA mit korrektem Startseiten-Anker", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const ctaLink = screen.getByRole("link", { name: /jetzt vergleichen/i });
    expect(ctaLink.getAttribute("href")).toBe("/#schwerpunkte");
  });

  it("verlinkt die drei Money-Vergleiche in der Navigation", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Hunde" }).getAttribute("href")).toBe("/hundekrankenversicherung-vergleich");
    expect(screen.getByRole("link", { name: "Katzen" }).getAttribute("href")).toBe("/katzenversicherung-vergleich");
    expect(screen.getByRole("link", { name: "Pferde" }).getAttribute("href")).toBe("/pferde-op-versicherung-vergleich");
  });
});
