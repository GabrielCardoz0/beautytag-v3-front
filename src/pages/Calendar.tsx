import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { AppointmentCard, Appointment, ServiceItem } from "@/components/AppointmentCard";
import { AppointmentDetailsModal } from "@/components/AppointmentDetailsModal";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock services
const mockServices: ServiceItem[] = [
  { id: 1, name: "Corte Feminino", price: 8000, spent_time: 60, genre: "feminino" },
  { id: 2, name: "Corte Masculino", price: 5000, spent_time: 30, genre: "masculino" },
  { id: 3, name: "Coloração", price: 15000, spent_time: 120, genre: "feminino" },
  { id: 4, name: "Barba", price: 3500, spent_time: 30, genre: "masculino" },
  { id: 5, name: "Escova Progressiva", price: 20000, spent_time: 120, genre: "feminino" },
];

// Mock data with dates
const today = new Date();
const weekStartDate = startOfWeek(today, { weekStartsOn: 0 });

const mockAppointments: (Appointment & { date: Date })[] = [
  {
    id: "1",
    clientName: "Maria Silva",
    services: [mockServices[0], mockServices[2]],
    startTime: "09:00",
    endTime: "11:00",
    duration: 180,
    price: 23000,
    phone: "(11) 99999-9999",
    notes: "Cliente preferencial, usar produtos específicos",
    date: addDays(weekStartDate, 1),
  },
  {
    id: "2",
    clientName: "João Santos",
    services: [mockServices[1], mockServices[3]],
    startTime: "10:30",
    endTime: "11:30",
    duration: 60,
    price: 8500,
    phone: "(11) 98888-8888",
    date: addDays(weekStartDate, 1),
  },
  {
    id: "3",
    clientName: "Ana Costa",
    services: [mockServices[2]],
    startTime: "14:00",
    endTime: "16:00",
    duration: 120,
    price: 15000,
    phone: "(11) 97777-7777",
    notes: "Primeira coloração, fazer teste de alergia",
    date: addDays(weekStartDate, 3),
  },
  {
    id: "4",
    clientName: "Carlos Souza",
    services: [mockServices[3]],
    startTime: "11:00",
    endTime: "11:30",
    duration: 30,
    price: 3500,
    phone: "(11) 96666-6666",
    date: addDays(weekStartDate, 2),
  },
  {
    id: "5",
    clientName: "Paula Lima",
    services: [mockServices[4], mockServices[0]],
    startTime: "15:00",
    endTime: "18:00",
    duration: 180,
    price: 28000,
    phone: "(11) 95555-5555",
    date: addDays(weekStartDate, 5),
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
            Semana de {format(startOfWeek(selectedDate, { weekStartsOn: 0 }), "dd/MM", { locale: ptBR })}
          </h3>
          <p className="text-2xl font-bold text-foreground">
            {mockAppointments.filter(a => {
              const weekS = startOfWeek(selectedDate, { weekStartsOn: 0 });
              return a.date >= weekS && a.date < addDays(weekS, 7);
            }).length} agendamentos
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
                          ? "border-2 border-primary"
                          : "text-foreground"
                      }`}
                    >
                      <p className={`text-xs font-medium uppercase ${isToday ? "text-primary" : ""}`}>
                        {format(day, "EEE", { locale: ptBR })}
                      </p>
                      <p className={`text-2xl font-bold ${isToday ? "text-primary" : ""}`}>
                        {format(day, "dd")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {mockAppointments
                      .filter(appointment => isSameDay(appointment.date, day))
                      .map((appointment) => (
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
