import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Loader2, User, Upload, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  trainer_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: "available" | "scheduled" | "completed" | "cancelled";
  notes?: string | null;
}

interface TrainerProfileLite {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

interface StudentProfileInfo {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  email: string | null;
}

const StudentProfile = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [trainers, setTrainers] = useState<Record<string, TrainerProfileLite>>({});
  const [studentProfile, setStudentProfile] = useState<StudentProfileInfo | null>(null);
  const [profileForm, setProfileForm] = useState<{ full_name: string; phone: string; avatar_url: string | null }>({ full_name: "", phone: "", avatar_url: null });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (userRole === "trainer") {
      navigate("/trainer/profile");
      return;
    }
    fetchLessons();
  }, [user, userRole, authLoading, navigate]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, email")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setStudentProfile(profileData || null);
      setProfileForm({
        full_name: profileData?.full_name || user?.user_metadata?.full_name || "",
        phone: profileData?.phone || "",
        avatar_url: profileData?.avatar_url || null,
      });

      const { data, error } = await supabase
        .from("lessons")
        .select("id, trainer_id, scheduled_date, start_time, end_time, status, notes")
        .eq("student_id", user!.id)
        .order("scheduled_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      const fetchedLessons = data || [];
      setLessons(fetchedLessons as Lesson[]);

      const trainerIds = Array.from(new Set(fetchedLessons.map((l: any) => l.trainer_id)));
      if (trainerIds.length) {
        const { data: trainerProfiles, error: trainerErr } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", trainerIds);

        if (trainerErr) throw trainerErr;
        const map: Record<string, TrainerProfileLite> = {};
        trainerProfiles?.forEach((p) => {
          map[p.user_id] = {
            user_id: p.user_id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
          };
        });
        setTrainers(map);
      }
    } catch (err) {
      console.error("Erro ao carregar aulas do aluno", err);
      toast({
        title: "Erro ao carregar aulas",
        description: "Não foi possível carregar suas aulas agendadas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const today = useMemo(() => new Date(), []);
  const upcoming = lessons.filter((l) => isAfter(parseISO(l.scheduled_date), today) || l.scheduled_date === format(today, "yyyy-MM-dd"));
  const past = lessons.filter((l) => !upcoming.includes(l));

  const renderLessonCard = (lesson: Lesson) => {
    const trainer = trainers[lesson.trainer_id];
    const isUpcoming = lesson.status === "scheduled";

    return (
      <Card key={lesson.id} className={"border border-border"}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={trainer?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg leading-tight">{trainer?.full_name || "Personal Trainer"}</CardTitle>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(parseISO(lesson.scheduled_date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {lesson.start_time.slice(0, 5)} - {lesson.end_time.slice(0, 5)}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant={isUpcoming ? "default" : "outline"}>
              {lesson.status === "scheduled" ? "Agendada" : lesson.status === "completed" ? "Concluída" : lesson.status === "cancelled" ? "Cancelada" : ""}
            </Badge>
          </div>
        </CardHeader>
        {lesson.notes && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{lesson.notes}</p>
          </CardContent>
        )}
        {isUpcoming && (
          <CardContent className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={cancelingId === lesson.id}
              onClick={() => handleCancelLesson(lesson.id)}
            >
              {cancelingId === lesson.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="ml-2">Cancelar agendamento</span>
            </Button>
          </CardContent>
        )}
      </Card>
    );
  };

  const handleCancelLesson = async (lessonId: string) => {
    const confirmCancel = window.confirm("Deseja cancelar este agendamento?");
    if (!confirmCancel) return;

    try {
      setCancelingId(lessonId);
      const { error } = await supabase
        .from("lessons")
        .update({ student_id: null, status: "available" })
        .eq("id", lessonId)
        .eq("student_id", user!.id);

      if (error) throw error;

      toast({ title: "Agendamento cancelado", description: "O horário voltou a ficar disponível." });
      setLessons(lessons.filter((l) => l.id !== lessonId));
    } catch (err: any) {
      console.error("Erro ao cancelar aula", err);
      toast({
        title: "Erro ao cancelar",
        description: err?.message || "Não foi possível cancelar a aula.",
        variant: "destructive",
      });
    } finally {
      setCancelingId(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      let uploadError = null;
      let uploadData = null;

      const uploadResult = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      uploadError = uploadResult.error;
      uploadData = uploadResult.data;

      if (uploadError && uploadError.message?.includes("Bucket not found")) {
        try {
          await supabase.storage.createBucket("avatars", { public: true });
          const retryResult = await supabase.storage
            .from("avatars")
            .upload(filePath, file, { upsert: true, contentType: file.type });
          uploadError = retryResult.error;
          uploadData = retryResult.data;
        } catch (bucketErr) {
          console.error("Failed to create bucket:", bucketErr);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Bucket 'avatars' não encontrado e não foi possível criá-lo.",
          });
          setUploading(false);
          return;
        }
      }

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({ variant: "destructive", title: "Erro", description: uploadError.message || "Erro ao fazer upload" });
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      if (!urlData?.publicUrl) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível obter a URL pública da imagem" });
        setUploading(false);
        return;
      }

      setProfileForm((prev) => ({ ...prev, avatar_url: urlData.publicUrl }));
      setStudentProfile((prev) => (prev ? { ...prev, avatar_url: urlData.publicUrl } : prev));
      toast({ title: "Foto atualizada", description: "Lembre de salvar o perfil." });
    } catch (err: any) {
      console.error("Erro upload avatar", err);
      toast({ variant: "destructive", title: "Erro", description: err?.message || "Não foi possível subir a foto" });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          avatar_url: profileForm.avatar_url,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({ title: "Perfil atualizado" });
      setStudentProfile((prev) =>
        prev
          ? { ...prev, full_name: profileForm.full_name, phone: profileForm.phone, avatar_url: profileForm.avatar_url }
          : prev
      );
    } catch (err: any) {
      console.error("Erro ao salvar perfil", err);
      toast({ variant: "destructive", title: "Erro", description: err?.message || "Não foi possível salvar." });
    } finally {
      setSavingProfile(false);
    }
  };

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
        <div className="max-w-5xl mx-auto space-y-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profileForm.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" disabled={uploading}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Trocar foto
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email</Label>
                  <Input value={studentProfile?.email || user?.email || ""} disabled />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Salvar perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h1 className="text-3xl font-bold">Minhas Aulas</h1>
            <p className="text-muted-foreground">Visualize as suas aulas agendadas e já concluídas.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Próximas aulas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length === 0 ? (
                <div className="text-muted-foreground text-sm">Nenhuma aula futura.</div>
              ) : (
                upcoming.map(renderLessonCard)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {past.length === 0 ? (
                <div className="text-muted-foreground text-sm">Nenhuma aula concluída ou cancelada.</div>
              ) : (
                past.map(renderLessonCard)
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentProfile;
