import { Clock, User, Package } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface ServiceItem {
  id: number;
  name: string;
  price: number;
  spent_time: number;
  description?: string;
  genre?: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  services: ServiceItem[];
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
  const serviceCount = appointment.services?.length || 0;

  return (
    <Card
      onClick={onClick}
      className="p-4 mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary bg-card hover:bg-accent/50"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{appointment.clientName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>{serviceCount} {serviceCount === 1 ? 'serviço' : 'serviços'}</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>
          <span className="font-bold text-primary text-sm">
            R$ {(appointment.price / 100).toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </Card>
  );
}
