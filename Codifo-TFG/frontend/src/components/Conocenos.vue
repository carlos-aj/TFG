<script setup>
</script>

<template> 
  <div class="conocenos">
    <h1>Quienes somos</h1>
    <img src="../assets/sloganff.png" alt="Imagen Barbero"/>
    <p>
      Rasoio es más que una barbería, es un punto de encuentro para quienes valoran el estilo, la precisión y la tradición. Ubicada en pleno centro de Granada, nuestra barbería combina el arte del corte clásico con la frescura de las tendencias más modernas.
    </p>
    <p>
      Fundada por Santiago Rivas, Rasoio nace del deseo de ofrecer una experiencia auténtica y cuidada, donde cada detalle importa. Junto a un equipo de profesionales con pasión por el oficio, hemos creado un espacio donde el cliente es el centro, el estilo es clave, y la barbería vuelve a ser lo que siempre debió ser, un lugar de confianza, conversación y carácter.
    </p>
    <section class="equipo">
      <h1>Equipo</h1>
      <div class="card">
        <div class="card-inner">
          <div class="card-front">
            <img src="../assets/Barbero1.png" alt="Imagen Barbero"/>
            <h2>Malik Johnson</h2>
            <h3>Fade de precisión</h3>
          </div>
          <div class="card-back">
            <p>Malik creció en un vecindario donde el corte de cabello era más que estética: era comunidad. Aprendió a cortar desde joven ayudando en la barbería de su tío, y con el tiempo desarrolló una técnica precisa y un estilo muy persona</p>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-inner">
          <div class="card-front">
            <img src="../assets/Barbero2.png" alt="Imagen Barbero"/>
            <h2>Luka Petrov</h2>
            <h3>Tinte y diseños con navaja </h3>
          </div>
          <div class="card-back">
            <p>Luka emigró con su familia cuando era adolescente y encontró en la barbería una forma de expresión artística. Combina la técnica europea clásica con tendencias urbanas. Siempre está estudiando nuevas formas de estilizar barbas y cabello</p>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-inner">
          <div class="card-front">
            <img src="../assets/Barbero3.png" alt="Imagen Barbero"/>
            <h2>Santi Rivas</h2>
            <h3>Cortes clásicos</h3>
          </div>
          <div class="card-back">
            <p>Santi trabajó en salones de peluquería desde muy joven, pero se enamoró de la barbería por la cultura y la conversación. Ha viajado por Sudamérica aprendiendo técnicas tradicionales y modernas</p>
          </div>
        </div>
      </div>
    </section>
  </div>  
</template>

<style scoped>
.conocenos {
  background-color: #2B2B2B;
}

h1, p{
  color: white;
}

.equipo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card {
  background: transparent;
  width: 300px;
  height: 400px;
  perspective: 1000px;
  margin: 20px;
  display: inline-block;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card:hover .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  background: #222;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-front img {
  width: 80%;
  border-radius: 50%;
  margin-bottom: 20px;
}

.card-back {
  transform: rotateY(180deg);
  padding: 30px;
  box-sizing: border-box;
}

.card h2, .card h3, .card-back p {
  color: #fff;
}

.equipo {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}
</style>
