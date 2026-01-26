import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TrainerScheduleManagerProps {
  trainerId: string;
  onLessonAdded?: () => void;
}

export const TrainerScheduleManager = ({
  trainerId,
  onLessonAdded,
}: TrainerScheduleManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scheduled_date: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.scheduled_date || !formData.start_time || !formData.end_time) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (formData.start_time >= formData.end_time) {
      toast({
        title: "Horário inválido",
        description: "A hora de início deve ser anterior à hora de término",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await (supabase.from("lessons") as any).insert([
        {
          trainer_id: trainerId,
          scheduled_date: formData.scheduled_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          notes: formData.notes || null,
          status: "available",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Horário adicionado com sucesso!",
        description: "O horário está disponível para marcações",
      });

      setFormData({
        scheduled_date: "",
        start_time: "",
        end_time: "",
        notes: "",
      });

      onLessonAdded?.();
    } catch (error) {
      console.error("Error adding lesson:", error);
      toast({
        title: "Erro ao adicionar horário",
        description: "Não foi possível adicionar o horário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Adicionar Horários Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddLesson} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_date: e.target.value })
                }
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div>
              <Label htmlFor="start_time">Hora de Início *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="end_time">Hora de Término *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Input
                id="notes"
                placeholder="Ex: Treino ao ar livre, com equipamento, etc."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {loading ? "Adicionando..." : "Adicionar Horário"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
