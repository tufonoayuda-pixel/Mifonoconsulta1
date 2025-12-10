"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { mySchedule } from "@/utils/schedule"; // Import mySchedule from utility

interface ScheduleDetail {
  location: string;
  time: string;
  note?: string;
}

interface ScheduleEntry {
  day: string;
  details: ScheduleDetail[];
}

const MyScheduleCard: React.FC = () => {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Mi Horario de Atención
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {mySchedule.map((entry, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 last:border-b-0 last:pb-0">
              <p className="font-semibold w-24">{entry.day}</p>
              <div className="flex-1 space-y-1 sm:space-y-0">
                {entry.details.length > 0 && entry.details[0].location === "No trabajo" ? (
                  <p className="text-muted-foreground italic">No trabajo</p>
                ) : (
                  entry.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{detail.location}: {detail.time}</span>
                      {detail.note && <span className="text-xs text-muted-foreground">({detail.note})</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyScheduleCard;