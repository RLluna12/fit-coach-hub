// @ts-ignore: Deno type definitions
// deno-lint-ignore-file no-explicit-any
// @deno-types="npm:@types/node"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: any) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { lessonId, studentId, trainerId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("scheduled_date, start_time, end_time, notes")
      .eq("id", lessonId)
      .maybeSingle();

    if (lessonError) throw lessonError;
    if (!lesson) throw new Error("Lesson not found");

    // Fetch student profile
    const { data: studentProfile, error: studentError } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", studentId)
      .maybeSingle();

    if (studentError) throw studentError;

    // Fetch trainer profile
    const { data: trainerProfile, error: trainerError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", trainerId)
      .maybeSingle();

    if (trainerError) throw trainerError;

    // Check if trainer has email
    if (!trainerProfile?.email) {
      console.warn(`Trainer ${trainerId} has no email registered`);
      return new Response(
        JSON.stringify({ success: true, message: "Trainer has no email registered" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nova Aula Agendada! 🎉</h2>
        <p style="color: #666;">Olá <strong>${trainerProfile.full_name}</strong>,</p>
        <p style="color: #666;">Um novo aluno agendou uma aula com você!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📋 Dados do Aluno:</h3>
          <ul style="color: #666; list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><strong>Nome:</strong> ${studentProfile?.full_name || "N/A"}</li>
            <li style="margin: 8px 0;"><strong>Email:</strong> ${studentProfile?.email || "N/A"}</li>
            <li style="margin: 8px 0;"><strong>Telefone:</strong> ${studentProfile?.phone || "N/A"}</li>
          </ul>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">⏰ Detalhes da Aula:</h3>
          <ul style="color: #666; list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><strong>Data:</strong> ${lesson.scheduled_date}</li>
            <li style="margin: 8px 0;"><strong>Horário:</strong> ${lesson.start_time.slice(0, 5)} - ${lesson.end_time.slice(0, 5)}</li>
            ${lesson.notes ? `<li style="margin: 8px 0;"><strong>Notas:</strong> ${lesson.notes}</li>` : ""}
          </ul>
        </div>
        
        <p style="color: #666;">Acesse sua plataforma para confirmar ou gerenciar a aula.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">MyPersonalTrainer - Sistema de Agendamento</p>
      </div>
    `;

    // If Resend API key is available, send via Resend
    if (resendApiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "noreply@mypersonaltrainer.com",
          to: trainerProfile.email,
          subject: "Nova aula agendada! 🎉",
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Resend error:", error);
        throw new Error(`Resend API error: ${error}`);
      }

      const data = await response.json();
      console.log("Email sent via Resend:", data);

      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully via Resend", data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // If no Resend key, just log (development mode)
      console.log("Email would be sent to:", trainerProfile.email);
      console.log("Student:", studentProfile?.full_name);
      console.log("Date/Time:", `${lesson.scheduled_date} ${lesson.start_time}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email notification logged (configure RESEND_API_KEY for production)" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Error:", error?.message);
    return new Response(
      JSON.stringify({
        error: error?.message || "Unknown error",
        success: false,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
