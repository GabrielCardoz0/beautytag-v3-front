import { Clock, User, Scissors } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface Appointment {
  id: string;
  clientName: string;
  service: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  notes?: string;
  phone?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: () => void;
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  return (
    <Card
      onClick={onClick}
      className="p-3 mb-2 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-appointment-border bg-appointment-bg/50 hover:bg-appointment-bg"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm">{appointment.clientName}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Scissors className="h-4 w-4" />
          <span>{appointment.service}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{appointment.duration} min</span>
          <span className="font-semibold text-primary">R$ {appointment.price}</span>
        </div>
      </div>
    </Card>
  );
}
