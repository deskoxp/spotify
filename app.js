// ===== SPOTIFY LYRICS SYNC APP =====
// Aplicación para mostrar letras sincronizadas de Spotify en tiempo real

class SpotifyLyricsApp {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.currentTrack = null;
        this.currentLyrics = null;
        this.syncedLyrics = [];
        this.updateInterval = null;
        this.lastUpdateTime = 0;
        this.isTransitioning = false;

        // Configuración
        this.settings = {
            transparentBg: true,
            showSongInfo: true,
            fontSize: 28,
            visibleLines: 7,
            darkMode: true,
            language: 'es'
        };

        this.init();
    }

    init() {
        this.loadSettings();
        this.checkCompactMode();
        this.setupEventListeners();
        this.checkAuth();
        this.updateInterfaceLanguage(); // Aplicar idioma inicial
    }

    checkCompactMode() {
        // Verificar si se activó el modo compacto desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        const isCompact = urlParams.get('compact') === 'true';

        if (isCompact) {
            document.body.classList.add('compact-mode');
            this.settings.showSongInfo = false;
            this.settings.transparentBg = true;
        }
    }

    // ===== PKCE HELPERS =====
    generateRandomString(length) {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    }

    async sha256(plain) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest('SHA-256', data);
    }

    base64encode(input) {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    async generateCodeChallenge(codeVerifier) {
        const hashed = await this.sha256(codeVerifier);
        return this.base64encode(hashed);
    }

    // ===== AUTENTICACIÓN =====
    setupEventListeners() {
        // Login
        document.getElementById('login-btn').addEventListener('click', () => this.login());

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => this.toggleSettings());
        document.getElementById('close-settings').addEventListener('click', () => this.toggleSettings());

        // Settings controls
        document.getElementById('transparent-bg').addEventListener('change', (e) => {
            this.settings.transparentBg = e.target.checked;
            this.applySettings();
        });

        document.getElementById('show-song-info').addEventListener('change', (e) => {
            this.settings.showSongInfo = e.target.checked;
            this.applySettings();
        });

        document.getElementById('font-size').addEventListener('input', (e) => {
            this.settings.fontSize = parseInt(e.target.value);
            document.getElementById('font-size-value').textContent = e.target.value + 'px';
            this.applySettings();
        });

        document.getElementById('visible-lines').addEventListener('input', (e) => {
            this.settings.visibleLines = parseInt(e.target.value);
            document.getElementById('visible-lines-value').textContent = e.target.value;
            this.applySettings();
        });

        // Theme Toggle
        const darkModeToggle = document.getElementById('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                this.settings.darkMode = e.target.checked;
                this.applySettings();
            });
        }

        // Language Select
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                this.applySettings();
                this.updateInterfaceLanguage(); // Actualizar textos al cambiar idioma
            });
        }

        // Toggle mode button (quick toggle)
        document.getElementById('toggle-mode').addEventListener('click', () => {
            this.settings.showSongInfo = !this.settings.showSongInfo;
            document.getElementById('show-song-info').checked = this.settings.showSongInfo;
            this.applySettings();
        });
    }

    async checkAuth() {
        // Verificar si hay un código en la URL (después de redirect con PKCE)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // Intercambiar el código por un token
            await this.exchangeCodeForToken(code);

            // Limpiar URL
            window.history.replaceState({}, document.title, window.location.pathname);

            this.showLyricsScreen();
            this.startUpdating();
        } else {
            // Verificar si hay un token guardado
            const savedToken = localStorage.getItem('spotify_access_token');
            const tokenExpiry = localStorage.getItem('spotify_token_expiry');

            if (savedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
                this.accessToken = savedToken;
                this.tokenExpiry = parseInt(tokenExpiry);
                this.showLyricsScreen();
                this.startUpdating();
            }
        }
    }

    async login() {
        // Generar code verifier y challenge para PKCE
        const codeVerifier = this.generateRandomString(64);
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);

        // Guardar code verifier para usarlo después
        localStorage.setItem('code_verifier', codeVerifier);

        // Construir URL de autorización con PKCE
        const params = new URLSearchParams({
            client_id: CONFIG.CLIENT_ID,
            response_type: 'code',
            redirect_uri: CONFIG.REDIRECT_URI,
            scope: CONFIG.SCOPES,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            show_dialog: 'true'
        });

        const authUrl = `${CONFIG.AUTH_ENDPOINT}?${params.toString()}`;
        window.location.href = authUrl;
    }

    async exchangeCodeForToken(code) {
        const codeVerifier = localStorage.getItem('code_verifier');

        if (!codeVerifier) {
            console.error('Code verifier not found');
            return;
        }

        const params = new URLSearchParams({
            client_id: CONFIG.CLIENT_ID,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: CONFIG.REDIRECT_URI,
            code_verifier: codeVerifier
        });

        try {
            const response = await fetch(CONFIG.TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });

            if (!response.ok) {
                throw new Error('Failed to exchange code for token');
            }

            const data = await response.json();

            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);

            // Guardar tokens
            localStorage.setItem('spotify_access_token', this.accessToken);
            localStorage.setItem('spotify_refresh_token', this.refreshToken);
            localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());

            // Limpiar code verifier
            localStorage.removeItem('code_verifier');
        } catch (error) {
            console.error('Error exchanging code for token:', error);
        }
    }

    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expiry');
        localStorage.removeItem('code_verifier');
        this.stopUpdating();
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('lyrics-screen').classList.remove('active');
    }

    showLyricsScreen() {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('lyrics-screen').classList.add('active');
        this.applySettings();
    }

    // ===== SPOTIFY API =====
    async getCurrentTrack() {
        try {
            const response = await fetch(`${CONFIG.API_BASE}/me/player/currently-playing`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (response.status === 401) {
                // Token expirado - Intentar refresh si tuviéramos lógica, por ahora logout
                this.logout();
                return null;
            }

            if (response.status === 204 || !response.ok) {
                // No hay reproducción activa
                return null;
            }

            const data = await response.json();

            if (!data.item) {
                return null;
            }

            return {
                id: data.item.id,
                name: data.item.name,
                artist: data.item.artists.map(a => a.name).join(', '),
                album: data.item.album.name,
                albumArt: data.item.album.images[0]?.url,
                duration: data.item.duration_ms,
                progress: data.progress_ms,
                isPlaying: data.is_playing
            };
        } catch (error) {
            console.error('Error fetching current track:', error);
            return null;
        }
    }

    // ===== LYRICS API =====
    async fetchLyrics(trackName, artistName, duration) {
        try {
            // Limpiar nombres para la búsqueda
            const cleanTrack = this.cleanSearchTerm(trackName);
            const cleanArtist = this.cleanSearchTerm(artistName);

            // Buscar en LRCLIB
            const searchUrl = `${LYRICS_API.LRCLIB}/search?track_name=${encodeURIComponent(cleanTrack)}&artist_name=${encodeURIComponent(cleanArtist)}`;

            const response = await fetch(searchUrl);

            if (!response.ok) {
                throw new Error('Lyrics not found');
            }

            const results = await response.json();

            if (!results || results.length === 0) {
                return null;
            }

            // Tomar el primer resultado
            const lyrics = results[0];

            // Verificar si tiene letras sincronizadas
            if (lyrics.syncedLyrics) {
                return {
                    synced: true,
                    lyrics: lyrics.syncedLyrics,
                    plain: lyrics.plainLyrics
                };
            } else if (lyrics.plainLyrics) {
                return {
                    synced: false,
                    lyrics: lyrics.plainLyrics,
                    plain: lyrics.plainLyrics
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching lyrics:', error);
            return null;
        }
    }

    cleanSearchTerm(term) {
        // Remover contenido entre paréntesis y corchetes
        return term
            .replace(/\([^)]*\)/g, '')
            .replace(/\[[^\]]*\]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    parseSyncedLyrics(lrcText) {
        const lines = lrcText.split('\n');
        const parsed = [];

        for (const line of lines) {
            // Formato LRC: [mm:ss.xx] texto
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);

            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const centiseconds = parseInt(match[3].padEnd(3, '0'));
                const text = match[4].trim();

                const timeMs = (minutes * 60 * 1000) + (seconds * 1000) + centiseconds;

                if (text) {
                    parsed.push({
                        time: timeMs,
                        text: text
                    });
                }
            }
        }

        return parsed.sort((a, b) => a.time - b.time);
    }

    // ===== UI UPDATES =====
    async updateNowPlaying() {
        if (this.isTransitioning) return; // No actualizar durante transición

        const track = await this.getCurrentTrack();

        if (!track) {
            this.displayNoTrack();
            return;
        }

        // Actualizar progreso
        this.updateProgress(track.progress, track.duration);

        // Si es una nueva canción, hacer transición
        if (!this.currentTrack || this.currentTrack.id !== track.id) {
            await this.handleTrackChange(track);
        } else {
            // Solo actualizar la línea actual de las letras
            if (this.syncedLyrics.length > 0) {
                this.updateActiveLyric(track.progress);
            }
        }
    }

    async handleTrackChange(track) {
        this.isTransitioning = true;

        // 1. Fade Out
        const lyricsContainer = document.getElementById('lyrics-content');
        const songInfo = document.querySelector('.song-info');
        lyricsContainer.classList.add('fade-transition', 'fade-out');
        songInfo.classList.add('fade-transition', 'fade-out');

        // Esperar a que termine la animación
        await new Promise(r => setTimeout(r, 500));

        // 2. Limpiar y Cargar nuevos datos
        this.currentTrack = track;
        this.updateTrackInfo(track);
        lyricsContainer.innerHTML = ''; // Limpiar letras inmediatamente

        // Mostrar "Cargando..."
        const loadingMsg = document.createElement('p');
        loadingMsg.className = 'loading-message';
        loadingMsg.textContent = this.getTranslation('loadingLyrics');
        lyricsContainer.appendChild(loadingMsg);

        // 3. Fade In (con loading)
        lyricsContainer.classList.remove('fade-out');
        songInfo.classList.remove('fade-out');

        // 4. Buscar letras en background
        await this.loadAndDisplayLyrics(track);

        this.isTransitioning = false;
    }

    updateTrackInfo(track) {
        document.getElementById('track-name').textContent = track.name;
        document.getElementById('artist-name').textContent = track.artist;
        document.getElementById('album-image').src = track.albumArt || '';
    }

    updateProgress(progress, duration) {
        const percentage = (progress / duration) * 100;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }

    async loadAndDisplayLyrics(track) {
        const lyricsContainer = document.getElementById('lyrics-content');

        const lyrics = await this.fetchLyrics(track.name, track.artist, track.duration);

        // Fade out loading message
        lyricsContainer.classList.add('fade-out');
        await new Promise(r => setTimeout(r, 300));

        lyricsContainer.innerHTML = ''; // Limpiar loading

        if (!lyrics) {
            this.displayNoLyrics();
        } else {
            this.currentLyrics = lyrics;
            if (lyrics.synced) {
                this.syncedLyrics = this.parseSyncedLyrics(lyrics.lyrics);
                this.displaySyncedLyrics();
            } else {
                this.syncedLyrics = [];
                this.displayPlainLyrics(lyrics.plain);
            }
        }

        // Fade in new lyrics
        lyricsContainer.classList.remove('fade-out');
    }

    displaySyncedLyrics() {
        const lyricsContainer = document.getElementById('lyrics-content');
        lyricsContainer.innerHTML = '';

        this.syncedLyrics.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'lyric-line';
            lineElement.textContent = line.text;
            lineElement.dataset.index = index;
            lineElement.dataset.time = line.time;
            lyricsContainer.appendChild(lineElement);
        });
    }

    displayPlainLyrics(text) {
        const lyricsContainer = document.getElementById('lyrics-content');
        lyricsContainer.innerHTML = '';

        const lines = text.split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                const lineElement = document.createElement('div');
                lineElement.className = 'lyric-line active';
                lineElement.textContent = line;
                lyricsContainer.appendChild(lineElement);
            }
        });
    }

    displayNoLyrics() {
        const lyricsContainer = document.getElementById('lyrics-content');
        lyricsContainer.innerHTML = `
            <div class="no-lyrics">
                <h3>${this.getTranslation('noLyricsTitle')}</h3>
                <p>${this.getTranslation('noLyricsText')}</p>
            </div>
        `;
    }

    displayNoTrack() {
        const tTitle = document.getElementById('track-name');
        const tArtist = document.getElementById('artist-name');

        if (tTitle.textContent !== this.getTranslation('noPlayback')) {
            tTitle.textContent = this.getTranslation('noPlayback');
            tArtist.textContent = this.getTranslation('playSpotify');
            document.getElementById('album-image').src = '';

            const lyricsContainer = document.getElementById('lyrics-content');
            lyricsContainer.innerHTML = `<p class="loading-message">${this.getTranslation('waitingPlayback')}</p>`;
        }
    }

    updateActiveLyric(currentTime) {
        if (this.syncedLyrics.length === 0) return;

        // Aplicar offset de sincronización
        const adjustedTime = currentTime + DISPLAY_CONFIG.SYNC_OFFSET;

        // Encontrar la línea actual
        let currentIndex = -1;
        for (let i = this.syncedLyrics.length - 1; i >= 0; i--) {
            if (adjustedTime >= this.syncedLyrics[i].time) {
                currentIndex = i;
                break;
            }
        }

        // Actualizar clases de las líneas
        const lines = document.querySelectorAll('.lyric-line');
        lines.forEach((line, index) => {
            line.classList.remove('active', 'past', 'upcoming');

            if (index === currentIndex) {
                line.classList.add('active');
            } else if (index < currentIndex) {
                line.classList.add('past');
            } else {
                line.classList.add('upcoming');
            }
        });

        // Auto-scroll para mantener la línea actual centrada
        if (currentIndex >= 0 && lines[currentIndex]) {
            const container = document.getElementById('lyrics-content');
            const activeLine = lines[currentIndex];

            const containerHeight = container.clientHeight;
            const lineTop = activeLine.offsetTop;
            const lineHeight = activeLine.clientHeight;

            const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);

            container.scrollTo({
                top: scrollTo,
                behavior: DISPLAY_CONFIG.SCROLL_BEHAVIOR
            });
        }
    }

    // ===== SETTINGS & LANGUAGE =====
    loadSettings() {
        const saved = localStorage.getItem('lyrics_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }

        // Aplicar a los controles si existen en el DOM
        const setCheckbox = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.checked = val;
        };
        const setValue = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };
        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setCheckbox('transparent-bg', this.settings.transparentBg);
        setCheckbox('show-song-info', this.settings.showSongInfo);
        setCheckbox('dark-mode', this.settings.darkMode);

        setValue('font-size', this.settings.fontSize);
        setText('font-size-value', this.settings.fontSize + 'px');

        setValue('visible-lines', this.settings.visibleLines);
        setText('visible-lines-value', this.settings.visibleLines);

        const langSelect = document.getElementById('language-select');
        if (langSelect) langSelect.value = this.settings.language;
    }

    applySettings() {
        // Guardar
        localStorage.setItem('lyrics_settings', JSON.stringify(this.settings));

        // Aplicar fondo transparente
        if (this.settings.transparentBg) {
            document.body.classList.add('transparent');
            const ls = document.getElementById('lyrics-screen');
            if (ls) ls.classList.add('transparent');
        } else {
            document.body.classList.remove('transparent');
            const ls = document.getElementById('lyrics-screen');
            if (ls) ls.classList.remove('transparent');
        }

        // Modo Claro/Oscuro
        if (this.settings.darkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }

        // Mostrar/ocultar info de canción
        const songInfo = document.querySelector('.song-info');
        if (songInfo) {
            if (this.settings.showSongInfo) {
                songInfo.classList.remove('hidden');
            } else {
                songInfo.classList.add('hidden');
            }
        }

        // Tamaño de fuente
        const style = document.documentElement.style;
        style.setProperty('--lyric-font-size', this.settings.fontSize + 'px');
        style.setProperty('--lyric-font-size-active', (this.settings.fontSize + 4) + 'px');

        // Aplicar a las líneas existentes
        document.querySelectorAll('.lyric-line').forEach(line => {
            line.style.fontSize = this.settings.fontSize + 'px';
        });

        document.querySelectorAll('.lyric-line.active').forEach(line => {
            line.style.fontSize = (this.settings.fontSize + 4) + 'px';
        });
    }

    // Sistema de Traducción
    getTranslation(key) {
        const lang = this.settings.language || 'es';

        // Verificar si translations existe globalmente
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            return translations[lang][key];
        }

        // Fallback a inglés o devolver clave
        if (typeof translations !== 'undefined' && translations['en'] && translations['en'][key]) {
            return translations['en'][key];
        }

        return key;
    }

    updateInterfaceLanguage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                el.textContent = this.getTranslation(key);
            }
        });

        // Actualizar placeholders o títulos si es necesario
        // (Aquí podrías agregar lógica para inputs o titles)
    }

    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel) panel.classList.toggle('active');
    }

    // ===== UPDATE LOOP =====
    startUpdating() {
        this.updateNowPlaying();
        this.updateInterval = setInterval(() => {
            this.updateNowPlaying();
        }, CONFIG.UPDATE_INTERVAL);
    }

    stopUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.lyricsApp = new SpotifyLyricsApp();
});
