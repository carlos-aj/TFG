<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue';
</script>
<template>
  <v-app>
    <Header />
    <v-main class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive include="Citas">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </v-main>
    <Footer />
  </v-app>
</template>

<style>
:root {
  --main-bg-color: #2B2B2B;
  --text-color: #D9D9D9;
  --accent-color: #F5E009;
}

.v-application {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
}

.v-main {
  width: 100% !important;
  max-width: 100% !important;
}

.main-content {
  width: 100% !important;
  max-width: 100% !important;
}

.v-container {
  max-width: 100% !important;
  width: 100% !important;
}
</style>
