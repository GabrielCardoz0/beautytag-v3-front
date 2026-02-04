import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, Copy, Check, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormModal } from '@/components/FormModal';
import { FormEditModal } from '@/components/FormEditModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deleteFormId, setDeleteFormId] = useState<number | null>(null);

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

  const handleCopyLink = async (e: React.MouseEvent, formId: number) => {
    e.stopPropagation();
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
          secondary_options: opt.secondaryOptions.map(sec => ({ id: sec.serviceId })),
        })),
      });
      toast.success('Formulário cadastrado com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error('Erro ao cadastrar formulário');
    }
  };

  const handleUpdateForm = async (formId: number, formData: {
    name: string;
    description: string;
    serviceOptions: FormServiceOption[];
  }) => {
    try {
      await formsApi.update(formId, {
        name: formData.name,
        description: formData.description || undefined,
        forms_options: formData.serviceOptions.map(opt => ({
          id: opt.serviceId,
          secondary_options: opt.secondaryOptions.map(sec => ({ id: sec.serviceId })),
        })),
      });
      toast.success('Formulário atualizado com sucesso!');
      setIsEditOpen(false);
      setSelectedForm(null);
      loadData();
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Erro ao atualizar formulário');
    }
  };

  const handleDeleteForm = async (id: number) => {
    try {
      await formsApi.delete(id);
      toast.success('Formulário excluído com sucesso!');
      setDeleteFormId(null);
      loadData();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Erro ao excluir formulário');
    }
  };

  const handleFormClick = (form: Form) => {
    setSelectedForm(form);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, formId: number) => {
    e.stopPropagation();
    setDeleteFormId(formId);
  };

  const getServiceById = (id: number) => services.find(s => s.id === id);

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Formulários</h1>
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
          className="pl-10 w-full md:max-w-md"
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
        <>
          {/* Desktop: Table layout */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Formulário</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Serviços</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Criado em</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredForms.map(form => (
                  <tr 
                    key={form.id} 
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleFormClick(form)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{form.name}</p>
                          {form.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {form.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {form.serviceOptions.slice(0, 3).map((opt, idx) => {
                          const service = getServiceById(opt.serviceId);
                          return service ? (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {service.name}
                            </Badge>
                          ) : null;
                        })}
                        {form.serviceOptions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{form.serviceOptions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(form.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => handleCopyLink(e, form.id)}
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
                          onClick={(e) => handleDeleteClick(e, form.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Card layout */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredForms.map(form => (
              <Card 
                key={form.id} 
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleFormClick(form)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{form.name}</p>
                        {form.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {form.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {form.serviceOptions.length} serviço(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => handleCopyLink(e, form.id)}
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
                        onClick={(e) => handleDeleteClick(e, form.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveForm}
        services={services}
      />

      <FormEditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        form={selectedForm}
        services={services}
        onSave={handleUpdateForm}
        onRefresh={loadData}
      />

      <AlertDialog open={deleteFormId !== null} onOpenChange={() => setDeleteFormId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este formulário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteFormId && handleDeleteForm(deleteFormId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
