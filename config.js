// ============================================
// CONFIGURACIÓN DE SPOTIFY API
// ============================================
// 
// PASO 1: Crea una app en https://developer.spotify.com/dashboard
// PASO 2: Copia tu Client ID y pégalo abajo (reemplaza 'TU_CLIENT_ID_AQUI')
// PASO 3: Agrega la Redirect URI en Spotify Dashboard (ver abajo)
//
const CONFIG = {
    // ⚠️ REEMPLAZA ESTO con tu Client ID de Spotify
    // Ejemplo: CLIENT_ID: 'abc123def456ghi789jkl012mno345pqr',
    CLIENT_ID: 'TU_CLIENT_ID_AQUI',

    // URL de redirección - DEBE coincidir EXACTAMENTE con la configurada en Spotify Dashboard
    // Si usas servidor local (http://localhost:8000): Agrega 'http://localhost:8000/index.html'
    // Si usas file:// (NO RECOMENDADO): Agrega la ruta completa del archivo
    // Si usas GitHub Pages: Agrega 'https://tu-usuario.github.io/repo/index.html'
    REDIRECT_URI: window.location.origin + window.location.pathname,

    // Scopes necesarios para leer la reproducción actual
    SCOPES: [
        'user-read-currently-playing',
        'user-read-playback-state'
    ].join(' '),

    // Endpoints de Spotify
    AUTH_ENDPOINT: 'https://accounts.spotify.com/authorize',
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    API_BASE: 'https://api.spotify.com/v1',

    // Configuración de actualización
    UPDATE_INTERVAL: 1000, // Actualizar cada 1 segundo para sincronización precisa
    LYRICS_CACHE_TIME: 300000, // Cache de letras por 5 minutos
};

// API de letras sincronizadas
const LYRICS_API = {
    // LRCLIB - API gratuita para letras sincronizadas
    LRCLIB: 'https://lrclib.net/api',

    // Configuración
    TIMEOUT: 10000, // 10 segundos timeout
};

// Configuración de visualización
const DISPLAY_CONFIG = {
    // Número de líneas visibles antes y después de la línea actual
    LINES_BEFORE: 3,
    LINES_AFTER: 3,

    // Offset de sincronización (en milisegundos)
    // Ajusta este valor si las letras van adelantadas o atrasadas
    SYNC_OFFSET: 0,

    // Animaciones
    SCROLL_BEHAVIOR: 'smooth',
    TRANSITION_DURATION: 300,
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, LYRICS_API, DISPLAY_CONFIG };
}
