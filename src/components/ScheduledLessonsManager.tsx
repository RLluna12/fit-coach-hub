import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, Loader2, Trash2, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduledLesson {
  id: string;
  trainer_id: string;
  student_id: string | null;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: "available" | "scheduled" | "completed" | "cancelled";
  student_profile?: {
    full_name: string;
    email: string;
  };
}

interface ScheduledLessonsManagerProps {
  trainerId: string;
  isOwnProfile: boolean;
}

export const ScheduledLessonsManager = ({
  trainerId,
  isOwnProfile,
}: ScheduledLessonsManagerProps) => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<ScheduledLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "scheduled" | "past">("all");

  useEffect(() => {
    fetchLessons();
  }, [trainerId, filter]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      let query = (supabase.from("lessons") as any)
        .select(
          `
          id,
          trainer_id,
          student_id,
          scheduled_date,
          start_time,
          end_time,
          status
        `
        )
        .eq("trainer_id", trainerId);

      if (filter === "scheduled") {
        query = query.eq("status", "scheduled").gte("scheduled_date", format(new Date(), "yyyy-MM-dd"));
      } else if (filter === "past") {
        query = query.lt("scheduled_date", format(new Date(), "yyyy-MM-dd"));
      }

      const { data, error } = await query.order("scheduled_date", {
        ascending: filter === "past" ? false : true,
      });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast({
        title: "Erro ao carregar aulas",
        description: "Não foi possível carregar as aulas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Tem certeza que deseja deletar este horário?")) return;

    try {
      setDeleting(lessonId);

      const { error } = await (supabase.from("lessons") as any)
        .delete()
        .eq("id", lessonId)
        .eq("trainer_id", trainerId);

      if (error) throw error;

      toast({
        title: "Horário removido",
        description: "O horário foi removido com sucesso",
      });

      setLessons(lessons.filter((l) => l.id !== lessonId));
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o horário",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      available: {
        variant: "outline",
        label: "Disponível",
        className: "bg-green-50 text-green-700 border-green-200",
      },
      scheduled: {
        variant: "outline",
        label: "Agendada",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      },
      completed: {
        variant: "outline",
        label: "Realizada",
        className: "bg-gray-50 text-gray-700 border-gray-200",
      },
      cancelled: {
        variant: "outline",
        label: "Cancelada",
        className: "bg-red-50 text-red-700 border-red-200",
      },
    };

    const config = variants[status] || variants.available;
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Aulas Agendadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isOwnProfile && (
          <div className="flex gap-2 mb-4">
            {["all", "scheduled", "past"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f as any)}
              >
                {f === "all"
                  ? "Todas"
                  : f === "scheduled"
                    ? "Próximas"
                    : "Passadas"}
              </Button>
            ))}
          </div>
        )}

        {lessons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma aula encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  {isOwnProfile && <TableHead>Aluno</TableHead>}
                  {isOwnProfile && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">
                      {format(parseISO(lesson.scheduled_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {lesson.start_time.slice(0, 5)} - {lesson.end_time.slice(0, 5)}
                    </TableCell>
                    <TableCell>{getStatusBadge(lesson.status)}</TableCell>
                    {isOwnProfile && (
                      <TableCell>
                        {lesson.student_id ? (
                          <div className="flex items-center gap-1 text-sm">
                            <User className="w-4 h-4" />
                            Aluno agendado
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Sem aluno
                          </span>
                        )}
                      </TableCell>
                    )}
                    {isOwnProfile && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          disabled={deleting === lesson.id}
                        >
                          {deleting === lesson.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-destructive" />
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
