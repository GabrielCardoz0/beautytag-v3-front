import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react';
import { Service, FormServiceOption, Form, FormSecondaryOption } from '@/types';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface FormEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Form | null;
  services: Service[];
  onSave: (formId: number, data: { name: string; description: string; serviceOptions: FormServiceOption[] }) => void;
  onRefresh?: () => void;
}

export function FormEditModal({ open, onOpenChange, form, services, onSave, onRefresh }: FormEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [serviceOptions, setServiceOptions] = useState<FormServiceOption[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null);
  const [deletingSecondaryId, setDeletingSecondaryId] = useState<number | null>(null);

  useEffect(() => {
    if (form) {
      setFormData({
        name: form.name,
        description: form.description,
      });
      setServiceOptions([...form.serviceOptions]);
    }
  }, [form]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const removeServiceOption = async (index: number) => {
    const option = serviceOptions[index];
    
    if (option.optionId > 0) {
      try {
        setDeletingOptionId(option.optionId);
        await formsApi.deleteOption(option.optionId);
        toast.success('Serviço removido do formulário');
        onRefresh?.();
      } catch (error) {
        console.error('Error deleting option:', error);
        toast.error('Erro ao remover serviço');
        return;
      } finally {
        setDeletingOptionId(null);
      }
    }
    
    setServiceOptions(prev => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const removeSecondaryService = async (optionIndex: number, secondary: FormSecondaryOption) => {
    if (secondary.id > 0) {
      try {
        setDeletingSecondaryId(secondary.id);
        await formsApi.deleteSecondaryOption(secondary.id);
        toast.success('Opção secundária removida');
        onRefresh?.();
      } catch (error) {
        console.error('Error deleting secondary option:', error);
        toast.error('Erro ao remover opção secundária');
        return;
      } finally {
        setDeletingSecondaryId(null);
      }
    }
    
    setServiceOptions(prev => prev.map((opt, i) => {
      if (i !== optionIndex) return opt;
      return {
        ...opt,
        secondaryOptions: opt.secondaryOptions.filter(s => s.serviceId !== secondary.serviceId)
      };
    }));
  };

  const getServiceById = (id: number) => services.find(s => s.id === id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;

    if (!formData.name) {
      toast.error('Preencha o nome do formulário');
      return;
    }

    const validOptions = serviceOptions.filter(opt => opt.serviceId > 0);
    if (validOptions.length === 0) {
      toast.error('O formulário precisa ter pelo menos um serviço');
      return;
    }

    onSave(form.id, {
      name: formData.name,
      description: formData.description,
      serviceOptions: validOptions,
    });
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Formulário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formName">Nome do Formulário *</Label>
              <Input
                id="formName"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Formulário de Agendamento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formDescription">Descrição do Formulário</Label>
              <Textarea
                id="formDescription"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descrição opcional do formulário..."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base">Serviços do Formulário</Label>

            {serviceOptions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Nenhum serviço no formulário</p>
              </div>
            ) : (
              <div className="space-y-3">
                {serviceOptions.map((option, index) => {
                  const service = getServiceById(option.serviceId);
                  const isExpanded = expandedIndex === index;
                  const secondaryServices = option.secondaryOptions.map(s => ({
                    ...s,
                    service: getServiceById(s.serviceId)
                  })).filter(s => s.service);

                  return (
                    <Collapsible 
                      key={index} 
                      open={isExpanded}
                      onOpenChange={(open) => setExpandedIndex(open ? index : null)}
                    >
                      <div className="border rounded-lg overflow-hidden">
                        <div className="p-4 bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Label className="text-sm text-muted-foreground mb-1 block">Serviço Principal</Label>
                              <p className="font-medium text-foreground">
                                {service ? `${service.name} - R$ ${formatCurrency(service.price)}` : 'Serviço não encontrado'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {secondaryServices.length > 0 && (
                                <CollapsibleTrigger asChild>
                                  <Button type="button" variant="ghost" size="icon">
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeServiceOption(index)}
                                disabled={deletingOptionId === option.optionId}
                              >
                                {deletingOptionId === option.optionId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {secondaryServices.length > 0 && !isExpanded && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="text-xs text-muted-foreground">Secundários:</span>
                              {secondaryServices.map(s => s.service && (
                                <Badge 
                                  key={s.serviceId} 
                                  variant="secondary" 
                                  className="text-xs flex items-center gap-1 pr-1"
                                >
                                  {s.service.name}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSecondaryService(index, s);
                                    }}
                                    disabled={deletingSecondaryId === s.id}
                                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                  >
                                    {deletingSecondaryId === s.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <X className="h-3 w-3" />
                                    )}
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <CollapsibleContent>
                          <div className="p-4 border-t bg-background">
                            <Label className="text-sm text-muted-foreground mb-3 block">
                              Opções Secundárias
                            </Label>
                            
                            <div className="space-y-2">
                              {secondaryServices.map(s => s.service && (
                                <div 
                                  key={s.serviceId}
                                  className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{s.service.name}</p>
                                    <p className="text-xs text-muted-foreground">R$ {formatCurrency(s.service.price)}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => removeSecondaryService(index, s)}
                                    disabled={deletingSecondaryId === s.id}
                                  >
                                    {deletingSecondaryId === s.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    )}
                                  </Button>
                                </div>
                              ))}
                              {secondaryServices.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-2">Nenhuma opção secundária</p>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
