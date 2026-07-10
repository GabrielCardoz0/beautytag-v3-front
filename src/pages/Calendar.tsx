import { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Loader2, CalendarDays } from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { AppointmentDetailsModal } from "@/components/AppointmentDetailsModal";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentData } from "@/types";
import { appointmentsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Calendar() {
  const { user } = useAuth();
  const isPartner = user?.role === 'partner' || user?.role === 'parceiro';
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false);
  const [monthAppointments, setMonthAppointments] = useState<AppointmentData[]>([]);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.list(
        weekStart.toISOString(),
        weekEnd.toISOString()
      );
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, [weekStart.toISOString(), weekEnd.toISOString()]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    if (!isPartner) return;
    appointmentsApi
      .earnings()
      .then(setEarnings)
      .catch((err) => {
        console.error("Error loading earnings:", err);
        setEarnings({ today: 0, month: 0 });
      });
  }, [isPartner]);


  const handleDeleteAppointment = async (id: number) => {
    try {
      await appointmentsApi.delete(id);
      toast.success("Agendamento removido com sucesso!");
      setIsDetailsModalOpen(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Erro ao remover agendamento");
    }
  };

  const appointmentsForDate = (date: Date) =>
    appointments.filter((a) => isSameDay(a.startAt, date));

  const appointmentsForSelectedDate = appointmentsForDate(selectedDate);

  const SidebarContent = (
    <>
      <CalendarComponent
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          if (date) {
            setSelectedDate(date);
            setMobileCalendarOpen(false);
          }
        }}
        locale={ptBR}
        className="rounded-md border shadow-sm pointer-events-auto bg-background mb-6 w-full"
      />

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
          <span className="text-xl font-bold text-foreground">
            {appointmentsForSelectedDate.length}
          </span>
          <span className="text-muted-foreground ml-2">agendamento(s)</span>
        </div>

        <Button
          onClick={() => {
            setIsBookingModalOpen(true);
            setMobileCalendarOpen(false);
          }}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Reserva
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-80 flex-shrink-0 border-r border-border p-6 bg-card flex-col">
        {SidebarContent}
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between gap-2 p-4 border-b border-border bg-card sticky top-0 z-10">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground capitalize truncate">
            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {appointmentsForSelectedDate.length} agendamento(s)
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Sheet open={mobileCalendarOpen} onOpenChange={setMobileCalendarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarDays className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90vw] max-w-sm overflow-y-auto p-6 flex flex-col">
              <SheetHeader className="mb-4">
                <SheetTitle>Calendário</SheetTitle>
              </SheetHeader>
              {SidebarContent}
            </SheetContent>
          </Sheet>
          <Button onClick={() => setIsBookingModalOpen(true)} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Week tabs */}
        <div className="border-b border-border bg-muted/30">
          <div className="flex overflow-x-auto">
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const dayCount = appointmentsForDate(day).length;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`flex-1 min-w-[72px] md:min-w-[100px] px-2 md:px-4 py-3 text-center transition-all border-b-2 ${
                    isSelected
                      ? "border-primary bg-background"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <p className={`text-xs font-medium uppercase ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {format(day, "EEE", { locale: ptBR })}
                  </p>
                  <p className={`text-lg font-bold ${isSelected || isToday ? "text-primary" : "text-foreground"}`}>
                    {format(day, "dd")}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {dayCount > 0 ? `${dayCount}` : "-"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointments list */}
        <div className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          {isPartner && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 max-w-2xl">
              <Card className="p-4">
                <p className="text-xs md:text-sm text-muted-foreground">Faturamento Hoje</p>
                <p className="text-xl md:text-2xl font-bold text-primary mt-1">
                  R$ {(earnings.today / 100).toFixed(2).replace('.', ',')}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs md:text-sm text-muted-foreground">Faturamento Este Mês</p>
                <p className="text-xl md:text-2xl font-bold text-primary mt-1">
                  R$ {(earnings.month / 100).toFixed(2).replace('.', ',')}
                </p>
              </Card>
            </div>
          )}

          <h2 className="text-base md:text-lg font-semibold text-foreground mb-4">
            Agendamentos de {format(selectedDate, "dd/MM", { locale: ptBR })}
          </h2>


          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointmentsForSelectedDate.length === 0 ? (
            <Card className="border-dashed">
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
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
                .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
                .map((appointment) => {
                  const totalPrice = appointment.services.reduce((sum, s) => sum + s.price, 0);
                  const totalDuration = appointment.services.reduce((sum, s) => sum + s.spent_time, 0);

                  return (
                    <Card
                      key={appointment.id}
                      className="p-3 md:p-4 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-center flex-shrink-0 w-14 md:w-16">
                          <p className="text-base md:text-lg font-bold text-primary">
                            {format(appointment.startAt, "HH:mm")}
                          </p>
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            {format(appointment.endAt, "HH:mm")}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                            {appointment.clientName}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {appointment.services.map((s) => s.name).join(", ")}
                          </p>
                          <p className="text-[10px] md:text-xs text-muted-foreground">{totalDuration} min</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm md:text-lg font-bold text-foreground whitespace-nowrap">
                            R$ {(totalPrice / 100).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      <BookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        selectedDate={selectedDate}
        onCreated={loadAppointments}
      />

      <AppointmentDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        appointment={selectedAppointment}
        onDelete={handleDeleteAppointment}
      />
    </div>
  );
}
