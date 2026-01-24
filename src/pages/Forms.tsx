import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, Eye, Copy, Check, Loader2 } from 'lucide-react';
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
import { Form, Service, FormServiceOption } from '@/types';
import { formsApi, servicesApi } from '@/lib/api';
import { toast } from 'sonner';

export default function Forms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formsData, servicesData] = await Promise.all([
        formsApi.list(),
        servicesApi.list()
      ]);
      setForms(formsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (formId: number) => {
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/form/${formId}`;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedId(formId);
      toast.success('Link copiado!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Erro ao copiar link');
    }
  };

  const handleSaveForm = async (formData: {
    name: string;
    description: string;
    serviceOptions: FormServiceOption[];
  }) => {
    try {
      await formsApi.create({
        name: formData.name,
        description: formData.description || undefined,
        forms_options: formData.serviceOptions.map(opt => ({
          id: opt.serviceId,
          secondary_options: opt.secondaryServiceIds.map(id => ({ id })),
        })),
      });
      toast.success('Formulário cadastrado com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error('Erro ao cadastrar formulário');
    }
  };

  const handleDeleteForm = async (id: number) => {
    try {
      await formsApi.delete(id);
      toast.success('Formulário excluído com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Erro ao excluir formulário');
    }
  };

  const getServiceById = (id: number) => services.find(s => s.id === id);

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (form: Form) => {
    setSelectedForm(form);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <div className="flex flex-col gap-3 max-w-3xl">
          {filteredForms.map(form => (
            <Card key={form.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{form.name}</h3>
                      {form.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {form.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {form.serviceOptions.length} serviço(s)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleCopyLink(form.id)}
                      title="Copiar link público"
                    >
                      {copiedId === form.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
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
