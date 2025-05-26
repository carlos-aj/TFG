<script setup>
</script>

<template> 
  <section class="hero">
      <div class="overlay"></div>
  </section>
  <section class="equipo">
    <h1>Equipo</h1>
        <div style="height: 1200px;"></div> 

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

  h1{
    text-align: center;
    color: #FFFFFF;
  }
</style>
