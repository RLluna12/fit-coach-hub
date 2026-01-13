import { useState, useEffect } from "react";
import TrainerCard from "@/components/TrainerCard";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown, Loader2 } from "lucide-react";

import trainer1 from "@/assets/trainer-1.jpg";
import { supabase } from "@/integrations/supabase/client";

// Trainers will be loaded from the database (profiles + user_roles)


const cities = ["Todas", "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba"];

const TrainersSection = () => {
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [showFilters, setShowFilters] = useState(false);

  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainers = async () => {
      setLoading(true);
      try {
        // 1) get trainer user ids
        const { data: rolesData, error: roleErr } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "trainer");

        if (roleErr) {
          console.error("Error fetching user_roles:", roleErr);
          setTrainers([]);
          return;
        }

        const userIds = (rolesData || []).map((r: any) => r.user_id);
        if (userIds.length === 0) {
          setTrainers([]);
          return;
        }

        // 2) fetch profiles for those users
        const { data: profiles, error: profilesErr } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, location, specialties, price_per_session, cref")
          .in("user_id", userIds);

        if (profilesErr) {
          console.error("Error fetching profiles:", profilesErr);
          setTrainers([]);
          return;
        }

        const profileIds = (profiles || []).map((p: any) => p.id);

        // 3) fetch reviews to compute avg rating and count
        const { data: reviews } = await supabase
          .from("reviews")
          .select("trainer_id, rating")
          .in("trainer_id", profileIds);

        const reviewsByTrainer: Record<string, number[]> = {};
        (reviews || []).forEach((r: any) => {
          if (!reviewsByTrainer[r.trainer_id]) reviewsByTrainer[r.trainer_id] = [];
          reviewsByTrainer[r.trainer_id].push(r.rating);
        });

        const mapped = (profiles || []).map((p: any) => {
          const trainerRatings = reviewsByTrainer[p.id] || [];
          const avg = trainerRatings.length ? trainerRatings.reduce((a: number, b: number) => a + b, 0) / trainerRatings.length : 0;

          return {
            id: p.id,
            name: p.full_name,
            image: p.avatar_url || trainer1,
            location: p.location || "",
            rating: avg || 0,
            reviews: trainerRatings.length || 0,
            specialties: p.specialties || [],
            pricePerSession: p.price_per_session || 0,
            verified: !!p.cref,
          };
        });

        setTrainers(mapped);
      } catch (err) {
        console.error("Unexpected error loading trainers:", err);
        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainers();
  }, []);

  const filteredTrainers = selectedCity === "Todas"
    ? trainers
    : trainers.filter((t) => t.location.includes(selectedCity));

  return (
    <section id="trainers" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            ENCONTRE SEU <span className="text-gradient">TRAINER</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Profissionais qualificados prontos para transformar sua vida através do exercício físico
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap justify-center gap-2">
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedCity === city ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Mais Filtros
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-card rounded-xl p-6 mb-10 border border-border animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Especialidade</label>
                <select className="w-full h-10 px-4 rounded-lg bg-secondary border border-border text-foreground">
                  <option>Todas</option>
                  <option>Musculação</option>
                  <option>Funcional</option>
                  <option>CrossFit</option>
                  <option>Pilates</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Faixa de Preço</label>
                <select className="w-full h-10 px-4 rounded-lg bg-secondary border border-border text-foreground">
                  <option>Qualquer</option>
                  <option>Até R$100/aula</option>
                  <option>R$100 - R$150/aula</option>
                  <option>Acima de R$150/aula</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Avaliação Mínima</label>
                <select className="w-full h-10 px-4 rounded-lg bg-secondary border border-border text-foreground">
                  <option>Qualquer</option>
                  <option>4+ estrelas</option>
                  <option>4.5+ estrelas</option>
                  <option>5 estrelas</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Trainers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">Nenhum trainer encontrado</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTrainers.map((trainer, index) => (
              <div 
                key={trainer.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TrainerCard {...trainer} />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Ver Mais Trainers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrainersSection;
