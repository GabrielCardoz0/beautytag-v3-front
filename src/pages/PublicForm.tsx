import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, Service, ApiService, ApiForm, apiServiceToService, apiFormToForm } from '@/types';
import { Sparkles, Play, FileText, User, ShoppingCart, CheckCircle, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/api';

interface PersonalInfo {
  nome: string;
  email: string;
  cpf: string;
  genero: string;
  empresa: string;
  whatsapp: string;
  dataNascimento: string;
  cep: string;
}

interface ServiceSelection {
  optionIndex: number; // index in form.serviceOptions
  serviceId: number; // currently selected service (main or secondary alternative)
  frequency: string;
}

const PublicForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<Form | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    nome: '',
    email: '',
    cpf: '',
    genero: '',
    empresa: '',
    whatsapp: '',
    dataNascimento: '',
    cep: '',
  });
  const [serviceSelections, setServiceSelections] = useState<ServiceSelection[]>([]);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadFormData = async () => {
      if (!formId) return;
      
      try {
        const response = await axios.get<{ forms: ApiForm }>(`${API_BASE_URL}/forms/${formId}`);
        const apiForm = response.data.forms;
        
        if (apiForm) {
          const convertedForm = apiFormToForm(apiForm);
          setForm(convertedForm);
          
          // Extract all unique services (main + secondary)
          const uniqueServices: Service[] = [];
          apiForm.forms_options.forEach(opt => {
            if (opt.options && !uniqueServices.find(s => s.id === opt.options.id)) {
              uniqueServices.push(apiServiceToService(opt.options));
            }
            opt.forms_options_secondary_options?.forEach(secOpt => {
              const serviceId = secOpt.options?.id;
              if (serviceId && !uniqueServices.find(s => s.id === serviceId)) {
                uniqueServices.push(apiServiceToService(secOpt.options));
              }
            });
          });
          
          setServices(uniqueServices);
          
          // Initialize with main services selected by default
          const initialSelections = convertedForm.serviceOptions.map((opt, index) => ({
            optionIndex: index,
            serviceId: opt.serviceId,
            frequency: '',
          }));
          setServiceSelections(initialSelections);
        }
      } catch (error) {
        console.error('Error loading form:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [formId]);

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceFrequencyChange = (optionIndex: number, frequency: string) => {
    setServiceSelections(prev => 
      prev.map(sel => 
        sel.optionIndex === optionIndex ? { ...sel, frequency } : sel
      )
    );
  };

  const handleSwapService = (optionIndex: number, newServiceId: number) => {
    setServiceSelections(prev =>
      prev.map(sel =>
        sel.optionIndex === optionIndex ? { ...sel, serviceId: newServiceId, frequency: '' } : sel
      )
    );
    setSwappingIndex(null);
  };

  const getServiceById = (id: number) => services.find(s => s.id === id);

  const isPersonalInfoValid = () => {
    return personalInfo.nome && personalInfo.email && personalInfo.cpf && 
           personalInfo.genero && personalInfo.whatsapp && personalInfo.dataNascimento && personalInfo.cep;
  };

  const isServicesValid = () => {
    return serviceSelections.some(sel => sel.frequency !== '');
  };

  const calculateTotal = () => {
    return serviceSelections.reduce((total, sel) => {
      const service = getServiceById(sel.serviceId);
      if (!service || !sel.frequency) return total;
      const frequencyMultiplier = parseInt(sel.frequency.replace('x', ''));
      return total + (service.price * frequencyMultiplier);
    }, 0);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    
    try {
      const payload = {
        name: personalInfo.nome,
        email: personalInfo.email,
        metadata: {
          cpf: personalInfo.cpf,
          empresa: personalInfo.empresa || '',
          birthday: new Date(personalInfo.dataNascimento).toISOString(),
          genre: personalInfo.genero,
          whatsapp: personalInfo.whatsapp,
          cep: personalInfo.cep,
        },
        plan_services: serviceSelections
          .filter(sel => sel.frequency !== '')
          .map(sel => ({
            id: sel.serviceId,
            frequency: sel.frequency,
          })),
      };

      await axios.post(`${API_BASE_URL}/plans`, payload);
      setCurrentStep(6);
    } catch (error) {
      console.error('Error submitting plan:', error);
      alert('Erro ao enviar cadastro. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Formulário não encontrado</h2>
            <p className="text-muted-foreground">O link que você acessou não é válido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = [
    { icon: Sparkles, label: 'Bem-vindo' },
    { icon: Play, label: 'Vídeo' },
    { icon: FileText, label: 'Termos' },
    { icon: User, label: 'Dados' },
    { icon: ShoppingCart, label: 'Serviços' },
    { icon: CheckCircle, label: 'Resumo' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {currentStep < 6 && (
        <div className="bg-card border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    index <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-12 lg:w-24 h-1 mx-2 rounded ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 0: Welcome */}
        {currentStep === 0 && (
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Bem-vindo!</h1>
              <p className="text-muted-foreground mb-2 text-lg">{form.name}</p>
              <p className="text-muted-foreground mb-8">{form.description}</p>
              <Button size="lg" onClick={nextStep} className="px-8">
                Cadastre-se
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Video */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Vídeo de Introdução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Assista ao vídeo abaixo para conhecer mais sobre nossos serviços.
              </p>
              <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-black">
                <iframe
                  ref={videoRef}
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/6--8lDFBhOg?enablejsapi=1"
                  title="Vídeo de Introdução"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center gap-2 mb-6">
                <Checkbox 
                  id="watched" 
                  checked={videoWatched}
                  onCheckedChange={(checked) => setVideoWatched(checked === true)}
                />
                <Label htmlFor="watched" className="cursor-pointer">
                  Eu assisti ao vídeo completo
                </Label>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={nextStep} disabled={!videoWatched}>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Terms */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Termos e Condições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 h-64 overflow-y-auto mb-6 text-sm text-muted-foreground">
                <h3 className="font-semibold text-foreground mb-2">1. Termos Gerais</h3>
                <p className="mb-4">
                  Ao utilizar nossos serviços, você concorda com os seguintes termos e condições. 
                  Por favor, leia atentamente antes de prosseguir.
                </p>
                <h3 className="font-semibold text-foreground mb-2">2. Serviços</h3>
                <p className="mb-4">
                  Os serviços oferecidos estão sujeitos a disponibilidade e podem ser alterados 
                  sem aviso prévio. Reservamo-nos o direito de recusar serviço a qualquer pessoa.
                </p>
                <h3 className="font-semibold text-foreground mb-2">3. Pagamentos</h3>
                <p className="mb-4">
                  Os pagamentos devem ser realizados conforme acordado. Cancelamentos devem ser 
                  feitos com antecedência mínima de 24 horas.
                </p>
                <h3 className="font-semibold text-foreground mb-2">4. Privacidade</h3>
                <p className="mb-4">
                  Seus dados pessoais serão tratados de acordo com nossa política de privacidade 
                  e em conformidade com a LGPD.
                </p>
                <h3 className="font-semibold text-foreground mb-2">5. Responsabilidades</h3>
                <p>
                  O cliente é responsável por fornecer informações precisas e manter seus dados 
                  de contato atualizados.
                </p>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                />
                <Label htmlFor="terms" className="cursor-pointer">
                  Li e aceito os termos e condições
                </Label>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={nextStep} disabled={!termsAccepted}>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Personal Info */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={personalInfo.nome}
                    onChange={(e) => handlePersonalInfoChange('nome', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={personalInfo.cpf}
                    onChange={(e) => handlePersonalInfoChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genero">Gênero *</Label>
                  <Select 
                    value={personalInfo.genero} 
                    onValueChange={(value) => handlePersonalInfoChange('genero', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input
                    required
                    id="empresa"
                    value={personalInfo.empresa}
                    onChange={(e) => handlePersonalInfoChange('empresa', e.target.value)}
                    placeholder="Nome da empresa (opcional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    value={personalInfo.whatsapp}
                    onChange={(e) => handlePersonalInfoChange('whatsapp', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={personalInfo.dataNascimento}
                    onChange={(e) => handlePersonalInfoChange('dataNascimento', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={personalInfo.cep}
                    onChange={(e) => handlePersonalInfoChange('cep', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={nextStep} disabled={!isPersonalInfoValid()}>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Services Selection */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Selecione seus Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Escolha a frequência desejada para cada serviço. Você pode trocar por uma opção alternativa se preferir.
              </p>
              <div className="space-y-4 mb-6">
                {form.serviceOptions.map((option, index) => {
                  const selection = serviceSelections.find(s => s.optionIndex === index);
                  const currentService = selection ? getServiceById(selection.serviceId) : null;
                  const isSwapping = swappingIndex === index;
                  const hasAlternatives = option.secondaryOptions.length > 0;
                  
                  if (!currentService) return null;

                  // Get all alternative services for this option
                  const alternatives = [
                    { serviceId: option.serviceId, isMain: true },
                    ...option.secondaryOptions.map(sec => ({ serviceId: sec.serviceId, isMain: false })),
                  ].filter(alt => alt.serviceId !== selection?.serviceId);
                  
                  return (
                    <Card key={index} className="border-2">
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">{currentService.name}</h3>
                            <p className="text-sm text-muted-foreground">{currentService.description}</p>
                            <p className="text-primary font-medium mt-1">
                              R$ {formatCurrency(currentService.price)} por sessão
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-full md:w-48">
                              <Select 
                                value={selection?.frequency || ''} 
                                onValueChange={(value) => handleServiceFrequencyChange(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Frequência" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1x">1x por mês</SelectItem>
                                  <SelectItem value="2x">2x por mês</SelectItem>
                                  <SelectItem value="3x">3x por mês</SelectItem>
                                  <SelectItem value="4x">4x por mês</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {hasAlternatives && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={() => setSwappingIndex(isSwapping ? null : index)}
                                title="Trocar serviço"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {isSwapping && alternatives.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-3">Trocar por:</p>
                            <div className="space-y-2">
                              {alternatives.map(alt => {
                                const altService = getServiceById(alt.serviceId);
                                if (!altService) return null;
                                return (
                                  <button
                                    key={alt.serviceId}
                                    type="button"
                                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                                    onClick={() => handleSwapService(index, alt.serviceId)}
                                  >
                                    <div>
                                      <p className="font-medium text-sm">{altService.name}</p>
                                      <p className="text-xs text-muted-foreground">{altService.description}</p>
                                    </div>
                                    <span className="text-primary font-medium text-sm whitespace-nowrap ml-4">
                                      R$ {formatCurrency(altService.price)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="bg-primary/5 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Mensal Estimado:</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={nextStep} disabled={!isServicesValid()}>
                  Revisar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Summary */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Resumo do Cadastro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Dados Pessoais</h3>
                  <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Nome:</span> {personalInfo.nome}</div>
                    <div><span className="text-muted-foreground">Email:</span> {personalInfo.email}</div>
                    <div><span className="text-muted-foreground">CPF:</span> {personalInfo.cpf}</div>
                    <div><span className="text-muted-foreground">Gênero:</span> {personalInfo.genero}</div>
                    <div><span className="text-muted-foreground">WhatsApp:</span> {personalInfo.whatsapp}</div>
                    <div><span className="text-muted-foreground">Nascimento:</span> {personalInfo.dataNascimento}</div>
                    <div><span className="text-muted-foreground">CEP:</span> {personalInfo.cep}</div>
                    {personalInfo.empresa && (
                      <div><span className="text-muted-foreground">Empresa:</span> {personalInfo.empresa}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Serviços Selecionados</h3>
                  <div className="space-y-2">
                    {serviceSelections.filter(sel => sel.frequency !== '').map((sel, index) => {
                      const service = getServiceById(sel.serviceId);
                      if (!service) return null;
                      const frequencyMultiplier = parseInt(sel.frequency.replace('x', ''));
                      const subtotal = service.price * frequencyMultiplier;
                      
                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <span className="font-medium">{service.name}</span>
                            <span className="text-muted-foreground ml-2">({sel.frequency} por mês)</span>
                          </div>
                          <span className="font-semibold">R$ {formatCurrency(subtotal)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Mensal:</span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={handleConfirm} size="lg" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Confirmar Cadastro'}
                  <CheckCircle className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Thank You */}
        {currentStep === 6 && (
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400">
                Cadastro Realizado!
              </h1>
              <p className="text-muted-foreground mb-2 text-lg">
                Obrigado por se cadastrar, {personalInfo.nome}!
              </p>
              <p className="text-muted-foreground mb-8">
                Em breve entraremos em contato pelo WhatsApp para confirmar seus agendamentos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicForm;
