// ===== SPOTIFY LYRICS SYNC APP =====
// Aplicación para mostrar letras sincronizadas de Spotify en tiempo real

class SpotifyLyricsApp {
    constructor() {
        this.accessToken = null;
        this.currentTrack = null;
        this.currentLyrics = null;
        this.syncedLyrics = [];
        this.updateInterval = null;
        this.lastUpdateTime = 0;

        // Configuración
        this.settings = {
            transparentBg: true,
            showSongInfo: true,
            fontSize: 28,
            visibleLines: 7
        };

        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.checkAuth();
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

        // Toggle mode
        document.getElementById('toggle-mode').addEventListener('click', () => {
            this.settings.showSongInfo = !this.settings.showSongInfo;
            document.getElementById('show-song-info').checked = this.settings.showSongInfo;
            this.applySettings();
        });
    }

    checkAuth() {
        // Verificar si hay un token en la URL (después de redirect)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');

        if (token) {
            this.accessToken = token;
            localStorage.setItem('spotify_access_token', token);

            // Limpiar URL
            window.history.replaceState({}, document.title, window.location.pathname);

            this.showLyricsScreen();
            this.startUpdating();
        } else {
            // Verificar si hay un token guardado
            const savedToken = localStorage.getItem('spotify_access_token');
            if (savedToken) {
                this.accessToken = savedToken;
                this.showLyricsScreen();
                this.startUpdating();
            }
        }
    }

    login() {
        const authUrl = `${CONFIG.AUTH_ENDPOINT}?client_id=${CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(CONFIG.REDIRECT_URI)}&scope=${encodeURIComponent(CONFIG.SCOPES)}&response_type=token&show_dialog=true`;
        window.location.href = authUrl;
    }

    logout() {
        this.accessToken = null;
        localStorage.removeItem('spotify_access_token');
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
                // Token expirado
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
        const track = await this.getCurrentTrack();

        if (!track) {
            this.displayNoTrack();
            return;
        }

        // Actualizar progreso
        this.updateProgress(track.progress, track.duration);

        // Si es una nueva canción, actualizar todo
        if (!this.currentTrack || this.currentTrack.id !== track.id) {
            this.currentTrack = track;
            await this.updateTrackInfo(track);
            await this.loadAndDisplayLyrics(track);
        } else {
            // Solo actualizar la línea actual de las letras
            if (this.syncedLyrics.length > 0) {
                this.updateActiveLyric(track.progress);
            }
        }
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
        lyricsContainer.innerHTML = '<p class="loading-message">Buscando letras...</p>';

        const lyrics = await this.fetchLyrics(track.name, track.artist, track.duration);

        if (!lyrics) {
            this.displayNoLyrics();
            return;
        }

        this.currentLyrics = lyrics;

        if (lyrics.synced) {
            this.syncedLyrics = this.parseSyncedLyrics(lyrics.lyrics);
            this.displaySyncedLyrics();
        } else {
            this.syncedLyrics = [];
            this.displayPlainLyrics(lyrics.plain);
        }
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
                <h3>😔 Letras no disponibles</h3>
                <p>No se encontraron letras para esta canción.</p>
            </div>
        `;
    }

    displayNoTrack() {
        document.getElementById('track-name').textContent = 'No hay reproducción';
        document.getElementById('artist-name').textContent = 'Reproduce algo en Spotify';
        document.getElementById('album-image').src = '';

        const lyricsContainer = document.getElementById('lyrics-content');
        lyricsContainer.innerHTML = '<p class="loading-message">Esperando reproducción...</p>';
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

    // ===== SETTINGS =====
    loadSettings() {
        const saved = localStorage.getItem('lyrics_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }

        // Aplicar a los controles
        document.getElementById('transparent-bg').checked = this.settings.transparentBg;
        document.getElementById('show-song-info').checked = this.settings.showSongInfo;
        document.getElementById('font-size').value = this.settings.fontSize;
        document.getElementById('font-size-value').textContent = this.settings.fontSize + 'px';
        document.getElementById('visible-lines').value = this.settings.visibleLines;
        document.getElementById('visible-lines-value').textContent = this.settings.visibleLines;
    }

    applySettings() {
        // Guardar
        localStorage.setItem('lyrics_settings', JSON.stringify(this.settings));

        // Aplicar fondo transparente
        if (this.settings.transparentBg) {
            document.body.classList.add('transparent');
            document.getElementById('lyrics-screen').classList.add('transparent');
        } else {
            document.body.classList.remove('transparent');
            document.getElementById('lyrics-screen').classList.remove('transparent');
        }

        // Mostrar/ocultar info de canción
        const songInfo = document.querySelector('.song-info');
        if (this.settings.showSongInfo) {
            songInfo.classList.remove('hidden');
        } else {
            songInfo.classList.add('hidden');
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

    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        panel.classList.toggle('active');
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
