import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Trash2, Plus, Loader2, User, Phone, Mail, Building2, Calendar } from 'lucide-react';
import { Plan, Service } from '@/types';
import { plansApi, servicesApi } from '@/lib/api';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface PlanDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  onRefresh: () => void;
}

export function PlanDetailsModal({ open, onOpenChange, plan, onRefresh }: PlanDetailsModalProps) {
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('1x');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (open && showAddForm) {
      servicesApi.list().then(setServices).catch(() => toast.error('Erro ao carregar serviços'));
    }
  }, [open, showAddForm]);

  if (!plan) return null;

  const handleAddService = async () => {
    if (!selectedServiceId) return;
    try {
      setAdding(true);
      await plansApi.addService(plan.id, parseInt(selectedServiceId), selectedFrequency);
      toast.success('Serviço adicionado ao plano');
      setShowAddForm(false);
      setSelectedServiceId('');
      setSelectedFrequency('1x');
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao adicionar serviço');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveService = async (planServiceId: number) => {
    try {
      setRemovingId(planServiceId);
      await plansApi.removeService(plan.id, planServiceId);
      toast.success('Serviço removido do plano');
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover serviço');
    } finally {
      setRemovingId(null);
    }
  };

  const handleDeleteCollaborator = async () => {
    if (!plan) return;
    try {
      setDeleting(true);
      await plansApi.delete(plan.id);
      toast.success('Colaborador excluído com sucesso');
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir colaborador');
    } finally {
      setDeleting(false);
    }
  };

  const availableServices = services.filter(
    s => !plan.planServices.some(ps => ps.serviceId === s.id)
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Plano</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{plan.userName}</span>
            <Badge variant="outline" className="ml-auto">{plan.status}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="break-all">{plan.userEmail}</span>
            </div>
            {plan.userPhone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{plan.userPhone}</span>
              </div>
            )}
            {plan.userCompany && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{plan.userCompany}</span>
              </div>
            )}
            {plan.userBirthday && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(plan.userBirthday)}</span>
              </div>
            )}
            {plan.userCpf && (
              <div className="text-muted-foreground">
                <span className="text-xs">CPF:</span> {plan.userCpf}
              </div>
            )}
            {plan.userGenre && (
              <div className="text-muted-foreground">
                <span className="text-xs">Gênero:</span> {plan.userGenre}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Serviços do Plano</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {showAddForm && (
            <div className="flex flex-col sm:flex-row gap-2 p-3 border rounded-lg bg-muted/20">
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} - R$ {formatCurrency(s.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['1x', '2x', '3x', '4x'].map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddService} disabled={!selectedServiceId || adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {plan.planServices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum serviço no plano</p>
            ) : (
              plan.planServices.map(ps => (
                <div key={ps.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{ps.serviceName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>R$ {formatCurrency(ps.price)}</span>
                      <span>×</span>
                      <Badge variant="secondary" className="text-xs">{ps.frequency}</Badge>
                      <span>=</span>
                      <span className="font-semibold text-foreground">R$ {formatCurrency(ps.price * parseInt(ps.frequency))}</span>
                      <span>• {ps.spentTime} min</span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveService(ps.id)}
                    disabled={removingId === ps.id}
                  >
                    {removingId === ps.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <span className="font-medium text-foreground">Total mensal</span>
            <span className="font-bold text-lg text-foreground">R$ {formatCurrency(plan.totalValue)}</span>
          </div>

          <div className="pt-4 border-t space-y-2">
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir colaborador
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir colaborador?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o colaborador <strong>{plan.userName}</strong>? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteCollaborator();
                    }}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
