<script setup>
import { ref } from 'vue'

const opiniones = ref([
  { text: '¡Excelente servicio y atención!', author: 'Juan Pérez' },
  { text: 'El mejor corte que he tenido.', author: 'Ana Gómez' },
  { text: 'Ambiente muy agradable y profesionales.', author: 'Luis Martínez' }
])
</script>

<template> 
  <section class="hero">
      <div class="overlay"></div>
      <v-btn>
        RESERVA TU CITA
      </v-btn>
  </section>
  <section class="equipo">
    <h1>Equipo</h1>
    <div>
      <img src="../assets/Barbero1.png" alt="Imagen Barbero"/>
      <h2>Malik Johnson</h2>
    </div>
    <div>
      <img src="../assets/Barbero2.png" alt="Imagen Barbero"/>
      <h2>Luka Petrov</h2>
    </div>
    <div>
      <img src="../assets/Barbero3.png" alt="Imagen Barbero"/>
      <h2>Santi Rivas</h2>
    </div>
  </section>
  <section class="Opiniones">
  <h1>Opiniones</h1>
  <div class="carousel-wrapper">
    <v-carousel
      hide-delimiter-background
      show-arrows
      height="200"
    >
      <v-carousel-item
        v-for="(opinion, i) in opiniones"
        :key="i"
      >
        <div class="opinion-card">
          <blockquote>
            "{{ opinion.text }}"
          </blockquote>
          <div class="author">
            - {{ opinion.author }}
          </div>
        </div>
      </v-carousel-item>
    </v-carousel>
  </div>
</section>
</template>

<style scoped>
  .hero {
    position: relative;
    background-image: url('../assets/imagenHero.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: calc(100vh - 120px); 
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    max-width: 100%;
    min-height: 200px;
  }

  .overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.35);
    pointer-events: none;
  }

  .equipo {
    background-color: #2B2B2B;
  }

  h1, h2{
    text-align: center;
    color: #FFFFFF;
  }
  
 .Opiniones {
  position: relative;
  height: 400px;
  background-color: #2B2B2B;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem; /* espacio para el título */
  gap: 2rem;
}

.carousel-wrapper {
  position: relative;
  width: 80%;
  max-width: 800px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.opinion-card {
  padding: 2rem;
  text-align: center;
}

.opinion-card blockquote {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.opinion-card .author {
  font-weight: bold;
  color: #3f51b5;
}

</style>
