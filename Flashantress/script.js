document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('swf-upload');
  const fileNameDisplay = document.getElementById('file-name');
  const playerContainer = document.getElementById('player');
  const playerWrapper = document.getElementById('player-container');
  const fullscreenButton = document.getElementById('fullscreen-button');
  const historyContainer = document.getElementById('history-list');

  let ruffle = null;
  let player = null;
  let fileHistory = JSON.parse(localStorage.getItem('flashantress_history') || '[]');

  // Update history display on page load
  updateHistory();

  // Initialize Ruffle when the page loads
  window.RufflePlayer = window.RufflePlayer || {};
  window.addEventListener('load', (event) => {
    ruffle = window.RufflePlayer.newest();
  });

  // Handle fullscreen functionality
  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      // If not in fullscreen mode, enter fullscreen
      if (playerWrapper.requestFullscreen) {
        playerWrapper.requestFullscreen();
      } else if (playerWrapper.webkitRequestFullscreen) { /* Safari */
        playerWrapper.webkitRequestFullscreen();
      } else if (playerWrapper.msRequestFullscreen) { /* IE11 */
        playerWrapper.msRequestFullscreen();
      }
    } else {
      // If already in fullscreen mode, exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
      }
    }
  });

  // Update button text and player size when fullscreen changes
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  function handleFullscreenChange() {
    if (document.fullscreenElement) {
      fullscreenButton.textContent = 'Exit Fullscreen';

      // Resize the player when entering fullscreen
      if (player && player.querySelector('ruffle-player')) {
        const rufflePlayer = player.querySelector('ruffle-player');
        rufflePlayer.style.width = '100%';
        rufflePlayer.style.height = '100%';
        rufflePlayer.style.position = 'absolute';
        rufflePlayer.style.top = '0';
        rufflePlayer.style.left = '0';

        // Some SWF files may need config adjustment in fullscreen
        if (rufflePlayer.instance && rufflePlayer.instance.set_fullscreen) {
          rufflePlayer.instance.set_fullscreen(true);
        }
      }
    } else {
      fullscreenButton.textContent = 'Fullscreen';

      // Reset player size when exiting fullscreen
      if (player && player.querySelector('ruffle-player')) {
        const rufflePlayer = player.querySelector('ruffle-player');
        // Allow the player to return to its normal dimensions
        rufflePlayer.style.position = '';

        // If the Ruffle instance has fullscreen control
        if (rufflePlayer.instance && rufflePlayer.instance.set_fullscreen) {
          rufflePlayer.instance.set_fullscreen(false);
        }
      }
    }
  }

  // Handle file upload
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Display the file name
    fileNameDisplay.textContent = file.name;

    // Clear previous player instance if it exists
    if (player) {
      playerContainer.removeChild(player);
      player = null;
    }

    // Create a new Ruffle player instance
    player = ruffle.createPlayer();
    playerContainer.appendChild(player);

    // Read the SWF file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Load the SWF data into the player with configuration
        player.load({
          data: new Uint8Array(e.target.result),
          allowFullscreen: true,
          scale: "showAll",
          salign: "middle",
          quality: "high",
          backgroundColor: "#000000"
        });

        // Add event listener to the created Ruffle player for better fullscreen handling
        player.addEventListener('load', () => {
          const rufflePlayer = player.querySelector('ruffle-player');
          if (rufflePlayer) {
            // Ensure player can resize properly
            rufflePlayer.style.maxWidth = '100%';
            rufflePlayer.style.maxHeight = '100%';
          }
        });
      } catch (error) {
        console.error("Error loading SWF:", error);
        alert("Error loading SWF file. Check console for details.");
      }
    };
    reader.readAsArrayBuffer(file);

    // Add file to history
    addFileToHistory(file.name);
  });

  function addFileToHistory(fileName) {
    fileHistory.push(fileName);
    localStorage.setItem('flashantress_history', JSON.stringify(fileHistory));
    updateHistory();
  }

  function updateHistory() {
    historyContainer.innerHTML = ''; // Clear existing history
    fileHistory.forEach(file => {
      const listItem = document.createElement('li');
      listItem.textContent = file;
      historyContainer.appendChild(listItem);
    });
  }
});
