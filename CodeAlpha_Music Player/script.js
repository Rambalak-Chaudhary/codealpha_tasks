class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.songs = [
            {
                title: "Song 1",
                artist: "Artist 1",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                albumArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"
            },
            {
                title: "Song 2",
                artist: "Artist 2",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                albumArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop"
            },
            {
                title: "Song 3",
                artist: "Artist 3",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                albumArt: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=300&h=300&fit=crop"
            },
            {
                title: "Song 4",
                artist: "Artist 4",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
                albumArt: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop"
            }
        ];
        
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isPlaylistVisible = true;
        this.autoplay = false;
        
        // DOM Elements
        this.audioElement = this.audio;
        this.playBtn = document.getElementById('play-btn');
        this.playIcon = document.getElementById('play-icon');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.songTitle = document.getElementById('song-title');
        this.artistName = document.getElementById('artist-name');
        this.albumArt = document.getElementById('album-art');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.progressBar = document.getElementById('progress-bar');
        this.progress = document.getElementById('progress');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeIcon = document.getElementById('volume-icon');
        this.playlist = document.getElementById('playlist');
        this.playlistToggle = document.getElementById('playlist-toggle');
        this.autoplayToggle = document.getElementById('autoplay-toggle');
        
        this.init();
    }
    
    init() {
        // Load first song
        this.loadSong(this.currentSongIndex);
        
        // Event Listeners
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        
        this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
        this.audioElement.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioElement.addEventListener('ended', () => this.handleSongEnd());
        
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e));
        this.volumeSlider.addEventListener('change', (e) => this.setVolume(e));
        
        this.playlistToggle.addEventListener('click', () => this.togglePlaylist());
        
        // Playlist items
        document.querySelectorAll('.playlist-item').forEach((item, index) => {
            item.addEventListener('click', () => this.playSongFromPlaylist(index));
        });
        
        // Autoplay toggle
        this.autoplayToggle.addEventListener('change', (e) => {
            this.autoplay = e.target.checked;
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Set initial volume
        this.setVolume({ target: { value: 0.7 } });
    }
    
    loadSong(index) {
        const song = this.songs[index];
        this.audioElement.src = song.src;
        this.songTitle.textContent = song.title;
        this.artistName.textContent = song.artist;
        this.albumArt.src = song.albumArt;
        this.albumArt.alt = `${song.title} Album Art`;
        
        // Update active playlist item
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.playlist-item[data-index="${index}"]`).classList.add('active');
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pauseSong();
        } else {
            this.playSong();
        }
    }
    
    playSong() {
        this.audioElement.play();
        this.isPlaying = true;
        this.playIcon.classList.remove('fa-play');
        this.playIcon.classList.add('fa-pause');
    }
    
    pauseSong() {
        this.audioElement.pause();
        this.isPlaying = false;
        this.playIcon.classList.remove('fa-pause');
        this.playIcon.classList.add('fa-play');
    }
    
    prevSong() {
        this.currentSongIndex--;
        if (this.currentSongIndex < 0) {
            this.currentSongIndex = this.songs.length - 1;
        }
        this.loadSong(this.currentSongIndex);
        if (this.isPlaying) {
            this.playSong();
        }
    }
    
    nextSong() {
        this.currentSongIndex++;
        if (this.currentSongIndex >= this.songs.length) {
            this.currentSongIndex = 0;
        }
        this.loadSong(this.currentSongIndex);
        if (this.isPlaying) {
            this.playSong();
        }
    }
    
    updateProgress() {
        if (this.audioElement.duration) {
            const progressPercent = (this.audioElement.currentTime / this.audioElement.duration) * 100;
            this.progress.style.width = `${progressPercent}%`;
            
            // Update current time
            const minutes = Math.floor(this.audioElement.currentTime / 60);
            const seconds = Math.floor(this.audioElement.currentTime % 60);
            this.currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateDuration() {
        const minutes = Math.floor(this.audioElement.duration / 60);
        const seconds = Math.floor(this.audioElement.duration % 60);
        this.durationEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    seek(e) {
        const width = this.progressBar.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audioElement.duration;
        
        this.audioElement.currentTime = (clickX / width) * duration;
    }
    
    setVolume(e) {
        const volume = e.target.value;
        this.audioElement.volume = volume;
        
        // Update volume icon
        if (volume == 0) {
            this.volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            this.volumeIcon.className = 'fas fa-volume-down';
        } else {
            this.volumeIcon.className = 'fas fa-volume-up';
        }
    }
    
    handleSongEnd() {
        if (this.autoplay) {
            this.nextSong();
        } else {
            this.pauseSong();
            this.progress.style.width = '0%';
            this.currentTimeEl.textContent = '0:00';
        }
    }
    
    playSongFromPlaylist(index) {
        this.currentSongIndex = index;
        this.loadSong(index);
        this.playSong();
    }
    
    togglePlaylist() {
        this.isPlaylistVisible = !this.isPlaylistVisible;
        this.playlist.classList.toggle('collapsed');
        this.playlistToggle.style.transform = this.isPlaylistVisible ? 'rotate(0deg)' : 'rotate(180deg)';
    }
    
    handleKeyboard(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                this.prevSong();
                break;
            case 'ArrowRight':
                this.nextSong();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.volumeSlider.value = Math.min(1, parseFloat(this.volumeSlider.value) + 0.1);
                this.setVolume({ target: { value: this.volumeSlider.value } });
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.volumeSlider.value = Math.max(0, parseFloat(this.volumeSlider.value) - 0.1);
                this.setVolume({ target: { value: this.volumeSlider.value } });
                break;
        }
    }
}

// Initialize the music player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});