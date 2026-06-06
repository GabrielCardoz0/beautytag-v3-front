import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, User, Phone, FileText, DollarSign, Calendar as CalendarIcon, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentData } from "@/types";

interface AppointmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentData | null;
  onDelete?: (id: number) => void;
}

export function AppointmentDetailsModal({
  open,
  onOpenChange,
  appointment,
  onDelete,
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  const totalPrice = appointment.services.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = appointment.services.reduce((sum, s) => sum + s.spent_time, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
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

            {appointment.clientPhone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-base">{appointment.clientPhone}</p>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Serviços ({appointment.services.length})
                </p>
                <div className="space-y-2">
                  {appointment.services.map((service) => (
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
                        R$ {(service.price / 100).toFixed(2).replace(".", ",")}
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
                    {format(appointment.startAt, "HH:mm")} - {format(appointment.endAt, "HH:mm")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data</p>
                  <p className="text-base">
                    {format(appointment.startAt, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold text-primary">
                  R$ {(totalPrice / 100).toFixed(2).replace(".", ",")}
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
          <Button
            variant="destructive"
            onClick={() => onDelete?.(appointment.id)}
          >
            Cancelar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
