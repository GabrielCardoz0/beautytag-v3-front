import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Appointment } from "./AppointmentCard";
import { Clock, User, Phone, FileText, DollarSign, Calendar as CalendarIcon, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AppointmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export function AppointmentDetailsModal({
  open,
  onOpenChange,
  appointment,
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p className="text-lg font-semibold">{appointment.clientName}</p>
              </div>
            </div>

            {appointment.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-base">{appointment.phone}</p>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Serviços ({appointment.services?.length || 0})
                </p>
                <div className="space-y-2">
                  {appointment.services?.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{service.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {service.spent_time} min
                          </Badge>
                          {service.genre && (
                            <Badge variant="outline" className="text-xs">
                              {service.genre}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold text-primary">
                        R$ {(service.price / 100).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Horário</p>
                  <p className="text-base">
                    {appointment.startTime} - {appointment.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duração</p>
                  <p className="text-base">{appointment.duration} minutos</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold text-primary">
                  R$ {(appointment.price / 100).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            {appointment.notes && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                    <p className="text-base mt-1">{appointment.notes}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button variant="destructive">Cancelar Agendamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
