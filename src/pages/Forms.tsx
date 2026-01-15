import { useState } from 'react';
import { Plus, Search, FileText, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormModal } from '@/components/FormModal';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Form, Service } from '@/types';
import { toast } from 'sonner';

export default function Forms() {
  const [forms, setForms] = useLocalStorage<Form[]>('platai-forms', []);
  const [services] = useLocalStorage<Service[]>('platai-services', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSaveForm = (formData: Omit<Form, 'id' | 'createdAt'>) => {
    const newForm: Form = {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setForms(prev => [...prev, newForm]);
  };

  const handleDeleteForm = (id: string) => {
    setForms(prev => prev.filter(f => f.id !== id));
    toast.success('Formulário excluído com sucesso!');
  };

  const getServiceById = (id: string) => services.find(s => s.id === id);

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (form: Form) => {
    setSelectedForm(form);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-foreground">Formulários</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Formulário
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filteredForms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum formulário encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece cadastrando seu primeiro formulário'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Formulário
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map(form => (
            <Card key={form.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{form.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {form.serviceOptions.length} serviço(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewDetails(form)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o formulário "{form.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteForm(form.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {form.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {form.description}
                  </p>
                )}

                <div className="pt-3 border-t space-y-2">
                  {form.serviceOptions.slice(0, 3).map((option, idx) => {
                    const service = getServiceById(option.serviceId);
                    return service ? (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">{service.name}</span>
                        <span className="text-muted-foreground">R$ {service.price.toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}
                  {form.serviceOptions.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{form.serviceOptions.length - 3} mais serviço(s)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveForm}
        services={services}
      />

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedForm?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedForm && (
            <div className="space-y-6">
              {selectedForm.description && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h4>
                  <p className="text-foreground">{selectedForm.description}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Serviços</h4>
                <div className="space-y-4">
                  {selectedForm.serviceOptions.map((option, idx) => {
                    const mainService = getServiceById(option.serviceId);
                    const secondaryServices = option.secondaryServiceIds
                      .map(id => getServiceById(id))
                      .filter(Boolean);

                    return (
                      <div key={idx} className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">
                            {mainService?.name || 'Serviço não encontrado'}
                          </span>
                          <Badge variant="outline">
                            R$ {mainService?.price.toFixed(2) || '0.00'}
                          </Badge>
                        </div>
                        
                        {secondaryServices.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-2">Opções Secundárias:</p>
                            <div className="flex flex-wrap gap-2">
                              {secondaryServices.map(s => s && (
                                <Badge key={s.id} variant="secondary">
                                  {s.name} - R$ {s.price.toFixed(2)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Criado em: {new Date(selectedForm.createdAt).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
