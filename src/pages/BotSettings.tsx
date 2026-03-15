import { useState, useEffect, useRef } from 'react';
import { Bot, Save, MessageSquare, Clock, ToggleLeft, ToggleRight, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export default function BotSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [botName, setBotName] = useState('');
  const [behavior, setBehavior] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [responseDelay, setResponseDelay] = useState('2');
  const [businessHoursStart, setBusinessHoursStart] = useState('08:00');
  const [businessHoursEnd, setBusinessHoursEnd] = useState('18:00');
  const [outOfHoursMessage, setOutOfHoursMessage] = useState('');

  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchBot = async () => {
      try {
        const response = await api.get<{ bot: { is_active: boolean; is_connected: boolean; name: string; behavior: string; company_description: string; welcome_msg: string; out_of_turn_msg: string; response_time: number; start_time: number; end_time: number } }>('/bot');
        const bot = response.data.bot;
        setIsEnabled(bot.is_active);
        setIsConnected(bot.is_connected);
        setBotName(bot.name || '');
        setBehavior(bot.behavior || '');
        setCompanyDescription(bot.company_description || '');
        setWelcomeMessage(bot.welcome_msg);
        setOutOfHoursMessage(bot.out_of_turn_msg);
        setResponseDelay(String(bot.response_time));
        setBusinessHoursStart(minutesToTime(bot.start_time));
        setBusinessHoursEnd(minutesToTime(bot.end_time));
      } catch (error) {
        console.error('Error fetching bot settings:', error);
        toast.error('Erro ao carregar configurações do bot');
      } finally {
        setLoading(false);
      }
    };
    fetchBot();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/bot', {
        is_active: isEnabled,
        welcome_msg: welcomeMessage,
        out_of_turn_msg: outOfHoursMessage,
        response_time: Number(responseDelay),
        start_time: timeToMinutes(businessHoursStart),
        end_time: timeToMinutes(businessHoursEnd),
      });
      toast.success('Configurações do bot salvas com sucesso!');
    } catch (error) {
      console.error('Error saving bot settings:', error);
      toast.error('Erro ao salvar configurações do bot');
    } finally {
      setSaving(false);
    }
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
          setIsConnected(true);
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar Configurações
        </Button>
      </div>

      <div className="grid gap-6 max-w-3xl">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Conexão WhatsApp
            </CardTitle>
            <CardDescription>Conecte o bot ao WhatsApp para atendimento automático</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Button onClick={startWhatsappPolling} variant={isConnected ? 'outline' : 'default'}>
                <Smartphone className="h-4 w-4 mr-2" />
                {isConnected ? 'Reconectar WhatsApp' : 'Conectar WhatsApp'}
              </Button>
              {isConnected && (
                <span className="text-sm text-green-600 font-medium">● Conectado</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
