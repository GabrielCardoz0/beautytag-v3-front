import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Service } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ServiceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function ServiceDetailsModal({ 
  open, 
  onOpenChange, 
  service, 
  onEdit, 
  onDelete 
}: ServiceDetailsModalProps) {
  const calculations = useMemo(() => {
    if (!service) return { precoColaborador: '0,00', precoParceiro: '0,00', lucro: '0,00' };
    
    const price = service.price;
    const precoColaborador = price * (service.colaboradorPercent / 100);
    const precoParceiro = price * (service.repassePercent / 100);
    const lucro = price - precoColaborador - precoParceiro;

    return {
      precoColaborador: formatCurrency(precoColaborador),
      precoParceiro: formatCurrency(precoParceiro),
      lucro: formatCurrency(lucro),
    };
  }, [service]);

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'masculino': return 'Masculino';
      case 'feminino': return 'Feminino';
      case 'unissex': return 'Unissex';
      default: return gender;
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'masculino': return 'bg-blue-100 text-blue-800';
      case 'feminino': return 'bg-pink-100 text-pink-800';
      case 'unissex': return 'bg-purple-100 text-purple-800';
      default: return '';
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{service.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getGenderColor(service.gender)}>
                  {getGenderLabel(service.gender)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {service.spentTime} min
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o serviço "{service.name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {service.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h4>
              <p className="text-foreground">{service.description}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Preço Base</span>
              <span className="text-2xl font-bold text-foreground">R$ {formatCurrency(service.price)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Repasse</p>
                <p className="text-lg font-semibold">{service.repassePercent}%</p>
                <p className="text-sm text-muted-foreground">R$ {calculations.precoParceiro}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Colaborador</p>
                <p className="text-lg font-semibold">{service.colaboradorPercent}%</p>
                <p className="text-sm text-muted-foreground">R$ {calculations.precoColaborador}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <div className="flex justify-between items-center">
                <span className="text-green-700 dark:text-green-400 font-medium">Lucro</span>
                <span className="text-xl font-bold text-green-700 dark:text-green-400">R$ {calculations.lucro}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            Criado em: {new Date(service.createdAt).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
