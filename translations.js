// Traducciones de la interfaz
const translations = {
    es: {
        // Login screen
        appTitle: "Spotify Lyrics Sync",
        appSubtitle: "Letras sincronizadas para tu stream",
        feature1: "Sincronización en tiempo real",
        feature2: "Efectos tipo karaoke",
        feature3: "Diseño premium",
        connectButton: "Conectar con Spotify",
        instructionsTitle: "Instrucciones para OBS:",
        instruction1: "1. Haz login aquí",
        instruction2: "2. Activa 'Fondo Verde' en ajustes",
        instruction3: "3. En OBS: Fuente Captura de Ventana",
        instruction4: "4. En OBS: Filtro 'Fondo Chroma'",

        // Lyrics screen
        noPlayback: "No hay reproducción",
        playSpotify: "Reproduce algo en Spotify",
        loadingLyrics: "Cargando letras...",
        searchingLyrics: "Buscando letras...",
        waitingPlayback: "Esperando reproducción...",
        noLyricsTitle: "😔 Letras no disponibles",
        noLyricsText: "No se encontraron letras para esta canción.",

        // Settings
        settingsTitle: "Configuración",
        transparentBg: "Fondo verde (Chroma Key)",
        playerStyle: "Estilo de reproductor:",
        playerStyleNormal: "Grande (Normal)",
        playerStyleCompact: "Compacto",
        playerStyleHidden: "Oculto (Solo letras)",
        playerStyleCustom: "Diseño Personalizado (Sleep Token)",
        lyricsMode: "Modo de letras:",
        lyricsModeList: "Lista (Karaoke)",
        lyricsModeSingle: "Línea única (Solo actual)",
        lyricsAlign: "Alineación de letras:",
        alignLeft: "Izquierda",
        alignCenter: "Centro",
        alignRight: "Derecha",
        accentColor: "Color de énfasis:",
        fontSize: "Tamaño de letra:",
        visibleLines: "Líneas visibles:",
        darkMode: "Modo oscuro",
        language: "Idioma:",
        closeButton: "Cerrar"
    },

    en: {
        // Login screen
        appTitle: "Spotify Lyrics Sync",
        appSubtitle: "Synchronized lyrics for your stream",
        feature1: "Real-time synchronization",
        feature2: "Karaoke-style effects",
        feature3: "Premium design",
        connectButton: "Connect with Spotify",
        instructionsTitle: "Instructions for OBS:",
        instruction1: "1. Login here",
        instruction2: "2. Enable 'Green Background' in settings",
        instruction3: "3. In OBS: Window Capture Source",
        instruction4: "4. In OBS: 'Chroma Key' Filter",

        // Lyrics screen
        noPlayback: "No playback",
        playSpotify: "Play something on Spotify",
        loadingLyrics: "Loading lyrics...",
        searchingLyrics: "Searching lyrics...",
        waitingPlayback: "Waiting for playback...",
        noLyricsTitle: "😔 Lyrics not available",
        noLyricsText: "No lyrics found for this song.",

        // Settings
        settingsTitle: "Settings",
        transparentBg: "Green background (Chroma Key)",
        playerStyle: "Player style:",
        playerStyleNormal: "Large (Normal)",
        playerStyleCompact: "Compact",
        playerStyleHidden: "Hidden (Lyrics only)",
        playerStyleCustom: "Custom Design (Sleep Token)",
        lyricsMode: "Lyrics mode:",
        lyricsModeList: "List (Karaoke)",
        lyricsModeSingle: "Single line (Current only)",
        lyricsAlign: "Lyrics alignment:",
        alignLeft: "Left",
        alignCenter: "Center",
        alignRight: "Right",
        accentColor: "Accent color:",
        fontSize: "Font size:",
        visibleLines: "Visible lines:",
        darkMode: "Dark mode",
        language: "Language:",
        closeButton: "Close"
    },

    pt: {
        // Login screen
        appTitle: "Spotify Lyrics Sync",
        appSubtitle: "Letras sincronizadas para sua transmissão",
        feature1: "Sincronização em tempo real",
        feature2: "Efeitos estilo karaokê",
        feature3: "Design premium",
        connectButton: "Conectar com Spotify",
        instructionsTitle: "Instruções para OBS:",
        instruction1: "1. Faça login aqui",
        instruction2: "2. Ative 'Fundo Verde' nas configurações",
        instruction3: "3. No OBS: Fonte de Captura de Janela",
        instruction4: "4. No OBS: Filtro 'Chroma Key'",

        // Lyrics screen
        noPlayback: "Sem reprodução",
        playSpotify: "Reproduza algo no Spotify",
        loadingLyrics: "Carregando letras...",
        searchingLyrics: "Procurando letras...",
        waitingPlayback: "Aguardando reprodução...",
        noLyricsTitle: "😔 Letras não disponíveis",
        noLyricsText: "Nenhuma letra encontrada para esta música.",

        // Settings
        settingsTitle: "Configurações",
        transparentBg: "Fundo verde (Chroma Key)",
        playerStyle: "Estilo do player:",
        playerStyleNormal: "Grande (Normal)",
        playerStyleCompact: "Compacto",
        playerStyleHidden: "Oculto (Apenas letras)",
        playerStyleCustom: "Design Personalizado (Sleep Token)",
        lyricsMode: "Modo de letras:",
        lyricsModeList: "Lista (Karaokê)",
        lyricsModeSingle: "Linha única (Atual)",
        lyricsAlign: "Alinhamento da letra:",
        alignLeft: "Esquerda",
        alignCenter: "Centro",
        alignRight: "Direita",
        accentColor: "Cor de destaque:",
        fontSize: "Tamanho da fonte:",
        visibleLines: "Linhas visíveis:",
        darkMode: "Modo escuro",
        language: "Idioma:",
        closeButton: "Fechar"
    }
};

// Exportar traducciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations };
}
