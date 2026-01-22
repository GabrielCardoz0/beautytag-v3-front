import { useState } from 'react';
import { Bot, Save, MessageSquare, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function BotSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo?');
  const [responseDelay, setResponseDelay] = useState('2');
  const [businessHoursStart, setBusinessHoursStart] = useState('08:00');
  const [businessHoursEnd, setBusinessHoursEnd] = useState('18:00');
  const [outOfHoursMessage, setOutOfHoursMessage] = useState('Nosso horário de atendimento é das 08:00 às 18:00. Deixe sua mensagem que responderemos assim que possível.');

  const handleSave = () => {
    // Mock save - would call API
    toast.success('Configurações do bot salvas com sucesso!');
  };

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
      </div>
    </div>
  );
}
