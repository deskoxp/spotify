const CONFIG = {
    // Tu Client ID de Spotify Developer Dashboard
    CLIENT_ID: 'c8b621295efc487d86381b96752014d6',

    // URL de redirección (debe coincidir EXACTAMENTE con la configurada en Spotify Dashboard)
    // Para GitHub Pages: https://tu-usuario.github.io/spotify/
    REDIRECT_URI: 'https://deskoxp.github.io/spotify/',

    // Scopes necesarios
    SCOPES: 'user-read-currently-playing user-read-playback-state',

    // Endpoints
    AUTH_ENDPOINT: 'https://accounts.spotify.com/authorize',
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    API_BASE: 'https://api.spotify.com/v1',

    // Intervalo de actualización (ms)
    UPDATE_INTERVAL: 1000
};

const LYRICS_API = {
    // API pública de LRCLIB
    LRCLIB: 'https://lrclib.net/api'
};

const DISPLAY_CONFIG = {
    // Ajuste de sincronización (ms) - positivo adelanta letras, negativo retrasa
    SYNC_OFFSET: 500,

    // Comportamiento de scroll
    SCROLL_BEHAVIOR: 'smooth'
};
