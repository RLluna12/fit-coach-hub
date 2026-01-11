import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple client-side validation
    if (!cardName || !cardNumber || !expiry || !cvc || !email) {
      toast({ title: "Erro", description: "Preencha todos os campos." });
      return;
    }

    setLoading(true);

    try {
      // Aqui você integraria com o gateway (ex: Stripe).
      // Por enquanto simulamos sucesso.
      await new Promise((r) => setTimeout(r, 800));

      toast({ title: "Pagamento confirmado", description: "Assinatura ativa. Bem-vindo ao Trainer Pro!" });

      // Redireciona para o perfil do trainer
      navigate('/trainer/profile');
    } catch (err) {
      toast({ title: "Falha no pagamento", description: "Tente novamente mais tarde." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-20">
      <div className="max-w-lg mx-auto">
        <Card className="shadow">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Pagamento</CardTitle>
            <p className="text-muted-foreground mt-2">Complete os dados do cartão para ativar sua assinatura Trainer Pro — R$29,90/mês</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome no cartão</Label>
                <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Nome como aparece no cartão" />
              </div>

              <div>
                <Label>Número do cartão</Label>
                <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Validade (MM/AA)</Label>
                  <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/AA" />
                </div>
                <div>
                  <Label>CVC</Label>
                  <Input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" />
                </div>
              </div>

              <div>
                <Label>Email de cobrança</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processando…" : "Pagar R$29,90/mês"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">Cancele quando quiser. Pagamento seguro.</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Checkout;
