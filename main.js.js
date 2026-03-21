// Crear contenedores para cada temporada
function createSeasonContainers() {
  seasonsContainer.innerHTML = "";
  const seasonNumbers = Object.keys(seasonsData).sort((a, b) => Number(a) - Number(b));
  
  seasonNumbers.forEach(seasonNum => {
    const ul = document.createElement("ul");
    ul.className = "temps";
    ul.id = `season${seasonNum}List`;
    if (seasonNum != currentSeason) {
      ul.classList.add("hide");
    }
    seasonsContainer.appendChild(ul);
  });
}

// Mostrar modal de sinopsis
function showSynopsis(episode) {
  synopsisTitle.textContent = episode.title;
  synopsisTag.textContent = `T${currentSeason} - ${episode.episode}`;
  synopsisText.textContent = episode.synopsis;
  synopsisModal.classList.add("show");
}

// Renderizar episodios
function renderEpisodes() {
  const seasonData = seasonsData[currentSeason];
  if (!seasonData) return;
  
  const targetList = document.getElementById(`season${currentSeason}List`);
  if (!targetList) return;
  
  targetList.innerHTML = "";
  
  seasonData.episodes.forEach((ep, index) => {
    const li = document.createElement("li");
    const storeId = `Yo soy Groot-${currentSeason}-${index + 1}`;
    const savedState = localStorage.getItem(storeId);
    
