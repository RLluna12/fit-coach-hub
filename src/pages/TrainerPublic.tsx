import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Star, MapPin } from "lucide-react";
import { AvailableLessonsGrid } from "@/components/AvailableLessonsGrid";

const TrainerPublic = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);

      const { data: pData, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (pErr) {
        console.error("Error loading profile:", pErr);
      } else {
        setProfile(pData as any);
      }

      const { data: rData, error: rErr } = await supabase
        .from("reviews")
        .select("rating, comment, created_at")
        .eq("trainer_id", id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (rErr) {
        console.error("Error loading reviews:", rErr);
      } else {
        setReviews(rData || []);
      }

      setLoading(false);
    };

    load();
  }, [id]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">Perfil não encontrado</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <Card>
          <CardHeader className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl font-bold text-muted-foreground">{profile.full_name?.[0] || 'T'}</div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-display">{profile.full_name}</CardTitle>
              <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{avgRating || '—'}</span>
                  <span className="text-sm">{reviews.length} avaliações</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
           
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Sobre</h3>
                <p className="text-muted-foreground mb-4">{profile.bio || 'Sem descrição'}</p>

                <h4 className="text-sm font-semibold mb-2">Especialidades</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(profile.specialties || []).map((s: string) => (
                    <span key={s} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{s}</span>
                  ))}
                </div>

                <h4 className="text-sm font-semibold mb-2">Últimas avaliações</h4>
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem avaliações ainda.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r.created_at} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{r.rating}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{r.comment}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <aside className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Informações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold">Valor da aula</h4>
                      <div className="text-xl font-display font-bold">R${profile.price_per_session || 0} <span className="text-sm text-muted-foreground font-normal">/aula</span></div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold">Contato</h4>
                      <div className="text-sm text-muted-foreground">{profile.phone || '—'}</div>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Agendar Aula</CardTitle>
          </CardHeader>
          <CardContent>
            <AvailableLessonsGrid trainerId={profile.user_id} isOwnProfile={false} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default TrainerPublic;
