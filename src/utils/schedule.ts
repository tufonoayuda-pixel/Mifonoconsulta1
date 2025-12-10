export interface ScheduleDetail {
  location: string;
  time: string; // Format: "HH:MM - HH:MM"
  note?: string;
}

export interface ScheduleEntry {
  day: string;
  details: ScheduleDetail[];
}

export const mySchedule: ScheduleEntry[] = [
  {
    day: "Lunes",
    details: [{ location: "UAPORRINO", time: "14:00 - 20:00" }],
  },
  {
    day: "Martes",
    details: [{ location: "UAPORRINO", time: "08:00 - 17:00", note: "Colación a las 13:00" }],
  },
  {
    day: "Miércoles",
    details: [{ location: "No trabajo", time: "" }],
  },
  {
    day: "Jueves",
    details: [
      { location: "UAPORRINO", time: "08:00 - 13:00" },
      { location: "RBC", time: "14:00 - 17:00", note: "Colación a las 13:00" },
    ],
  },
  {
    day: "Viernes",
    details: [{ location: "RBC", time: "08:00 - 17:00", note: "Colación a las 13:00" }],
  },
];

export const getAvailableRooms = (): string[] => {
  const rooms = new Set<string>();
  mySchedule.forEach(entry => {
    entry.details.forEach(detail => {
      if (detail.location !== "No trabajo" && detail.location) {
        rooms.add(detail.location);
      }
    });
  });
  return Array.from(rooms);
};

export const getAvailableDaysForRoom = (room: string): string[] => {
  if (!room || room === "Sin preferencia") return [];
  const days = new Set<string>();
  mySchedule.forEach(entry => {
    if (entry.details.some(detail => detail.location === room)) {
      days.add(entry.day);
    }
  });
  return Array.from(days);
};

export const getWorkingHoursForDayAndRoom = (day: string, room: string): ScheduleDetail[] => {
  if (!day || !room || day === "Sin preferencia" || room === "Sin preferencia") return [];
  const entry = mySchedule.find(e => e.day === day);
  if (entry) {
    return entry.details.filter(detail => detail.location === room && detail.time);
  }
  return [];
};

// Helper to check if a given time (HH:MM) falls within a time range ("HH:MM - HH:MM")
export const isTimeWithinRange = (time: string, range: string): boolean => {
  if (!time || !range) return false;
  const [startTimeStr, endTimeStr] = range.split(' - ');
  if (!startTimeStr || !endTimeStr) return false;

  const parseTime = (t: string) => {
    const [hours, minutes] = t.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes since midnight
  };

  const targetTime = parseTime(time);
  const startTime = parseTime(startTimeStr);
  const endTime = parseTime(endTimeStr);

  return targetTime >= startTime && targetTime <= endTime;
};