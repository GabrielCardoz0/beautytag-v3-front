import { useState, useEffect } from 'react';
import { Search, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanDetailsModal } from '@/components/PlanDetailsModal';
import { Plan } from '@/types';
import { plansApi } from '@/lib/api';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function Collaborators() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await plansApi.list();
      setPlans(data);
      if (selectedPlan) {
        const updated = data.find(p => p.id === selectedPlan.id);
        if (updated) setSelectedPlan(updated);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan =>
    plan.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.userCompany.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlanClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDetailsOpen(true);
  };

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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Colaboradores</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:max-w-md"
        />
      </div>

      {filteredPlans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum colaborador encontrado</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? 'Tente ajustar sua busca' : 'Colaboradores aparecem aqui quando se cadastram via formulário'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Colaborador</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Empresa</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Serviços</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPlans.map(plan => (
                  <tr
                    key={plan.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handlePlanClick(plan)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold">
                            {plan.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{plan.userName}</p>
                          <p className="text-sm text-muted-foreground">{plan.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{plan.userCompany || '-'}</td>
                    <td className="p-4">
                      <Badge variant={plan.status === 'ativo' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">{plan.planServices.length}</td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-foreground">R$ {formatCurrency(plan.totalValue)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {filteredPlans.map(plan => (
              <Card
                key={plan.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handlePlanClick(plan)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">
                          {plan.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{plan.userName}</p>
                        <p className="text-sm text-muted-foreground truncate">{plan.userEmail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={plan.status === 'ativo' ? 'default' : 'secondary'} className="text-xs">
                            {plan.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{plan.planServices.length} serviço(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-foreground">R$ {formatCurrency(plan.totalValue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <PlanDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        plan={selectedPlan}
        onRefresh={loadPlans}
      />
    </div>
  );
}
