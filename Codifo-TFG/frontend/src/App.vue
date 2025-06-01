<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue';
</script>
<template>
  <div class="app-container">
    <Header />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  /* Opcional: para separar el contenido del footer si quieres */
}
</style>
