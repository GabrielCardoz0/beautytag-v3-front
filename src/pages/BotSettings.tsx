import { useState, useEffect, useRef } from 'react';
import { Bot, Save, MessageSquare, Clock, ToggleLeft, ToggleRight, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function BotSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo?');
  const [responseDelay, setResponseDelay] = useState('2');
  const [businessHoursStart, setBusinessHoursStart] = useState('08:00');
  const [businessHoursEnd, setBusinessHoursEnd] = useState('18:00');
  const [outOfHoursMessage, setOutOfHoursMessage] = useState('Nosso horário de atendimento é das 08:00 às 18:00. Deixe sua mensagem que responderemos assim que possível.');

  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSave = () => {
    toast.success('Configurações do bot salvas com sucesso!');
  };

  const startWhatsappPolling = async () => {
    setWhatsappModalOpen(true);
    setQrLoading(true);
    setQrCode(null);

    const fetchQr = async () => {
      try {
        const response = await api.get<{ is_connected: boolean; base64: string }>('/evolution/qrcode');
        if (response.data.is_connected) {
          stopPolling();
          setWhatsappModalOpen(false);
          toast.success('WhatsApp conectado com sucesso!');
          return;
        }
        setQrCode(response.data.base64);
        setQrLoading(false);
      } catch (error) {
        console.error('Error fetching QR code:', error);
        setQrLoading(false);
      }
    };

    await fetchQr();
    pollingRef.current = setInterval(fetchQr, 5000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Bot className="h-8 w-8" />
            Bot de Atendimento
          </h1>
          <p className="text-muted-foreground mt-1">Configure o bot de atendimento automático</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {/* Status do Bot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isEnabled ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
              Status do Bot
            </CardTitle>
            <CardDescription>Ative ou desative o bot de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{isEnabled ? 'Bot Ativo' : 'Bot Desativado'}</p>
                <p className="text-sm text-muted-foreground">
                  {isEnabled ? 'O bot está respondendo automaticamente' : 'O bot não está respondendo'}
                </p>
              </div>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Mensagem de Boas-vindas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensagem de Boas-vindas
            </CardTitle>
            <CardDescription>Primeira mensagem enviada quando alguém inicia uma conversa</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Digite a mensagem de boas-vindas..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Configurações de Tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configurações de Tempo
            </CardTitle>
            <CardDescription>Configure o tempo de resposta e horário de funcionamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="responseDelay">Tempo de resposta (segundos)</Label>
              <Input
                id="responseDelay"
                type="number"
                min="0"
                max="30"
                value={responseDelay}
                onChange={(e) => setResponseDelay(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Delay antes de enviar resposta automática</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessHoursStart">Horário de início</Label>
                <Input
                  id="businessHoursStart"
                  type="time"
                  value={businessHoursStart}
                  onChange={(e) => setBusinessHoursStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessHoursEnd">Horário de término</Label>
                <Input
                  id="businessHoursEnd"
                  type="time"
                  value={businessHoursEnd}
                  onChange={(e) => setBusinessHoursEnd(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensagem Fora do Horário */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagem Fora do Horário</CardTitle>
            <CardDescription>Mensagem enviada quando alguém entra em contato fora do horário comercial</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outOfHoursMessage}
              onChange={(e) => setOutOfHoursMessage(e.target.value)}
              placeholder="Digite a mensagem para fora do horário..."
              rows={3}
            />
          </CardContent>
        </Card>
        {/* Conexão WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Conexão WhatsApp
            </CardTitle>
            <CardDescription>Conecte o bot ao WhatsApp para atendimento automático</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={startWhatsappPolling}>
              <Smartphone className="h-4 w-4 mr-2" />
              Conectar WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp QR Code Modal */}
      <Dialog open={whatsappModalOpen} onOpenChange={(open) => {
        if (!open) {
          stopPolling();
          setWhatsappModalOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Conectar WhatsApp
            </DialogTitle>
            <DialogDescription>
              Escaneie o QR Code abaixo com o WhatsApp do seu celular
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {qrLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center gap-3">
                <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64" />
                <p className="text-sm text-muted-foreground">Aguardando conexão...</p>
              </div>
            ) : (
              <p className="text-sm text-destructive">Erro ao carregar QR Code. Tente novamente.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
