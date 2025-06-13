<template>
    <v-footer class="footer" width="100%">
        <v-container class="pa-0 footer-container">
            <!-- Parte superior del footer con la información principal -->
            <v-row class="footer-content py-8 px-4 mx-auto" no-gutters>
                <v-col cols="12" sm="6" md="3" class="px-3 mb-6">
                    <h2 class="text-h5 font-weight-bold mb-4 footer-heading font-italic dm-serif">Horario</h2>
                    <div class="d-flex align-start mb-3">
                        <v-icon icon="mdi-clock-outline" class="me-2 mt-1 accent-icon"></v-icon>
                        <div>
                            <h3 class="text-subtitle-1 mb-1 font-weight-medium normal-text">Lunes a Jueves</h3>
                            <h4 class="text-body-2 normal-text">09:30 - 13:30 / 16:00 - 20:00</h4>
                        </div>
                    </div>
                    <div class="d-flex align-start">
                        <v-icon icon="mdi-clock-outline" class="me-2 mt-1 accent-icon"></v-icon>
                        <div>
                            <h3 class="text-subtitle-1 mb-1 font-weight-medium normal-text">Viernes</h3>
                            <h4 class="text-body-2 normal-text">10:00 - 14:00 / 16:00 - 19:30</h4>
                        </div>
                    </div>
                </v-col>
                
                <v-col cols="12" sm="6" md="3" class="px-3 mb-6">
                    <h2 class="text-h5 font-weight-bold mb-4 footer-heading font-italic dm-serif">Contacto</h2>
                    <div class="d-flex align-start mb-3">
                        <v-icon icon="mdi-phone" class="me-2 mt-1 accent-icon"></v-icon>
                        <h3 class="text-subtitle-1 normal-text">123-456-7890</h3>
                    </div>
                    <div class="d-flex align-start mb-3">
                        <v-icon icon="mdi-email-outline" class="me-2 mt-1 accent-icon"></v-icon>
                        <h3 class="text-subtitle-1 normal-text">rasoio@hotmail.com</h3>
                    </div>
                    <div class="d-flex align-start">
                        <v-icon icon="mdi-map-marker" class="me-2 mt-1 accent-icon"></v-icon>
                        <h3 class="text-subtitle-1 normal-text">Calle José Martínez N 43 - Granada</h3>
                    </div>
                </v-col>
                
                <v-col cols="12" sm="6" md="3" class="px-3 mb-6">
                    <h2 class="text-h5 font-weight-bold mb-10 footer-heading font-italic dm-serif">Redes</h2>
                    <div class="social-icons-row">
                        <a href="#" target="_blank" class="social-icon-simple">
                            <i class="fa-brands fa-facebook fa-xl"></i>
                        </a>
                        <a href="#" target="_blank" class="social-icon-simple">
                            <i class="fa-brands fa-instagram fa-xl"></i>
                        </a>
                        <a href="#" target="_blank" class="social-icon-simple">
                            <i class="fa-brands fa-twitter fa-xl"></i>
                        </a>
                    </div>
                </v-col>
                
                <v-col cols="12" sm="6" md="3" class="px-3 mb-6">
                    <h2 class="text-h5 font-weight-bold mb-4 footer-heading font-italic dm-serif">Legal</h2>
                    <v-list density="compact" class="footer-legal-list pa-0">
                        <v-list-item
                            prepend-icon="mdi-file-document-outline"
                            title="Aviso Legal"
                            class="legal-item px-0 py-1"
                            href="#"
                            density="compact"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-shield-account-outline"
                            title="Política de privacidad"
                            class="legal-item px-0 py-1"
                            href="#"
                            density="compact"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-cookie-outline"
                            title="Política de cookies"
                            class="legal-item px-0 py-1"
                            href="#"
                            density="compact"
                        ></v-list-item>
                    </v-list>
                </v-col>
            </v-row>
        </v-container>
    </v-footer>
</template>

<script setup>
// No script logic needed for a simple footer
</script>

<style scoped>
.footer {
    background-color: #656565 !important;
    color: var(--text-color);
    padding: 0 !important;
    position: relative;
    bottom: 0;
    width: 100% !important;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
    max-width: none !important;
    margin: 0 !important;
    left: 0 !important;
    right: 0 !important;
    display: flex;
    justify-content: center;
}

.footer-container {
    max-width: 1200px;
    width: 100%;
}

.footer-content {
    width: 100%;
    margin: 0 auto;
    position: relative;
    display: flex;
    justify-content: center;
}

.footer-heading {
    position: relative;
    display: inline-block;
    margin-bottom: 1.5rem;
    color: var(--text-color);
    font-style: italic;
    font-family: 'DM Serif', serif !important;
}

.dm-serif {
    font-family: 'DM Serif', serif !important;
}

.normal-text {
    font-style: normal !important;
}

.footer-heading::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 50px;
    height: 3px;
    background-color: var(--accent-color);
    border-radius: 2px;
}

.accent-icon {
    color: var(--accent-color);
}

.social-icons-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
}

.social-icon-simple {
    color: var(--text-color);
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    text-decoration: none;
}

.social-icon-simple:hover {
    color: var(--accent-color);
    transform: translateY(-3px);
}

.footer-legal-list {
    background-color: transparent !important;
    max-width: 220px;
}

.legal-item {
    transition: all 0.3s ease;
    color: var(--text-color) !important;
    min-height: 32px !important;
}

.legal-item:hover {
    color: var(--accent-color) !important;
    padding-left: 5px;
}

.legal-item :deep(.v-list-item__prepend) {
    color: var(--accent-color) !important;
}

.legal-item :deep(.v-list-item-title) {
    font-size: 0.9rem !important;
    white-space: normal !important;
}

/* Aplicar color al texto para todos los elementos */
.text-subtitle-1, .text-body-2, .v-list-item__title {
    color: var(--text-color) !important;
}

.text-h5 {
    font-family: 'DM Serif', serif !important;
}

@media (max-width: 600px) {
    .footer-heading {
        text-align: center;
    }
    
    .footer-heading::after {
        left: 50%;
        transform: translateX(-50%);
    }
    
    .d-flex {
        justify-content: center;
    }
    
    .social-icons-row {
        justify-content: center;
    }
    
    .footer-legal-list {
        margin: 0 auto;
    }
}
</style>