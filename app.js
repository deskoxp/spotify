// ===== SPOTIFY LYRICS SYNC APP =====

class SpotifyLyricsApp {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.currentTrack = null;
        this.currentLyrics = null;
        this.syncedLyrics = [];
        this.updateInterval = null;
        this.isTransitioning = false;

        // Configuración por defecto
        this.settings = {
            transparentBg: true,
            playerStyle: 'custom',
            playerAlign: 'center', // Alineación reproductor por defecto
            lyricsMode: 'single',
            lyricsAlign: 'center',
            accentColor: '#e91429',
            fontSize: 48,
            visibleLines: 7,
            darkMode: true,
            language: 'es'
        };

        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.checkAuth();
        this.updateInterfaceLanguage();
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
        document.getElementById('login-btn').addEventListener('click', () => this.login());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        document.getElementById('settings-btn').addEventListener('click', () => this.toggleSettings());
        document.getElementById('close-settings').addEventListener('click', () => this.toggleSettings());

        document.getElementById('toggle-bg').addEventListener('click', () => {
            this.settings.transparentBg = !this.settings.transparentBg;
            const cb = document.getElementById('transparent-bg');
            if (cb) cb.checked = this.settings.transparentBg;
            this.applySettings();
        });

        document.getElementById('transparent-bg').addEventListener('change', (e) => {
            this.settings.transparentBg = e.target.checked;
            this.applySettings();
        });

        document.getElementById('player-style').addEventListener('change', (e) => {
            this.settings.playerStyle = e.target.value;
            this.applySettings();
        });

        // Nuevo Player Align
        const pAlign = document.getElementById('player-align');
        if (pAlign) {
            pAlign.addEventListener('change', (e) => {
                this.settings.playerAlign = e.target.value;
                this.applySettings();
            });
        }

        document.getElementById('lyrics-mode').addEventListener('change', (e) => {
            this.settings.lyricsMode = e.target.value;
            this.applySettings();
        });

        const alignSelect = document.getElementById('lyrics-align');
        if (alignSelect) {
            alignSelect.addEventListener('change', (e) => {
                this.settings.lyricsAlign = e.target.value;
                this.applySettings();
            });
        }

