<script setup>
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';

import sloganImage from '../assets/sloganff.png';
import barbero1Image from '../assets/Barbero1.png';
import barbero2Image from '../assets/Barbero2.png';
import barbero3Image from '../assets/Barbero3.png';

const slogan = ref(sloganImage);
const barbero1 = ref(barbero1Image);
const barbero2 = ref(barbero2Image);
const barbero3 = ref(barbero3Image);

onMounted(() => {
  gsap.from('.fade-in', {
    opacity: 0,
    y: 30,
    duration: 1,
    stagger: 0.2,
    ease: 'power2.out'
  });
  
  gsap.from('.title-underline', {
    opacity: 0,
    width: 0,
    duration: 0.8,
    delay: 0.2,
    ease: 'power2.out'
  });
  
  gsap.from('.team-card', {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.2,
    delay: 0.5,
    ease: 'back.out(1.7)'
  });
});
</script>

<template> 
  <div class="conocenos-page">
    <v-container class="conocenos-container px-4 px-sm-6 px-md-8">
      <v-row justify="center" class="mb-4">
        <v-col cols="12" class="text-center mb-2">
          <h1 class="primary-title fade-in">QUIENES SOMOS</h1>
          <div class="title-underline mx-auto"></div>
        </v-col>
      </v-row>
      
      <v-row no-gutters class="mb-10">
        <v-col cols="12" md="6" class="d-flex align-center">
          <div class="pa-4 pa-md-6">
            <p class="fade-in mb-4 about-text dm-serif">
              Rasoio es más que una barbería, es un punto de encuentro para quienes valoran el estilo, la precisión y la tradición. Ubicada en pleno centro de Granada, nuestra barbería combina el arte del corte clásico con la frescura de las tendencias más modernas.
            </p>
            
            <p class="fade-in about-text dm-serif">
              Fundada por Santiago Rivas, Rasoio nace del deseo de ofrecer una experiencia auténtica y cuidada, donde cada detalle importa. Junto a un equipo de profesionales con pasión por el oficio, hemos creado un espacio donde el cliente es el centro, el estilo es clave, y la barbería vuelve a ser lo que siempre debió ser, un lugar de confianza, conversación y carácter.
            </p>
          </div>
        </v-col>
        
        <v-col cols="12" md="6" class="d-flex align-center justify-center" style="background-color: #2B2B2B;">
          <v-img :src="slogan" alt="Rasoio Corte Afilado" contain height="100%" class="fade-in"></v-img>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12" class="text-center mb-4">
          <h1 class="primary-title fade-in">NUESTRO EQUIPO</h1>
          <div class="title-underline mx-auto"></div>
        </v-col>
      </v-row>
      
      <div class="team-grid px-2">
        <div class="team-member fade-in">
          <div class="member-photo-container">
            <v-img :src="barbero1" alt="Malik Johnson" class="member-photo" width="100%" height="370" cover></v-img>
          </div>
          <div class="member-info text-center">
            <h2 class="text-h4 font-weight-bold mb-2 dm-serif">Malik Johnson</h2>
            <div class="specialty-badge mx-auto">Fade de precisión</div>
          </div>
          <div class="member-overlay">
            <p class="member-bio pa-4">
              Malik creció en un vecindario donde el corte de cabello era más que estética: era comunidad. Aprendió a cortar desde joven ayudando en la barbería de su tío, y con el tiempo desarrolló una técnica precisa y un estilo muy personal.
            </p>
          </div>
        </div>
        
        <div class="team-member fade-in">
          <div class="member-photo-container">
            <v-img :src="barbero2" alt="Luka Petrov" class="member-photo" width="100%" height="370" cover></v-img>
          </div>
          <div class="member-info text-center">
            <h2 class="text-h4 font-weight-bold mb-2 dm-serif">Luka Petrov</h2>
            <div class="specialty-badge mx-auto">Tinte y diseños con navaja</div>
          </div>
          <div class="member-overlay">
            <p class="member-bio pa-4">
              Luka emigró con su familia cuando era adolescente y encontró en la barbería una forma de expresión artística. Combina la técnica europea clásica con tendencias urbanas. Siempre está estudiando nuevas formas de estilizar barbas y cabello.
            </p>
          </div>
        </div>
        
        <div class="team-member fade-in">
          <div class="member-photo-container">
            <v-img :src="barbero3" alt="Santi Rivas" class="member-photo" width="100%" height="370" cover></v-img>
          </div>
          <div class="member-info text-center">
            <h2 class="text-h4 font-weight-bold mb-2 dm-serif">Santi Rivas</h2>
            <div class="specialty-badge mx-auto">Cortes clásicos</div>
          </div>
          <div class="member-overlay">
            <p class="member-bio pa-4">
              Santi trabajó en salones de peluquería desde muy joven, pero se enamoró de la barbería por la cultura y la conversación. Ha viajado por Sudamérica aprendiendo técnicas tradicionales y modernas.
            </p>
          </div>
        </div>
      </div>
    </v-container>  
  </div>
</template>

<style scoped>
.conocenos-page {
  background-color: #2B2B2B;
  color: #D9D9D9;
  padding: 2.5rem 1.5rem 2rem 1.5rem;
  min-height: 100vh;
}

.conocenos-container {
  max-width: 1200px;
  margin: 0 auto;
}

.primary-title {
  color: #D9D9D9;
  letter-spacing: 3px;
  margin-bottom: 0.3rem;
  font-size: 3rem !important;
  font-family: 'DM Serif Display', serif;
  font-style: italic;
}

.title-underline {
  width: 100px;
  height: 4px;
  background-color: var(--accent-color);
  margin-bottom: 1rem;
}

.about-text {
  font-size: 1.3rem;
  line-height: 1.8;
  text-align: left;
  color: #D9D9D9;
}

.dm-serif {
  font-family: 'DM Serif Display', serif;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding: 0 0.5rem;
  max-width: 1174px;
  margin-left: auto;
  margin-right: auto;
}

.team-member {
  position: relative;
  background-color: #333333;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  height: 520px;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.team-member:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.5);
}

.member-photo-container {
  width: 100%;
  height: 370px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2B2B2B;
  position: relative;
}

.member-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 50%;
  transition: transform 0.5s ease;
}

.team-member:hover .member-photo {
  transform: scale(1.05);
}

.member-info {
  padding: 1.5rem;
}

.specialty-badge {
  display: inline-block;
  background-color: var(--accent-color);
  color: #2B2B2B;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  max-width: fit-content;
}

.member-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 370px;
  background-color: rgba(43, 43, 43, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.team-member:hover .member-overlay {
  opacity: 1;
}

.member-bio {
  color: #D9D9D9;
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@media (max-width: 960px) {
  .about-text {
    font-size: 1.3rem;
    margin-top: 2rem;
  }
  
  .primary-title {
    font-size: 2.5rem !important;
  }
  
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    padding: 0 1rem;
  }
  
  .team-member {
    height: 520px;
  }
  
  .member-photo-container,
  .member-overlay {
    height: 370px;
  }
}

@media (max-width: 600px) {
  .conocenos-page {
    padding: 2.5rem 1rem 2rem 1rem;
  }

  .primary-title {
    font-size: 2rem !important;
  }
  
  .team-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0;
  }
  
  .about-text {
    font-size: 1.2rem;
  }
  
  .team-member {
    max-width: 350px;
    margin: 0 auto;
    height: 520px;
  }
  
  .member-photo-container,
  .member-overlay {
    height: 370px;
  }
}
</style>
