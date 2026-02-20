    // Obtener progreso guardado
    const watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
    const savedTime = watchedEpisodes[episode.video_url]?.time || 0;
    const watched = watchedEpisodes[episode.video_url]?.watched || false;

    if (watched) {
        progressBar.style.width = '100%';
    } else {
        progressBar.style.width = `${(savedTime / durationInSeconds) * 100}%`;
    }

    player.currentTime(savedTime);
    
    // Actualizar el título
    updateTitle(episode);
    
    // Reproducir automáticamente
    player.ready(function() {
        const playPromise = player.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Reproducción automática exitosa');
            }).catch(error => {
                console.log('Error en reproducción automática:', error);
                showEpisodeTitle();
            });
        }
    });
    
    currentEpisodeIndex = episodeIndex;

    // Remover listener anterior para evitar duplicados
    player.off('timeupdate');
    
    // Actualizar progreso
    player.on('timeupdate', function onTimeUpdate() {
        const currentTime = player.currentTime();
        const progressPercentage = (currentTime / durationInSeconds) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        const watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
        watchedEpisodes[episode.video_url] = {
            time: currentTime,
            watched: false
        };
        localStorage.setItem('watchedEpisodes', JSON.stringify(watchedEpisodes));
    });

    // Marcar como visto al finalizar
    player.one('ended', function onEnded() {
        const watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
        watchedEpisodes[episode.video_url] = {
            time: durationInSeconds,
            watched: true
        };
        localStorage.setItem('watchedEpisodes', JSON.stringify(watchedEpisodes));
        progressBar.style.width = '100%';
        episodeItem.classList.add('watched');
    });
}

// Función para renderizar episodios
function renderEpisodes(season) {
    episodeList.innerHTML = '';

    const watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};

    season.episodes.forEach((episode, index) => {
        const episodeItem = document.createElement('div');
        episodeItem.className = 'episode-item';
        
        const durationStr = episode.duration.replace('m', '');
        const durationInSeconds = parseInt(durationStr) * 60;

        if (watchedEpisodes[episode.video_url]?.watched) {
            episodeItem.classList.add('watched');
        }

        episodeItem.innerHTML = `
            <div class="episode-bg" style="background-image: url('${episode.image}')"></div>
            <div class="episode-content">
                <div class="episode-header">
                    <div class="episode-number">${episode.number}</div>
                    <div class="episode-duration">
                        <i class="fas fa-clock"></i> ${episode.duration}
                    </div>
                </div>
                <div class="episode-info">
                    <h3 class="episode-title">${episode.title}</h3>
                </div>
                <div class="episode-footer">
                    <div class="episode-rating">
                        <i class="fas fa-star"></i> ${episode.rating}
                    </div>
                    <button class="play-episode">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${((watchedEpisodes[episode.video_url]?.time || 0) / durationInSeconds) * 100}%"></div>
            </div>
        `;

        const playBtn = episodeItem.querySelector('.play-episode');
        const progressBar = episodeItem.querySelector('.progress-bar');

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playEpisode(episode, episodeItem, progressBar, durationInSeconds, index);
        });

        episodeItem.addEventListener('click', () => {
            playEpisode(episode, episodeItem, progressBar, durationInSeconds, index);
        });

        episodeList.appendChild(episodeItem);
    });
}

