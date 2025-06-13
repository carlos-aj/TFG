<script setup>
import { ref } from 'vue'

const opiniones = ref([
  { text: '¡Excelente servicio y atención! El ambiente es acogedor y el personal muy profesional.', author: 'Juan Pérez', rating: 5 },
  { text: 'El mejor corte que he tenido. Siempre saben exactamente lo que quiero.', author: 'Ana Gómez', rating: 5 },
  { text: 'Ambiente muy agradable y profesionales. Recomendado para quienes buscan calidad.', author: 'Luis Martínez', rating: 4 }
])
</script>

<template> 
  <section class="hero">
    <div class="overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title dm-serif font-italic">ESTILO Y TRADICIÓN</h1>
      <p class="hero-subtitle normal-text">Barbería de estilo clásico con un toque contemporáneo</p>
      <v-btn 
        class="reserve-btn mt-6" 
        size="large" 
        elevation="4"
        color="var(--accent-color)"
        to="/citas"
      >
        RESERVA TU CITA
      </v-btn>
    </div>
  </section>

  <section class="equipo">
    <div class="section-container">
      <h1 class="section-title dm-serif font-italic">Nuestro Equipo</h1>
      <div class="section-divider"></div>
      
      <v-row class="mt-8">
        <v-col cols="12" sm="4">
          <div class="team-member">
            <div class="img-container">
              <img src="../assets/Barbero1.png" alt="Malik Johnson"/>
            </div>
            <h2 class="team-name dm-serif font-italic">Malik Johnson</h2>
            <p class="team-role normal-text">Barbero Principal</p>
          </div>
        </v-col>
        
        <v-col cols="12" sm="4">
          <div class="team-member">
            <div class="img-container">
              <img src="../assets/Barbero2.png" alt="Luka Petrov"/>
            </div>
            <h2 class="team-name dm-serif font-italic">Luka Petrov</h2>
            <p class="team-role normal-text">Estilista Senior</p>
          </div>
        </v-col>
        
        <v-col cols="12" sm="4">
          <div class="team-member">
            <div class="img-container">
              <img src="../assets/Barbero3.png" alt="Santi Rivas"/>
            </div>
            <h2 class="team-name dm-serif font-italic">Santi Rivas</h2>
            <p class="team-role normal-text">Barbero Especialista</p>
          </div>
        </v-col>
      </v-row>
    </div>
  </section>

  <section class="opiniones">
    <div class="section-container">
      <h1 class="section-title dm-serif font-italic">Opiniones</h1>
      <div class="section-divider"></div>
      
      <div class="carousel-wrapper mt-8">
        <v-carousel
          hide-delimiter-background
          show-arrows="hover"
          height="250"
          delimiter-icon="mdi-circle"
          :cycle="true"
        >
          <v-carousel-item
            v-for="(opinion, i) in opiniones"
            :key="i"
          >
            <div class="opinion-card">
              <div class="rating mb-4">
                <v-icon 
                  v-for="n in 5" 
                  :key="n" 
                  :color="n <= opinion.rating ? 'var(--accent-color)' : 'grey'"
                  icon="mdi-star"
                  size="small"
                ></v-icon>
              </div>
              <blockquote class="normal-text">
                "{{ opinion.text }}"
              </blockquote>
              <div class="author normal-text">
                - {{ opinion.author }}
              </div>
            </div>
          </v-carousel-item>
        </v-carousel>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  background-image: url('../assets/imagenHero.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  height: 100vh; 
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  max-width: 100%;
}

.overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  pointer-events: none;
}

.hero-content {
  position: relative;
  text-align: center;
  padding: 2rem;
  max-width: 800px;
  z-index: 2;
}

.hero-title {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--text-color);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 2rem;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

.reserve-btn {
  font-weight: bold !important;
  padding: 0.75rem 2rem !important;
  color: var(--main-bg-color) !important;
  font-style: normal !important;
  letter-spacing: 1px;
  transition: transform 0.3s ease;
}

.reserve-btn:hover {
  transform: translateY(-3px);
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;
  text-align: center;
}

.section-title {
  font-size: 3rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.section-divider {
  height: 3px;
  width: 80px;
  background-color: var(--accent-color);
  margin: 0 auto 1.5rem;
  border-radius: 2px;
}

.section-description {
  font-size: 1.2rem;
  color: var(--text-color);
  max-width: 600px;
  margin: 0 auto;
}

.equipo {
  background-color: var(--main-bg-color);
}

.team-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.img-container {
  width: 250px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 3px solid var(--accent-color);
  transition: transform 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.img-container:hover {
  transform: translateY(-5px);
}

.team-member img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-name {
  font-size: 1.8rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.team-role {
  font-size: 1rem;
  color: var(--accent-color);
}

.opiniones {
  background-color: #232323;
}

.carousel-wrapper {
  position: relative;
  width: 80%;
  max-width: 800px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
  border-left: 4px solid var(--accent-color);
}

.opinion-card {
  padding: 2.5rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.opinion-card blockquote {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  line-height: 1.6;
}

.opinion-card .author {
  font-weight: bold;
  color: var(--accent-color);
}

.normal-text {
  font-style: normal !important;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .section-title {
    font-size: 2.5rem;
  }
  
  .carousel-wrapper {
    width: 90%;
  }
}
</style>
