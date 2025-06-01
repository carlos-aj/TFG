<template>
    <div class="not-found">
        <h1>404</h1>
        <p>Página no encontrada</p>
        <router-link to="/">Volver al inicio</router-link>
    </div>
</template>

<script setup>
// No logic needed for simple 404 page
</script>

<style scoped>
.not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    text-align: center;
}
.not-found h1 {
    font-size: 6rem;
    margin: 0;
    color: #e74c3c;
}
.not-found p {
    font-size: 1.5rem;
    margin: 1rem 0;
}
.not-found a {
    color: #3498db;
    text-decoration: underline;
    font-size: 1.1rem;
}
</style>