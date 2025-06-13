import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { es } from 'vuetify/locale'

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'es',
    messages: { es },
  },
  theme: {
    defaultTheme: 'barberTheme',
    themes: {
      barberTheme: {
        dark: true,
        colors: {
          background: '#2B2B2B',
          surface: '#2B2B2B',
          primary: '#F5E009',   // Amarillo (color de acento)
          secondary: '#D9D9D9', // Color de texto principal
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          'on-background': '#D9D9D9',
          'on-surface': '#D9D9D9',
        }
      }
    }
  },
  defaults: {
    VBtn: {
      fontFamily: 'DM Serif, serif',
    },
    VCard: {
      fontFamily: 'DM Serif, serif',
    },
    VTextField: {
      fontFamily: 'DM Serif, serif',
    },
    VSelect: {
      fontFamily: 'DM Serif, serif',
    },
    VTab: {
      fontFamily: 'DM Serif, serif',
    },
    VAlert: {
      fontFamily: 'DM Serif, serif',
    },
    VList: {
      fontFamily: 'DM Serif, serif',
    }
  }
}) 