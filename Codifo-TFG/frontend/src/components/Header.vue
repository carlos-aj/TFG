<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'

  const isOverDarkSection = ref(false)

  function onScroll() {
    // Encuentra la sección con fondo #2B2B2B
    const darkSection = document.querySelector('.equipo')
    const header = document.querySelector('section')
    if (!darkSection || !header) return

    const rect = darkSection.getBoundingClientRect()
    // Si el header está sobre la sección oscura
    isOverDarkSection.value = rect.top <= 0 && rect.bottom > header.offsetHeight
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })
</script>

<template>
  <section :class="{ 'header-dark': isOverDarkSection }">
    <div>
      <router-link to="/">
        <img class="imagen1" src="../assets/logoFondo1.png" alt="Logo">
      </router-link>
    </div>
    <div>
      <ul class="nav nav-underline justify-content-end-underline">
        <li class="nav-item">
          <router-link class="nav-link" to="/conocenos" active-class="active" exact-active-class="active">Conócenos</router-link>
      </li>
        <li class="nav-item" >
          <router-link class="nav-link" to="/galeria" active-class="active" exact-active-class="active">Galería</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/citas" active-class="active" exact-active-class="active">Citas</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/LogIn" active-class="active" exact-active-class="active">LogIn</router-link>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
section {
  background-color: #2B2B2B;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  transition: background 0.3s;
}

section.header-dark {
  background-color: #656565;
}

.imagen1 {
  width: 120px;           
  height: auto;
  display: block;
}

.nav-link {
  color: #FFFFFF !important;
  font-size: 28px !important;
  transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;

}

.nav-underline .nav-link::after {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.nav-link:hover,
.nav-link.active {
  color: #F5E009 !important;
}
</style>
