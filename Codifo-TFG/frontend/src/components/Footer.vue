<template>
    <footer class="footer">
        <div class="footer-content">
            <div>
                <h2>Horario</h2>
                <h3>Lunes a Jueves</h3>
                <h4>09:30 - 13:30 / 16:00 - 20:00</h4>
                <h3>Viernes</h3>
                <h4>10:00 - 14:00 / 16:00 - 19:30</h4>
            </div>
            <div>
                <h2>Contacto</h2>
                <h3>123-456-7890</h3>
                <h3>rasoio@hotmail.com</h3>
                <h3>Calle José Martínez N 43 - Granada</h3>
            </div>
            <div>
                <h2>Redes</h2>
                <i class="fa-brands fa-facebook"></i>
                <i class="fa-brands fa-instagram"></i>
                <i class="fa-brands fa-twitter"></i>
            </div>
            <div>
                <h2>Legal</h2>
                <h3>Aviso Legal</h3>
                <h3>Política de privacidad</h3>
                <h3>Política de cookies</h3>
            </div>
        </div>
    </footer>
</template>

<script setup>
// No script logic needed for a simple footer
</script>

<style scoped>
.footer {
    background-color: #656565;
    color: black;
    text-align: center;
    padding: 1rem 0;
    position: relative;
    bottom: 0;
    width: 100%;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
}
</style>