import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, User, Loader2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface Trainer {
  id: string;
  full_name: string;
  avatar_url: string | null;
  specialization: string | null;
  lessonCount: number;
}

interface Lesson {
  id: string;
  trainer_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
  trainer: {
    full_name: string;
    avatar_url: string | null;
  };
}

const StudentBooking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, loading: authLoading } = useAuth();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      if (userRole === "trainer") {
        navigate("/trainer/profile");
        return;
      }
      fetchTrainersWithLessons();
    }
  }, [user, userRole, authLoading, navigate]);

  const fetchTrainersWithLessons = async () => {
    setLoading(true);
    try {
      // Buscar trainers com aulas disponíveis
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select(`
          id,
          trainer_id,
          scheduled_date,
          start_time,
          end_time,
          notes,
          profiles!lessons_trainer_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("status", "available")
        .gte("scheduled_date", format(new Date(), "yyyy-MM-dd"))
        .order("scheduled_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (lessonsError) throw lessonsError;

      // Agrupar trainers e contar suas aulas
      const trainersMap = new Map<string, Trainer>();
      
      lessonsData?.forEach((lesson: any) => {
        const trainerId = lesson.trainer_id;
        if (!trainersMap.has(trainerId)) {
          trainersMap.set(trainerId, {
            id: trainerId,
            full_name: lesson.profiles?.full_name || "Personal Trainer",
            avatar_url: lesson.profiles?.avatar_url || null,
            specialization: null,
            lessonCount: 0,
          });
        }
        const trainer = trainersMap.get(trainerId)!;
        trainer.lessonCount++;
      });

      setTrainers(Array.from(trainersMap.values()));
    } catch (error) {
      console.error("Error fetching trainers:", error);
      toast({
        title: "Erro ao carregar personal trainers",
        description: "Não foi possível carregar os personal trainers disponíveis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerLessons = async (trainerId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select(`
          id,
          trainer_id,
          scheduled_date,
          start_time,
          end_time,
          notes,
          profiles!lessons_trainer_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("trainer_id", trainerId)
        .eq("status", "available")
        .gte("scheduled_date", format(new Date(), "yyyy-MM-dd"))
        .order("scheduled_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      const formattedLessons = data?.map((lesson: any) => ({
        id: lesson.id,
        trainer_id: lesson.trainer_id,
        scheduled_date: lesson.scheduled_date,
        start_time: lesson.start_time,
        end_time: lesson.end_time,
        notes: lesson.notes,
        trainer: {
          full_name: lesson.profiles?.full_name || "Personal Trainer",
          avatar_url: lesson.profiles?.avatar_url || null,
        },
      })) || [];

      setLessons(formattedLessons);
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

  const handleSelectTrainer = (trainerId: string) => {
    setSelectedTrainer(trainerId);
    fetchTrainerLessons(trainerId);
  };

  const handleBackToTrainers = () => {
    setSelectedTrainer(null);
    setLessons([]);
  };

  const handleBookLesson = async (lessonId: string) => {
    try {
      setBookingId(lessonId);

      const { error } = await supabase
        .from("lessons")
        .update({
          student_id: user!.id,
          status: "scheduled",
        })
        .eq("id", lessonId)
        .eq("status", "available");

      if (error) throw error;

      toast({
        title: "Aula agendada com sucesso!",
        description: "Você receberá uma confirmação em breve",
      });

      // Atualizar a lista de aulas
      setLessons(lessons.filter((l) => l.id !== lessonId));
      
      // Atualizar contagem do trainer
      fetchTrainersWithLessons();
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

  const handleViewTrainerProfile = (trainerId: string) => {
    navigate(`/trainer/${trainerId}`);
  };

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {!selectedTrainer ? (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Agendar Aula</h1>
                <p className="text-muted-foreground">
                  Escolha um personal trainer e selecione o horário que melhor se encaixa na sua rotina
                </p>
              </div>

              {trainers.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Nenhum horário disponível no momento</p>
                      <p className="text-sm mt-2">Tente novamente mais tarde</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trainers.map((trainer) => (
                    <Card key={trainer.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={trainer.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{trainer.full_name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {trainer.lessonCount} {trainer.lessonCount === 1 ? "horário" : "horários"} disponíveis
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button 
                          onClick={() => handleSelectTrainer(trainer.id)}
                          className="w-full gap-2"
                        >
                          Ver Horários
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleViewTrainerProfile(trainer.id)}
                          variant="outline"
                          className="w-full gap-2"
                        >
                          Ver Perfil
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-6">
                <Button 
                  onClick={handleBackToTrainers}
                  variant="ghost"
                  className="mb-4"
                >
                  ← Voltar para a lista de personal trainers
                </Button>
                <h2 className="text-3xl font-bold mb-2">Horários Disponíveis</h2>
                <p className="text-muted-foreground">
                  Selecione o horário desejado para agendar sua aula
                </p>
              </div>

              {lessons.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Nenhum horário disponível</p>
                      <p className="text-sm mt-2">Este personal trainer não possui horários disponíveis no momento</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {Object.entries(lessonsByDate).map(([date, dateLessons]) => (
                    <div key={date}>
                      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        {format(parseISO(date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dateLessons.map((lesson) => (
                          <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-base font-semibold">
                                  <Clock className="w-5 h-5 text-primary" />
                                  {lesson.start_time.slice(0, 5)} - {lesson.end_time.slice(0, 5)}
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Disponível
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {lesson.notes && (
                                <p className="text-sm text-muted-foreground">{lesson.notes}</p>
                              )}
                              <Button
                                onClick={() => handleBookLesson(lesson.id)}
                                disabled={bookingId === lesson.id}
                                className="w-full"
                              >
                                {bookingId === lesson.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Agendando...
                                  </>
                                ) : (
                                  "Agendar Aula"
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentBooking;
