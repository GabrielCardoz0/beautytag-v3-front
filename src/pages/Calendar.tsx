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

  const appointmentsForSelectedDate = mockAppointments.filter(a => 
    isSameDay(a.date, selectedDate)
  );

  return (
    <div className="flex flex-col h-screen bg-background overflow-auto">
      {/* Header com calendário e resumo */}
      <div className="border-b border-border p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mini calendário */}
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Calendário</h2>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border shadow-sm pointer-events-auto"
            />
          </div>

          {/* Resumo e ações */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h1>
              <p className="text-muted-foreground">
                {appointmentsForSelectedDate.length} agendamento(s) para este dia
              </p>
            </div>
            
            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => setIsBookingModalOpen(true)}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Nova Reserva
              </Button>
            </div>
          </div>

          {/* Estatísticas da semana */}
          <div className="flex-shrink-0 p-4 rounded-lg border bg-muted/30">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Semana de {format(weekStart, "dd/MM", { locale: ptBR })}
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {mockAppointments.filter(a => {
                return a.date >= weekStart && a.date < addDays(weekStart, 7);
              }).length}
            </p>
            <p className="text-sm text-muted-foreground">agendamentos</p>
          </div>
        </div>
      </div>

      {/* Visão semanal - colunas lado a lado com scroll horizontal */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-4 min-w-max">
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            const dayAppointments = mockAppointments.filter(a => isSameDay(a.date, day));

            return (
              <Card
                key={index}
                className={`w-64 flex-shrink-0 cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary" : ""
                } ${isToday ? "border-primary" : ""}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="p-4 border-b">
                  <div
                    className={`text-center p-2 rounded-lg ${
                      isToday ? "bg-primary/10" : ""
                    }`}
                  >
                    <p className={`text-xs font-medium uppercase ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                      {format(day, "EEE", { locale: ptBR })}
                    </p>
                    <p className={`text-2xl font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                      {format(day, "dd")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dayAppointments.length} agendamento(s)
                    </p>
                  </div>
                </div>

                <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                  {dayAppointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sem agendamentos
                    </p>
                  ) : (
                    dayAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onClick={() => handleAppointmentClick(appointment)}
                      />
                    ))
                  )}
                </div>
              </Card>
            );
          })}
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
