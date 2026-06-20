import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, Users, Shield, Globe, ArrowRight, PlayCircle } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1c1e21", backgroundColor: "#fff" }}>
      
      {/* SECTION 1: HERO (O Estilo Instagram encontra o Facebook) */}
      <section style={{ 
        padding: "80px 20px", 
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        textAlign: "center",
        borderBottom: "1px solid #ddd"
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)", fontWeight: "800", letterSpacing: "-1px", marginBottom: "20px", background: "linear-gradient(45deg, #daa520, #f4c542)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Sigo com Fé
          </h1>
          <p style={{ fontSize: "1.25rem", color: "#4b4f56", marginBottom: "40px", lineHeight: "1.6" }}>
            A rede social cristã que conecta propósitos, une igrejas e fortalece a sua caminhada com Deus em um ambiente seguro e moderno.
          </p>
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/register")} style={{ padding: "16px 32px", fontSize: "18px", fontWeight: "700", backgroundColor: "#daa520", color: "#white", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 15px rgba(218, 165, 32, 0.3)" }}>
              Começar Agora Gratuitamente <ArrowRight size={20} />
            </button>
            <button style={{ padding: "16px 32px", fontSize: "18px", fontWeight: "600", backgroundColor: "white", color: "#1c1e21", border: "1px solid #ddd", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
              <PlayCircle size={20} /> Ver Vídeo
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: DIFERENCIAIS (Estilo Minimalista) */}
      <section style={{ padding: "80px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px" }}>
          
          <div style={cardStyle}>
            <div style={iconBoxStyle}><Users color="#daa520" /></div>
            <h3 style={{ marginBottom: "10px" }}>Comunidade Real</h3>
            <p style={{ color: "#606770" }}>Conecte-se com membros da sua congregação e de outras igrejas ao redor do mundo.</p>
          </div>

          <div style={cardStyle}>
            <div style={iconBoxStyle}><Shield color="#daa520" /></div>
            <h3 style={{ marginBottom: "10px" }}>Ambiente Seguro</h3>
            <p style={{ color: "#606770" }}>Uma plataforma moderada com valores cristãos, focada no seu crescimento espiritual.</p>
          </div>

          <div style={cardStyle}>
            <div style={iconBoxStyle}><Globe color="#daa520" /></div>
            <h3 style={{ marginBottom: "10px" }}>Conteúdo Edificante</h3>
            <p style={{ color: "#606770" }}>Tenha acesso a estudos bíblicos, pedidos de oração e música cristã em um só lugar.</p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "40px 20px", textAlign: "center", borderTop: "1px solid #eee", color: "#8e8e8e", fontSize: "14px" }}>
        © 2026 Sigo com Fé. Todos os direitos reservados.
      </footer>
    </div>
  );
}

const cardStyle = {
  padding: "30px",
  borderRadius: "20px",
  backgroundColor: "#fff",
  border: "1px solid #f0f0f0",
  transition: "transform 0.3s ease",
  textAlign: "center"
};

const iconBoxStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "15px",
  backgroundColor: "#fff9e6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px auto"
};
