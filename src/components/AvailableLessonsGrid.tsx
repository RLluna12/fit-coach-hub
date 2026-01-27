import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, addDays, startOfDay, isAfter, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Lesson {
  id: string;
  trainer_id: string;
  student_id: string | null;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: "available" | "scheduled" | "completed" | "cancelled";
  notes?: string | null;
}

interface AvailableLessonsGridProps {
  trainerId: string;
  isOwnProfile: boolean;
  onLessonBooked?: () => void;
}

export const AvailableLessonsGrid = ({ 
  trainerId, 
  isOwnProfile,
  onLessonBooked 
}: AvailableLessonsGridProps) => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [daysToShow, setDaysToShow] = useState(7);

  useEffect(() => {
    fetchLessons();
  }, [trainerId, daysToShow]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const today = startOfDay(new Date());
      const futureDate = addDays(today, daysToShow);

      const { data, error } = await (supabase.from("lessons") as any)
        .select("*")
        .eq("trainer_id", trainerId)
        .gte("scheduled_date", format(today, "yyyy-MM-dd"))
        .lte("scheduled_date", format(futureDate, "yyyy-MM-dd"))
        .eq("status", "available")
        .order("scheduled_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      
      // Filtrar apenas aulas futuras (data + hora)
      const now = new Date();
      const filteredLessons = (data || []).filter((lesson) => {
        const lessonDateTime = parse(
          `${lesson.scheduled_date} ${lesson.start_time}`,
          "yyyy-MM-dd HH:mm:ss",
          new Date()
        );
        return isAfter(lessonDateTime, now);
      });
      setLessons(filteredLessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast({
        title: "Erro ao carregar horários",
        description: "Não foi possível carregar os horários disponíveis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookLesson = async (lessonId: string) => {
    try {
      setBookingId(lessonId);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Faça login",
          description: "Você precisa estar logado para agendar uma aula",
          variant: "destructive",
        });
        return;
      }

      // Get lesson details to get trainer_id
      const lessonToBook = lessons.find((l) => l.id === lessonId);
      if (!lessonToBook) {
        throw new Error("Aula não encontrada");
      }

      const { error } = await supabase
        .from("lessons")
        .update({
          student_id: sessionData.session.user.id,
          status: "scheduled",
        })
        .eq("id", lessonId)
        .eq("status", "available");

      if (error) throw error;

      // Call edge function to send email
      try {
        await supabase.functions.invoke("send-lesson-email", {
          body: {
            lessonId,
            studentId: sessionData.session.user.id,
            trainerId: lessonToBook.trainer_id,
          },
        });
      } catch (emailErr) {
        console.warn("Email send failed but lesson was booked:", emailErr);
      }

      toast({
        title: "Aula agendada com sucesso!",
        description: "Você pode visualizar sua aula no seu perfil",
      });

      setLessons(lessons.filter((l) => l.id !== lessonId));
      onLessonBooked?.();
    } catch (error) {
      console.error("Error booking lesson:", error);
      toast({
        title: "Erro ao agendar",
        description: "Não foi possível agendar a aula. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum horário disponível nos próximos {daysToShow} dias</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group lessons by date
  const lessonsByDate = lessons.reduce(
    (acc, lesson) => {
      if (!acc[lesson.scheduled_date]) {
        acc[lesson.scheduled_date] = [];
      }
      acc[lesson.scheduled_date].push(lesson);
      return acc;
    },
    {} as Record<string, Lesson[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Horários Disponíveis</h3>
        <div className="flex gap-2">
          {[7, 14, 30].map((days) => (
            <Button
              key={days}
              variant={daysToShow === days ? "default" : "outline"}
              size="sm"
              onClick={() => setDaysToShow(days)}
            >
              {days} dias
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(lessonsByDate).map(([date, dateLessons]) => (
          <div key={date}>
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">
              {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dateLessons.map((lesson) => (
                <Card key={lesson.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="w-4 h-4 text-primary" />
                        {lesson.start_time.slice(0, 5)} - {lesson.end_time.slice(0, 5)}
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Disponível
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col gap-3">
                    {lesson.notes && (
                      <p className="text-xs text-muted-foreground">{lesson.notes}</p>
                    )}
                    {!isOwnProfile && (
                      <Button
                        onClick={() => handleBookLesson(lesson.id)}
                        disabled={bookingId === lesson.id}
                        className="mt-auto w-full gap-2"
                      >
                        {bookingId === lesson.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {bookingId === lesson.id ? "Agendando..." : "Agendar"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
