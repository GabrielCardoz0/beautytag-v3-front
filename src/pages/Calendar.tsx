import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { AppointmentCard, Appointment } from "@/components/AppointmentCard";
import { AppointmentDetailsModal } from "@/components/AppointmentDetailsModal";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "Maria Silva",
    service: "Corte Feminino",
    startTime: "09:00",
    endTime: "10:00",
    duration: 60,
    price: 80,
    phone: "(11) 99999-9999",
    notes: "Cliente preferencial, usar produtos específicos"
  },
  {
    id: "2",
    clientName: "João Santos",
    service: "Corte Masculino",
    startTime: "10:30",
    endTime: "11:00",
    duration: 30,
    price: 50,
    phone: "(11) 98888-8888"
  },
  {
    id: "3",
    clientName: "Ana Costa",
    service: "Coloração",
    startTime: "14:00",
    endTime: "16:00",
    duration: 120,
    price: 150,
    phone: "(11) 97777-7777",
    notes: "Primeira coloração, fazer teste de alergia"
  },
];

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar with mini calendar */}
      <div className="w-80 border-r border-border p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Calendário</h2>
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
            className="rounded-md border shadow-sm pointer-events-auto"
          />
        </div>

        <Button
          onClick={() => setIsBookingModalOpen(true)}
          className="w-full gap-2"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Nova Reserva
        </Button>

        <div className="pt-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h3>
          <p className="text-2xl font-bold text-foreground">
            {mockAppointments.length} agendamentos
          </p>
        </div>
      </div>

      {/* Main calendar view */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {format(weekStart, "MMMM yyyy", { locale: ptBR })}
            </h1>
          </div>

          {/* Week view */}
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const dayAppointments = mockAppointments; // In real app, filter by day

              return (
                <Card
                  key={index}
                  className={`p-4 min-h-[500px] ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="mb-4">
                    <div
                      className={`text-center p-2 rounded-lg ${
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      <p className="text-xs font-medium uppercase">
                        {format(day, "EEE", { locale: ptBR })}
                      </p>
                      <p className="text-2xl font-bold">
                        {format(day, "dd")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {isSelected &&
                      dayAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onClick={() => handleAppointmentClick(appointment)}
                        />
                      ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <BookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        selectedDate={selectedDate}
      />

      <AppointmentDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        appointment={selectedAppointment}
      />
    </div>
  );
}
