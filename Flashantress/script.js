
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('swf-upload');
  const fileNameDisplay = document.getElementById('file-name');
  const playerContainer = document.getElementById('player');
  const playerWrapper = document.getElementById('player-container');
  const fullscreenButton = document.getElementById('fullscreen-button');
  let ruffle = null;
  let player = null;
  let originalAspectRatio = 4/3; // Default aspect ratio
  
  // Function to load SWF content into the player
  function loadSWFContent(fileData, fileName = 'Loaded File') {
    // Clear previous player instance if it exists
    if (player) {
      playerContainer.removeChild(player);
      player = null;
    }

    // Create a new Ruffle player instance
    player = ruffle.createPlayer();
    playerContainer.appendChild(player);
    
    // Update file name display
    fileNameDisplay.textContent = fileName;
    
    // Load the SWF data into the player with configuration
    player.load({
      data: new Uint8Array(fileData),
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
          console.log("Detected aspect ratio:", originalAspectRatio);
        }
        
        // Ensure player can resize properly
        rufflePlayer.style.maxWidth = '100%';
        rufflePlayer.style.maxHeight = '100%';
      }
    });
  }

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
        
        // Apply the calculated dimensions
        rufflePlayer.style.width = playerWidth + 'px';
        rufflePlayer.style.height = playerHeight + 'px';
        
        // Position the player to be centered initially
        rufflePlayer.style.position = 'absolute';
        rufflePlayer.style.top = '50%';
        rufflePlayer.style.left = '50%';
        rufflePlayer.style.transform = 'translate(-50%, -50%)';
        
        // Add a background color to the container to ensure any letterboxing is black
        playerWrapper.style.backgroundColor = '#000';

        // Some SWF files may need config adjustment in fullscreen
        if (rufflePlayer.instance && rufflePlayer.instance.set_fullscreen) {
          rufflePlayer.instance.set_fullscreen(true);
        }
        
        // Add resizable handles
        rufflePlayer.style.resize = 'both';
        rufflePlayer.style.overflow = 'hidden';
        
        // Add custom handle for better visibility
        const resizeHandle = document.createElement('div');
        resizeHandle.id = 'resize-handle';
        rufflePlayer.appendChild(resizeHandle);
        
        // Make the player draggable in fullscreen
        enableDragging(rufflePlayer);
        
        // Log dimensions for debugging
        console.log("Fullscreen dimensions - Screen:", screenWidth, "x", screenHeight);
        console.log("Player dimensions:", playerWidth, "x", playerHeight);
        console.log("Aspect ratio:", originalAspectRatio);
      }
    } else {
      fullscreenButton.textContent = 'Fullscreen';

      // Reset player size when exiting fullscreen
      if (player && player.querySelector('ruffle-player')) {
        const rufflePlayer = player.querySelector('ruffle-player');
        
        // Remove resize handle if it exists
        const resizeHandle = rufflePlayer.querySelector('#resize-handle');
        if (resizeHandle) {
          rufflePlayer.removeChild(resizeHandle);
        }
        
        // Disable resizing and dragging
        rufflePlayer.style.resize = '';
        rufflePlayer.style.overflow = '';
        
        // Remove event listeners for dragging
        disableDragging(rufflePlayer);
        
        // Reset styles
        rufflePlayer.style.width = '';
        rufflePlayer.style.height = '';
        rufflePlayer.style.position = '';
        rufflePlayer.style.top = '';
        rufflePlayer.style.left = '';
        rufflePlayer.style.transform = '';
        
        // Reset background color
        playerWrapper.style.backgroundColor = '';

        // If the Ruffle instance has fullscreen control
        if (rufflePlayer.instance && rufflePlayer.instance.set_fullscreen) {
          rufflePlayer.instance.set_fullscreen(false);
        }
      }
    }
  }
  
  // Function to make an element draggable
  function enableDragging(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      
      // Only proceed if not clicking on the resize handle
      if (e.target.id === 'resize-handle') {
        return;
      }
      
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      
      // Calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      // Set the element's new position
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      
      // Remove the transform as we're now using absolute positioning
      element.style.transform = 'none';
    }
    
    function closeDragElement() {
      // Stop moving when mouse button is released
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
  
  function disableDragging(element) {
    element.onmousedown = null;
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
        loadSWFContent(e.target.result, file.name);
      } catch (error) {
        console.error("Error loading SWF:", error);
        alert("Error loading SWF file. Check console for details.");
      }
    };
    reader.readAsArrayBuffer(file);
  });

});
