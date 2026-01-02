# 🎵 Spotify Lyrics Sync - Stream Overlay

Aplicación web que muestra las letras de las canciones de Spotify **sincronizadas en tiempo real** para usar en streams de Twitch con OBS.

## ✨ Características

- 🎤 **Letras sincronizadas tipo karaoke** - Las letras se resaltan en tiempo real con la música
- 🎨 **Diseño premium y moderno** - Glassmorphism, gradientes y animaciones suaves
- 🔄 **Auto-actualización** - Cambia automáticamente cuando cambias de canción
- 👁️ **Fondo transparente** - Perfecto para usar como overlay en OBS
- ⚙️ **Totalmente personalizable** - Tamaño de fuente, líneas visibles, transparencia
- 📱 **Responsive** - Funciona en cualquier dispositivo

## 🚀 Configuración Rápida

### 1. Crear una aplicación en Spotify

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Inicia sesión con tu cuenta de Spotify
3. Haz clic en **"Create app"**
4. Completa el formulario:
   - **App name**: Spotify Lyrics Sync (o el nombre que prefieras)
   - **App description**: Aplicación para mostrar letras sincronizadas
   - **Redirect URI**: La URL donde vas a alojar la aplicación (ver opciones abajo)
   - **API/SDKs**: Marca "Web API"
5. Acepta los términos y haz clic en **"Save"**
6. En la página de tu app, haz clic en **"Settings"**
7. Copia tu **Client ID**

### 2. Opciones para alojar la aplicación

#### Opción A: Servidor local (para pruebas)
```bash
# En la carpeta del proyecto, ejecuta:
python -m http.server 8000
# O si tienes Node.js:
npx serve
```
- **Redirect URI**: `http://localhost:8000/index.html` o `http://localhost:3000/index.html`

#### Opción B: GitHub Pages (recomendado para streams)
1. Sube los archivos a un repositorio de GitHub
2. Ve a Settings → Pages
3. Selecciona la rama main y carpeta root
4. Guarda y espera a que se despliegue
- **Redirect URI**: `https://tu-usuario.github.io/nombre-repo/index.html`

#### Opción C: Netlify/Vercel (alternativa)
1. Arrastra la carpeta a Netlify o Vercel
2. Copia la URL que te dan
- **Redirect URI**: `https://tu-app.netlify.app/index.html`

### 3. Configurar el Client ID

1. Abre el archivo `config.js`
2. Reemplaza `'TU_CLIENT_ID_AQUI'` con tu Client ID de Spotify:

```javascript
CLIENT_ID: 'abc123def456ghi789', // Tu Client ID aquí
```

3. Asegúrate de que `REDIRECT_URI` coincida con la URL configurada en Spotify:

```javascript
REDIRECT_URI: window.location.origin + window.location.pathname,
```

### 4. Agregar Redirect URI en Spotify

1. Vuelve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Abre tu aplicación
3. Haz clic en **"Settings"**
4. En **"Redirect URIs"**, agrega la URL exacta donde está alojada tu app
5. Haz clic en **"Add"** y luego en **"Save"**

## 🎮 Uso en OBS

### Configuración en OBS

1. Abre OBS Studio
2. Agrega una nueva fuente → **"Navegador"**
3. Configura:
   - **URL**: La URL de tu aplicación
   - **Ancho**: 1920 (o el ancho de tu canvas)
   - **Alto**: 1080 (o el alto de tu canvas)
   - ✅ Marca **"Actualizar navegador cuando la escena se vuelve activa"**
   - ✅ Marca **"Controlar audio mediante OBS"** (opcional)
4. Haz clic en **"Aceptar"**

### Primera vez

1. La fuente mostrará la pantalla de login
2. Haz clic en **"Conectar con Spotify"**
3. Autoriza la aplicación
4. ¡Listo! Las letras aparecerán automáticamente

### Configuración recomendada

1. Haz clic en el botón de configuración (⚙️)
2. Activa **"Fondo transparente"**
3. Desactiva **"Mostrar información de canción"** si solo quieres las letras
4. Ajusta el tamaño de fuente según tu resolución
5. Ajusta las líneas visibles (recomendado: 5-7)

### Posicionamiento

- Coloca la fuente donde prefieras en tu escena
- Redimensiona según necesites
- Puedes usar filtros de OBS para agregar sombras o efectos adicionales

## 🎨 Personalización

### Ajustes disponibles

- **Fondo transparente**: Activa/desactiva el fondo para OBS
- **Mostrar info de canción**: Muestra/oculta la carátula y nombre de la canción
- **Tamaño de fuente**: 16px - 48px
- **Líneas visibles**: 3 - 15 líneas

### Modificar estilos

Puedes editar `styles.css` para cambiar:
- Colores (variables CSS en `:root`)
- Fuentes (actualmente usa Inter y Poppins)
- Animaciones
- Efectos visuales

### Ajustar sincronización

Si las letras van adelantadas o atrasadas, edita en `config.js`:

```javascript
SYNC_OFFSET: 0, // Cambia a -500 (medio segundo atrás) o 500 (medio segundo adelante)
```

## 🔧 Solución de problemas

### "No se encontraron letras"
- No todas las canciones tienen letras sincronizadas disponibles
- La app intentará buscar letras, pero algunas canciones no están en la base de datos
- Prueba con canciones populares en inglés (tienen más probabilidad de tener letras)

### "Token expirado"
- Los tokens de Spotify expiran después de 1 hora
- Simplemente vuelve a hacer clic en "Conectar con Spotify"
- La app te redirigirá automáticamente

### Las letras no se sincronizan bien
- Ajusta el `SYNC_OFFSET` en `config.js`
- Verifica que Spotify esté reproduciendo (no en pausa)
- Algunas canciones pueden tener timestamps imprecisos

### No aparece nada en OBS
- Verifica que la URL sea correcta
- Asegúrate de haber autorizado la aplicación
- Revisa la consola del navegador en OBS (clic derecho → Interactuar)

## 📝 Notas importantes

- **Privacidad**: Esta app solo lee tu reproducción actual, no modifica nada
- **Límites de API**: Spotify tiene límites de requests, pero son muy altos para uso personal
- **Letras**: Las letras provienen de LRCLIB, una base de datos comunitaria gratuita
- **Offline**: La app necesita conexión a internet para funcionar

## 🎯 Roadmap

- [ ] Soporte para múltiples idiomas en la UI
- [ ] Temas de color personalizables
- [ ] Efectos de transición entre líneas
- [ ] Exportar configuración
- [ ] Modo "solo letra actual" (una línea grande)

## 📄 Licencia

Este proyecto es de código abierto. Úsalo libremente para tus streams.

## 🙏 Créditos

- **Spotify Web API** - Para obtener la reproducción actual
- **LRCLIB** - Para las letras sincronizadas
- **Google Fonts** - Inter y Poppins

---

**¿Problemas o sugerencias?** Abre un issue en GitHub o contáctame.

¡Disfruta de tus streams con letras sincronizadas! 🎵✨
