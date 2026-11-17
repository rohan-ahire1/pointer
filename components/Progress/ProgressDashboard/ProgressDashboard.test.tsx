import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getProblems } from "@/content";
import { resetProgress, toggleSolved } from "@/lib/progress/store";
import { ProgressDashboard } from "./ProgressDashboard";

const [first] = getProblems();

function importInput(): HTMLInputElement {
  return screen.getByLabelText("Choose a progress JSON file to import") as HTMLInputElement;
}

function chooseFile(contents: string) {
  const input = importInput();
  const file = new File([contents], "progress.json", { type: "application/json" });
  fireEvent.change(input, { target: { files: [file] } });
  return input;
}

function solvedTileText(): string {
  const label = screen.getByText("Problems solved");
  return label.parentElement?.textContent ?? "";
}

describe("ProgressDashboard import and export", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetProgress();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("imports a valid export, shows the result and clears the file input", async () => {
    render(<ProgressDashboard />);
    expect(solvedTileText()).toMatch(/^Problems solved0/);

    const input = chooseFile(JSON.stringify({ version: 1, solved: { [first.slug]: true }, lessons: {} }));

    expect(await screen.findByText("Progress imported.")).toBeInTheDocument();
    expect(solvedTileText()).toMatch(/^Problems solved1/);
    expect(input.value).toBe("");
  });

  it("rejects a file that isn't JSON and leaves progress alone", async () => {
    toggleSolved(first.slug);
    render(<ProgressDashboard />);

    const input = chooseFile("not json");

    expect(await screen.findByText("Import failed: That file isn't valid JSON.")).toBeInTheDocument();
    expect(solvedTileText()).toMatch(/^Problems solved1/);
    expect(input.value).toBe("");
  });

  it("rejects an unsupported version and leaves progress alone", async () => {
    toggleSolved(first.slug);
    render(<ProgressDashboard />);

    chooseFile('{"version":2}');

    expect(
      await screen.findByText("Import failed: Unsupported version: expected 1, got 2."),
    ).toBeInTheDocument();
    expect(solvedTileText()).toMatch(/^Problems solved1/);
  });

  it("exports the current progress as a JSON download", async () => {
    toggleSolved(first.slug);
    let blob: Blob | undefined;
    const createObjectURL = vi.fn((value: Blob) => {
      blob = value;
      return "blob:pointer-test";
    });
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    let downloadName = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
    });

    render(<ProgressDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Export progress" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(downloadName).toBe("pointer-progress.json");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:pointer-test");
    expect(blob).toBeDefined();
    const exported = JSON.parse(await blob!.text());
    expect(exported.version).toBe(1);
    expect(exported.solved[first.slug]).toBe(true);
  });
});
