
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('swf-upload');
  const fileNameDisplay = document.getElementById('file-name');
  const playerContainer = document.getElementById('player');
  const playerWrapper = document.getElementById('player-container');
  const fullscreenButton = document.getElementById('fullscreen-button');
  const historyContainer = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');

  let ruffle = null;
  let player = null;
  let originalAspectRatio = 4/3; // Default aspect ratio
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
        
        // Calculate the dimensions that preserve aspect ratio and fill the screen height
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;
        
        // Calculate dimensions to maintain aspect ratio and fill height
        let playerHeight = screenHeight;
        let playerWidth = playerHeight * originalAspectRatio;
        
        // If the calculated width is greater than the screen width, recalculate based on width
        if (playerWidth > screenWidth) {
          playerWidth = screenWidth;
          playerHeight = playerWidth / originalAspectRatio;
        }
        
        rufflePlayer.style.width = playerWidth + 'px';
        rufflePlayer.style.height = playerHeight + 'px';
        rufflePlayer.style.position = 'absolute';
        rufflePlayer.style.top = '50%';
        rufflePlayer.style.left = '50%';
        rufflePlayer.style.transform = 'translate(-50%, -50%)';

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
        // Reset styles
        rufflePlayer.style.width = '';
        rufflePlayer.style.height = '';
        rufflePlayer.style.position = '';
        rufflePlayer.style.top = '';
        rufflePlayer.style.left = '';
        rufflePlayer.style.transform = '';

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
          scale: "showall",
          salign: "middle",
          quality: "high",
          letterbox: "on",
          backgroundColor: "#000000"
        });

        // Add event listener to the created Ruffle player for better fullscreen handling
        player.addEventListener('load', () => {
          const rufflePlayer = player.querySelector('ruffle-player');
          if (rufflePlayer) {
            // Store the original aspect ratio of the SWF
            if (rufflePlayer.offsetWidth && rufflePlayer.offsetHeight) {
              originalAspectRatio = rufflePlayer.offsetWidth / rufflePlayer.offsetHeight;
            }
            
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
    // Check if file already exists in history
    const existingIndex = fileHistory.indexOf(fileName);
    if (existingIndex !== -1) {
      // Remove the existing entry
      fileHistory.splice(existingIndex, 1);
    }
    
    // Add to beginning of array (most recent first)
    fileHistory.unshift(fileName);
    
    // Limit history to 10 items
    if (fileHistory.length > 10) {
      fileHistory = fileHistory.slice(0, 10);
    }
    
    localStorage.setItem('flashantress_history', JSON.stringify(fileHistory));
    updateHistory();
  }

  function updateHistory() {
    if (fileHistory.length === 0) {
      historyContainer.style.display = 'none';
      return;
    }
    
    historyContainer.style.display = 'block';
    historyList.innerHTML = ''; // Clear existing history
    
    fileHistory.forEach(fileName => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      const fileNameElement = document.createElement('div');
      fileNameElement.className = 'history-filename';
      fileNameElement.textContent = fileName;
      
      const loadButton = document.createElement('button');
      loadButton.className = 'history-load-button';
      loadButton.textContent = 'Load';
      loadButton.addEventListener('click', () => {
        // Here you would load the file from history
        // This would require storing the actual file data or URL
        alert('Loading from history not implemented yet.');
      });
      
      const removeButton = document.createElement('button');
      removeButton.className = 'history-remove-button';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        const index = fileHistory.indexOf(fileName);
        if (index !== -1) {
          fileHistory.splice(index, 1);
          localStorage.setItem('flashantress_history', JSON.stringify(fileHistory));
          updateHistory();
        }
      });
      
      historyItem.appendChild(fileNameElement);
      historyItem.appendChild(loadButton);
      historyItem.appendChild(removeButton);
      
      historyList.appendChild(historyItem);
    });
  }
});
