export type QualityStatusTone = "amber" | "green" | "neutral" | "red";

const PERCENT_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

function createRatioFormatter(fractionDigits: number): Intl.NumberFormat {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function asFiniteNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function qualityRatioToPercent(value: number | null | undefined): number | null {
  const numericValue = asFiniteNumber(value);
  if (numericValue === null) {
    return null;
  }

  return Math.max(0, Math.min(numericValue * 100, 100));
}

export function formatQualityPercent(
  value: number | null | undefined,
  fallback = "Unavailable",
): string {
  const percent = qualityRatioToPercent(value);
  if (percent === null) {
    return fallback;
  }

  return `${PERCENT_FORMATTER.format(percent)}%`;
}

export function formatQualityRatio(
  value: number | null | undefined,
  fallback = "Unavailable",
  fractionDigits = 3,
): string {
  const numericValue = asFiniteNumber(value);
  if (numericValue === null) {
    return fallback;
  }

  return createRatioFormatter(fractionDigits).format(numericValue);
}

export function getQualityStatus(
  actualRatio: number | null | undefined,
  targetRatio: number | null | undefined,
): QualityStatusTone {
  const actual = asFiniteNumber(actualRatio);
  const target = asFiniteNumber(targetRatio);
  if (actual === null || target === null) {
    return "neutral";
  }
  if (actual >= target) {
    return "green";
  }
  if (target - actual <= 0.02) {
    return "amber";
  }
  return "red";
}
