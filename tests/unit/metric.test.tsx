import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { basisText, MetricList, MetricStat } from "@/components/site/metric";

describe("metric components", () => {
  it("renders the figure with its hedge and basis", () => {
    render(
      <MetricStat
        metric={{
          value: "25%",
          label: "Query gains",
          hedge: "up to",
          basis: { kind: "stated", source: "both" },
        }}
      />,
    );
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("up to")).toBeInTheDocument();
    expect(screen.getByText(/As stated on the résumé and LinkedIn/)).toBeInTheDocument();
  });

  it("describes measured bases", () => {
    expect(
      basisText({ kind: "measured", what: "p75 LCP", tool: "Lighthouse CI", window: "every push" }),
    ).toBe("Measured: p75 LCP, with Lighthouse CI, every push");
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<MetricList metrics={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
