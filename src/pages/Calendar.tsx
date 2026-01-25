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
    <div className="flex h-screen bg-background">
      {/* Sidebar: Calendário + Resumo */}
      <div className="w-80 flex-shrink-0 border-r border-border p-6 bg-card flex flex-col">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          locale={ptBR}
          className="rounded-md border shadow-sm pointer-events-auto bg-background mb-6"
        />

        {/* Info do dia selecionado */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground capitalize mb-1">
            {format(selectedDate, "EEEE", { locale: ptBR })}
          </h1>
          <p className="text-3xl font-bold text-primary mb-1">
            {format(selectedDate, "dd")}
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          
          <div className="text-sm mb-4">
            <span className="text-xl font-bold text-foreground">{appointmentsForSelectedDate.length}</span>
            <span className="text-muted-foreground ml-2">agendamento(s)</span>
          </div>
          
          <Button
            onClick={() => setIsBookingModalOpen(true)}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Reserva
          </Button>
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs dos dias da semana */}
        <div className="border-b border-border bg-muted/30">
          <div className="flex overflow-x-auto">
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const dayAppointments = mockAppointments.filter(a => isSameDay(a.date, day));

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`flex-1 min-w-[100px] px-4 py-3 text-center transition-all border-b-2 ${
                    isSelected 
                      ? "border-primary bg-background" 
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <p className={`text-xs font-medium uppercase ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {format(day, "EEE", { locale: ptBR })}
                  </p>
                  <p className={`text-lg font-bold ${
                    isSelected ? "text-primary" : isToday ? "text-primary" : "text-foreground"
                  }`}>
                    {format(day, "dd")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dayAppointments.length > 0 ? `${dayAppointments.length} agend.` : "-"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de agendamentos do dia selecionado */}
        <div className="flex-1 overflow-auto p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Agendamentos de {format(selectedDate, "dd/MM", { locale: ptBR })}
          </h2>
          
          {appointmentsForSelectedDate.length === 0 ? (
            <Card className="border-dashed">
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Nenhum agendamento para este dia</p>
                <Button onClick={() => setIsBookingModalOpen(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Agendamento
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3 max-w-2xl">
              {appointmentsForSelectedDate
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((appointment) => (
                  <Card 
                    key={appointment.id} 
                    className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center flex-shrink-0 w-16">
                        <p className="text-lg font-bold text-primary">{appointment.startTime}</p>
                        <p className="text-xs text-muted-foreground">{appointment.endTime}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{appointment.clientName}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {appointment.services.map(s => s.name).join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">{appointment.duration} min</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-foreground">
                          R$ {(appointment.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
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
