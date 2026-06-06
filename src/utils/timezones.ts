export type TimezoneOption = {
  value: string;
  label: string;
  offsetMinutes: number;
};

const REPRESENTATIVE_TIMEZONES = [
  "Etc/GMT+12",
  "Pacific/Pago_Pago",
  "Pacific/Honolulu",
  "Pacific/Marquesas",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/St_Johns",
  "America/Sao_Paulo",
  "Atlantic/South_Georgia",
  "Atlantic/Cape_Verde",
  "UTC",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Asia/Tehran",
  "Asia/Dubai",
  "Asia/Kabul",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Kathmandu",
  "Asia/Dhaka",
  "Asia/Yangon",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Australia/Eucla",
  "Asia/Tokyo",
  "Australia/Adelaide",
  "Australia/Sydney",
  "Australia/Lord_Howe",
  "Pacific/Noumea",
  "Pacific/Auckland",
  "Pacific/Chatham",
  "Pacific/Apia",
  "Pacific/Kiritimati",
] as const;

export const TIMEZONE_OPTIONS: TimezoneOption[] = buildTimezoneOptions();

export function formatTimezoneLabel(timezone: string): string {
  const offsetMinutes = getTimezoneOffsetMinutes(timezone);
  return `${timezone} (${formatOffset(offsetMinutes)})`;
}

function buildTimezoneOptions(): TimezoneOption[] {
  const seenOffsets = new Set<number>();

  return REPRESENTATIVE_TIMEZONES.flatMap((timezone) => {
    const offsetMinutes = getTimezoneOffsetMinutes(timezone);
    if (seenOffsets.has(offsetMinutes)) return [];

    seenOffsets.add(offsetMinutes);
    return [
      {
        value: timezone,
        label: `${timezone} (${formatOffset(offsetMinutes)})`,
        offsetMinutes,
      },
    ];
  });
}

function getTimezoneOffsetMinutes(timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const offset = formatter.formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value;

  if (!offset || offset === "GMT") return 0;

  const match = /^GMT(?<sign>[+-])(?<hours>\d{1,2})(?::(?<minutes>\d{2}))?$/.exec(offset);
  if (!match?.groups) return 0;

  const sign = match.groups.sign === "-" ? -1 : 1;
  const hours = Number(match.groups.hours);
  const minutes = Number(match.groups.minutes ?? "0");

  return sign * (hours * 60 + minutes);
}

function formatOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return "UTC+00:00";

  const sign = offsetMinutes < 0 ? "-" : "+";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
