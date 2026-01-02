# 🎬 Guía para usar Spotify Lyrics en OBS

## 📺 Configuración en OBS Studio

### **Paso 1: Agregar la fuente de navegador**

1. En OBS, selecciona la escena donde quieres las letras
2. Haz clic en el **+** en "Fuentes"
3. Selecciona **"Navegador"**
4. Dale un nombre (ejemplo: "Letras Spotify")

### **Paso 2: Configurar la URL**

**Para modo COMPACTO (solo letras, sin info de canción):**
```
https://deskoxp.github.io/spotify/?compact=true
```

**Para modo COMPLETO (con info de canción):**
```
https://deskoxp.github.io/spotify/
```

### **Paso 3: Configurar dimensiones**

- **Ancho**: 1920 (o el ancho de tu canvas)
- **Alto**: 1080 (o el alto de tu canvas)
- **FPS personalizado**: 30

### **Paso 4: Opciones importantes**

✅ **Marca estas opciones:**
- ✅ Actualizar navegador cuando la escena se vuelve activa
- ✅ Apagar fuente cuando no está visible (opcional, ahorra recursos)

❌ **NO marques:**
- ❌ Controlar audio mediante OBS (no es necesario)

### **Paso 5: Haz clic en "Aceptar"**

---

## 🎨 Ajustar posición y tamaño

1. **Redimensionar**: Arrastra las esquinas de la fuente para ajustar el tamaño
2. **Posicionar**: Arrastra la fuente a donde quieras (esquina inferior, centro, etc.)
3. **Recortar** (opcional): Clic derecho → Filtros → + → Recortar/Rellenar

---

## 🔧 Configuración avanzada

### **Fondo transparente**

El modo compacto (`?compact=true`) ya tiene fondo transparente automático.

Si usas el modo completo y quieres fondo transparente:
1. Una vez cargada la app en OBS
2. Clic derecho en la fuente → **Interactuar**
3. Haz clic en el botón de configuración ⚙️
4. Activa **"Fondo transparente"**
5. Cierra la ventana de interacción

### **Ajustar tamaño de letra**

**Opción A: Desde la URL**
```
https://deskoxp.github.io/spotify/?compact=true&fontSize=48
```

**Opción B: Desde la configuración**
1. Clic derecho en la fuente → **Interactuar**
2. Clic en ⚙️ Configuración
3. Ajusta el slider de "Tamaño de letra"

### **Solo mostrar línea actual**

El modo compacto ya oculta las líneas pasadas y solo muestra:
- ✅ Línea actual (grande y resaltada)
- ✅ Próximas 2-3 líneas (más pequeñas)
- ❌ Líneas pasadas (ocultas)

---

## 🎯 Posiciones recomendadas

### **Esquina inferior izquierda**
- Posición: X: 50, Y: 850
- Tamaño: 800x200
- Ideal para: Gameplay

### **Centro inferior**
- Posición: X: 560, Y: 900
- Tamaño: 800x150
- Ideal para: Just Chatting, IRL

### **Lateral derecho**
- Posición: X: 1400, Y: 400
- Tamaño: 450x600
- Ideal para: Streams de música

---

## 🔄 Primera vez usando la fuente

1. La primera vez que agregues la fuente, verás la pantalla de login
2. **Clic derecho** en la fuente → **Interactuar**
3. Haz clic en **"Conectar con Spotify"**
4. Autoriza la aplicación en la ventana que se abre
5. Cierra la ventana de interacción
6. ¡Listo! Las letras aparecerán automáticamente

**Nota:** Solo necesitas hacer login UNA VEZ. OBS recordará la sesión.

---

## 🎵 Probar que funciona

1. Reproduce una canción en Spotify (desktop o móvil)
2. Las letras deberían aparecer en 1-2 segundos
3. Verifica que la línea actual se resalta en tiempo real

**Canciones recomendadas para probar** (tienen letras sincronizadas):
- "Bohemian Rhapsody" - Queen
- "Shape of You" - Ed Sheeran  
- "Blinding Lights" - The Weeknd
- "Someone Like You" - Adele

---

## ⚠️ Solución de problemas

### **No aparecen las letras**
- Verifica que estés reproduciendo música en Spotify
- Algunas canciones no tienen letras disponibles
- Prueba con una canción popular en inglés

### **Las letras van atrasadas/adelantadas**
- Esto es normal, depende de la base de datos de letras
- No todas las canciones tienen timestamps perfectos

### **La fuente se ve negra**
- Clic derecho → Interactuar
- Verifica que hayas hecho login en Spotify
- Refresca la página (F5 en la ventana de interacción)

### **Quiero cambiar el diseño**
- Clic derecho → Interactuar
- Clic en ⚙️ para abrir configuración
- Ajusta tamaño de letra, líneas visibles, etc.

---

## 💡 Tips profesionales

1. **Usa el modo compacto** para streams de gaming (menos distracción)
2. **Agrega un filtro de sombra** en OBS para mejor legibilidad
3. **Crea múltiples escenas** con diferentes posiciones de letras
4. **Usa hotkeys** para mostrar/ocultar las letras cuando quieras

---

## 🎨 Personalización adicional

### **Agregar sombra en OBS**
1. Clic derecho en la fuente → **Filtros**
2. **+** → **Sombra paralela**
3. Ajusta opacidad y desplazamiento

### **Agregar borde/contorno**
1. Filtros → **+** → **Contorno de color**
2. Ajusta grosor y color

---

¿Necesitas ayuda? Revisa el README.md principal o abre un issue en GitHub.

**¡Disfruta de tus streams con letras sincronizadas!** 🎵✨