        const colorPicker = document.getElementById('accent-color');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.settings.accentColor = e.target.value;
                document.getElementById('accent-color-value').textContent = e.target.value;
                this.applySettings();
            });
        }

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

        const darkModeToggle = document.getElementById('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                this.settings.darkMode = e.target.checked;
                this.applySettings();
            });
        }

        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                this.applySettings();
                this.updateInterfaceLanguage();
            });
        }
    }

    async checkAuth() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            await this.exchangeCodeForToken(code);
            window.history.replaceState({}, document.title, window.location.pathname);
            this.showLyricsScreen();
            this.startUpdating();
        } else {
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
        const codeVerifier = this.generateRandomString(64);
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);
        localStorage.setItem('code_verifier', codeVerifier);

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
        if (!codeVerifier) return;

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
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            if (!response.ok) throw new Error('Failed to exchange code');

            const data = await response.json();
            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);

            localStorage.setItem('spotify_access_token', this.accessToken);
            localStorage.setItem('spotify_refresh_token', this.refreshToken);
            localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
            localStorage.removeItem('code_verifier');
        } catch (error) {
            console.error('Error exchanging token:', error);
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
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });

            if (response.status === 401) {
                this.logout();
                return null;
            }
            if (response.status === 204 || !response.ok) return null;

            const data = await response.json();
            if (!data.item) return null;

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
            return null;
        }
    }

    // ===== LYRICS API =====
    async fetchLyrics(trackName, artistName, duration) {
        try {
            const cleanTrack = this.cleanSearchTerm(trackName);
            const cleanArtist = this.cleanSearchTerm(artistName);
            const searchUrl = `${LYRICS_API.LRCLIB}/search?track_name=${encodeURIComponent(cleanTrack)}&artist_name=${encodeURIComponent(cleanArtist)}`;

            const response = await fetch(searchUrl);
            if (!response.ok) throw new Error('Lyrics not found');

            const results = await response.json();
            if (!results || results.length === 0) return null;

            const lyrics = results[0];
            if (lyrics.syncedLyrics) {
                return { synced: true, lyrics: lyrics.syncedLyrics, plain: lyrics.plainLyrics };
            } else if (lyrics.plainLyrics) {
                return { synced: false, lyrics: lyrics.plainLyrics, plain: lyrics.plainLyrics };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    cleanSearchTerm(term) {
        return term.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
    }

    parseSyncedLyrics(lrcText) {
        const lines = lrcText.split('\n');
        const parsed = [];
        for (const line of lines) {
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const centiseconds = parseInt(match[3].padEnd(3, '0'));
                const text = match[4].trim();
                const timeMs = (minutes * 60 * 1000) + (seconds * 1000) + centiseconds;
                if (text) parsed.push({ time: timeMs, text: text });
            }
        }
        return parsed.sort((a, b) => a.time - b.time);
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // ===== UI UPDATES =====
    async updateNowPlaying() {
        if (this.isTransitioning) return;

        const track = await this.getCurrentTrack();

        if (!track) {
            this.displayNoTrack();
            return;
        }

        this.updateProgress(track.progress, track.duration);

        if (!this.currentTrack || this.currentTrack.id !== track.id) {
            await this.handleTrackChange(track);
        } else {
            if (this.syncedLyrics.length > 0) {
                this.updateActiveLyric(track.progress);
            }
        }
    }

    async handleTrackChange(track) {
        this.isTransitioning = true;
        const lyricsContainer = document.getElementById('lyrics-content');
        const songContainer = document.querySelector('.song-player-container');

        lyricsContainer.classList.add('fade-transition', 'fade-out');
        songContainer.classList.add('fade-transition', 'fade-out');

        await new Promise(r => setTimeout(r, 500));

        this.currentTrack = track;
        this.updateTrackInfo(track);
        lyricsContainer.innerHTML = '';

        const loadingMsg = document.createElement('p');
        loadingMsg.className = 'loading-message';
        loadingMsg.textContent = this.getTranslation('loadingLyrics');
        // Solo mostrar cargando en modo lista o si está vacío, para evitar saltos
        if (this.settings.lyricsMode === 'list') {
            lyricsContainer.appendChild(loadingMsg);
        }

        lyricsContainer.classList.remove('fade-out');
        songContainer.classList.remove('fade-out');

        await this.loadAndDisplayLyrics(track);
        this.isTransitioning = false;
    }

    updateTrackInfo(track) {
        document.getElementById('track-name').textContent = track.name;
        document.getElementById('artist-name').textContent = track.artist;
        document.getElementById('album-image').src = track.albumArt || '';
        document.getElementById('total-time').textContent = this.formatTime(track.duration);
    }

    updateProgress(progress, duration) {
        const percentage = (progress / duration) * 100;
        const bottomFill = document.getElementById('bottom-progress-fill');
        if (bottomFill) bottomFill.style.width = `${percentage}%`;

        const currTime = document.getElementById('current-time');
        if (currTime) currTime.textContent = this.formatTime(progress);
    }

    async loadAndDisplayLyrics(track) {
        const lyricsContainer = document.getElementById('lyrics-content');
        const lyrics = await this.fetchLyrics(track.name, track.artist, track.duration);

        lyricsContainer.classList.add('fade-out');
        await new Promise(r => setTimeout(r, 300));
        lyricsContainer.innerHTML = '';

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
            if (index === 0) lineElement.classList.add('active');
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
            </div>`;
    }

    displayNoTrack() {
        // ... (misma lógica)
    }

    updateActiveLyric(currentTime) {
        if (this.syncedLyrics.length === 0) return;
        const adjustedTime = currentTime + DISPLAY_CONFIG.SYNC_OFFSET;

        let currentIndex = -1;
        for (let i = this.syncedLyrics.length - 1; i >= 0; i--) {
            if (adjustedTime >= this.syncedLyrics[i].time) {
                currentIndex = i;
                break;
            }
        }

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

        if (this.settings.lyricsMode === 'list' && currentIndex >= 0 && lines[currentIndex]) {
            const container = document.getElementById('lyrics-content');
            const activeLine = lines[currentIndex];
            const scrollTo = activeLine.offsetTop - (container.clientHeight / 2) + (activeLine.clientHeight / 2);
            container.scrollTo({ top: scrollTo, behavior: DISPLAY_CONFIG.SCROLL_BEHAVIOR });
        }
    }

    // ===== SETTINGS =====
    loadSettings() {
        const saved = localStorage.getItem('lyrics_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }

        const setEl = (id, prop) => { const el = document.getElementById(id); if (el) el.value = prop; };
        const setCheck = (id, prop) => { const el = document.getElementById(id); if (el) el.checked = prop; };

        setCheck('transparent-bg', this.settings.transparentBg);
        setCheck('dark-mode', this.settings.darkMode);
        setEl('font-size', this.settings.fontSize);
        document.getElementById('font-size-value').textContent = this.settings.fontSize + 'px';
        setEl('visible-lines', this.settings.visibleLines);
        document.getElementById('visible-lines-value').textContent = this.settings.visibleLines;
        setEl('language-select', this.settings.language);
        setEl('player-style', this.settings.playerStyle);
        setEl('lyrics-mode', this.settings.lyricsMode);

        setEl('player-align', this.settings.playerAlign); // Nuevo load
        setEl('lyrics-align', this.settings.lyricsAlign);
        setEl('accent-color', this.settings.accentColor);
        document.getElementById('accent-color-value').textContent = this.settings.accentColor;
    }

    applySettings() {
        localStorage.setItem('lyrics_settings', JSON.stringify(this.settings));

        // 1. Chroma
        if (this.settings.transparentBg) {
            document.body.classList.add('chroma-mode');
        } else {
            document.body.classList.remove('chroma-mode');
        }

        // 2. Mode Dark/Light
        if (this.settings.darkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }

        // 3. Player Style
        document.body.classList.remove('player-custom', 'player-hidden');
        document.body.classList.add(`player-${this.settings.playerStyle}`);

        // 4. Player Align (NUEVO)
        document.body.classList.remove('player-align-left', 'player-align-center', 'player-align-right');
        document.body.classList.add(`player-align-${this.settings.playerAlign}`);

        // 5. Lyrics Mode
        document.body.classList.remove('lyrics-list', 'lyrics-single');
        document.body.classList.add(`lyrics-${this.settings.lyricsMode}`);

        // 6. Lyrics Align
        document.body.classList.remove('align-left', 'align-center', 'align-right');
        document.body.classList.add(`align-${this.settings.lyricsAlign}`);

        // 7. Colors
        document.documentElement.style.setProperty('--accent-color', this.settings.accentColor);

        // 8. Tamaños
        const linesGroup = document.getElementById('visible-lines-group');
        if (linesGroup) linesGroup.style.display = (this.settings.lyricsMode === 'single') ? 'none' : 'block';

        // Actualizar variables de fuente dinámicamente
        document.documentElement.style.setProperty('--lyric-font-size', this.settings.fontSize + 'px');
        // Single line es fuente base, el CSS ya maneja el tamaño si usas la variable, 
        // pero vamos a setear la variable single que definimos en CSS.
        // Hacemos que sea igual al font-size seleccionado para dar control total al usuario.
        document.documentElement.style.setProperty('--lyric-font-size-single', this.settings.fontSize + 'px');
    }

    getTranslation(key) {
        const lang = this.settings.language || 'es';
        if (typeof translations !== 'undefined') {
            if (translations[lang] && translations[lang][key]) return translations[lang][key];
            if (translations['en'] && translations['en'][key]) return translations['en'][key];
        }
        return key;
    }

    updateInterfaceLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = this.getTranslation(key);
        });
    }

    toggleSettings() {
        document.getElementById('settings-panel').classList.toggle('active');
    }

    startUpdating() {
        this.updateNowPlaying();
        this.updateInterval = setInterval(() => this.updateNowPlaying(), CONFIG.UPDATE_INTERVAL);
    }

    stopUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.lyricsApp = new SpotifyLyricsApp();
});