// Configurar controles personalizados del reproductor
function setupCustomControls() {
    const customControls = document.createElement('div');
    customControls.classList.add('vjs-custom-controls');

    // Botón de regreso
    const backBtn = document.createElement('button');
    backBtn.classList.add('vjs-back-button');
    backBtn.innerHTML = '<span class="material-icons">arrow_back</span>';
    backBtn.addEventListener('click', closePlayer);
    player.el().appendChild(backBtn);

    // Botón de ajuste de pantalla
    const screenAdjustButton = document.createElement('button');
    screenAdjustButton.classList.add('vjs-screen-adjust-button');
    screenAdjustButton.innerHTML = '<span class="material-icons">aspect_ratio</span>';
    
    let currentAdjustmentIndex = 0;
    const adjustments = ['contain', 'cover', 'fill', 'scale-down'];
    
    screenAdjustButton.addEventListener('click', () => {
        currentAdjustmentIndex = (currentAdjustmentIndex + 1) % adjustments.length;
        const selectedAdjustment = adjustments[currentAdjustmentIndex];
        const videoElement = player.el().querySelector('video');
        
        videoElement.style.objectFit = selectedAdjustment;
        
        const labelDiv = document.createElement('div');
        labelDiv.classList.add('vjs-adjustment-label');
        let displayText = '';
        switch(selectedAdjustment) {
            case 'contain': displayText = 'Ajustar (Contener)'; break;
            case 'cover': displayText = 'Expandir (Cubrir)'; break;
            case 'fill': displayText = 'Estirar (Llenar)'; break;
            case 'scale-down': displayText = 'Reducir'; break;
            default: displayText = selectedAdjustment;
        }
        labelDiv.textContent = displayText;
        player.el().appendChild(labelDiv);
        
        setTimeout(() => {
            if (labelDiv && labelDiv.parentNode) {
                labelDiv.remove();
            }
        }, 1200);
    });
    player.el().appendChild(screenAdjustButton);

    // Controles principales en el centro
    const mainControls = document.createElement('div');
    mainControls.classList.add('vjs-main-controls');

    const seekBackButton = document.createElement('button');
    seekBackButton.classList.add('vjs-custom-button');
    seekBackButton.innerHTML = '<span class="material-icons">replay_10</span>';
    seekBackButton.addEventListener('click', () => {
        player.currentTime(player.currentTime() - 10);
    });

    const playPauseButton = document.createElement('button');
    playPauseButton.classList.add('vjs-custom-button');
    playPauseButton.innerHTML = '<span class="material-icons">pause</span>';
    playPauseButton.addEventListener('click', () => {
        if (player.paused()) {
            player.play();
            playPauseButton.innerHTML = '<span class="material-icons">pause</span>';
        } else {
            player.pause();
            playPauseButton.innerHTML = '<span class="material-icons">play_arrow</span>';
        }
    });

    const seekForwardButton = document.createElement('button');
    seekForwardButton.classList.add('vjs-custom-button');
    seekForwardButton.innerHTML = '<span class="material-icons">forward_10</span>';
    seekForwardButton.addEventListener('click', () => {
        player.currentTime(player.currentTime() + 10);
    });

    mainControls.appendChild(seekBackButton);
    mainControls.appendChild(playPauseButton);
    mainControls.appendChild(seekForwardButton);
    customControls.appendChild(mainControls);

    // Controles de navegación inferiores
    const navControls = document.createElement('div');
    navControls.classList.add('vjs-nav-controls');

    const prevButton = document.createElement('button');
    prevButton.classList.add('vjs-custom-button');
    prevButton.innerHTML = '<span class="material-icons">skip_previous</span> Anterior';
    prevButton.addEventListener('click', goToPreviousEpisode);

    const restartButton = document.createElement('button');
    restartButton.classList.add('vjs-custom-button');
    restartButton.innerHTML = '<span class="material-icons">replay</span> Reiniciar';
    restartButton.addEventListener('click', () => {
        player.currentTime(0);
        player.play();
    });

    const nextButton = document.createElement('button');
    nextButton.classList.add('vjs-custom-button');
    nextButton.innerHTML = 'Siguiente <span class="material-icons">skip_next</span>';
    nextButton.addEventListener('click', goToNextEpisode);

    navControls.appendChild(prevButton);
    navControls.appendChild(restartButton);
    navControls.appendChild(nextButton);
    customControls.appendChild(navControls);

    player.el().appendChild(customControls);

    // Botón de siguiente episodio automático
    const nextEpisodeButton = document.createElement('button');
    nextEpisodeButton.classList.add('vjs-next-episode');
    nextEpisodeButton.style.display = 'none';
    
    function startCountdown() {
        nextEpisodeButton.style.display = 'block';
        countdownTime = 20;
        updateCountdownDisplay();
        isCountdownActive = true;

        countdownTimer = setInterval(() => {
            countdownTime--;
            updateCountdownDisplay();

            if (countdownTime <= 0) {
                clearInterval(countdownTimer);
                isCountdownActive = false;
                nextEpisodeButton.style.display = 'none';
                goToNextEpisode();
            }
        }, 1000);
    }

    function updateCountdownDisplay() {
        nextEpisodeButton.textContent = `Siguiente episodio (${countdownTime}s)`;
    }

    nextEpisodeButton.addEventListener('click', () => {
        if (isCountdownActive) {
            clearInterval(countdownTimer);
        }
        goToNextEpisode();
        nextEpisodeButton.style.display = 'none';
    });

    player.el().appendChild(nextEpisodeButton);

    player.on('timeupdate', () => {
        const totalDuration = player.duration();
        const currentTime = player.currentTime();
        const timeBeforeEnd = 60;

        if (totalDuration - currentTime <= timeBeforeEnd && !isCountdownActive) {
            startCountdown();
        }
    });

    player.on('loadeddata', () => {
        nextEpisodeButton.style.display = 'none';
        isCountdownActive = false;
        clearInterval(countdownTimer);
    });
