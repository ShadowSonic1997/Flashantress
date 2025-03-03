
# Flashantress

A web-based Flash (SWF) game emulator that uses Ruffle to play Flash games in modern browsers.

<a href="https://imgbb.com/"><img src="https://i.ibb.co/kshcLYw3/Ruffle-vector-logo.png" alt="Ruffle-vector-logo" border="0"></a>

## Features

- Upload and play SWF files directly in the browser
- Fullscreen mode
- Simple and intuitive UI
- No Flash Player required (uses Ruffle emulator)

## Prerequisites

- Node.js (version 14 or higher)
- A modern web browser

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/flash-game-player.git
   cd flash-game-player
   ```

2. No additional dependencies need to be installed as the project uses CDN-hosted Ruffle.

## Running the Project in VS Code

1. Open the project folder in VS Code

2. Navigate to project folder:
   ```bash
   cd Flashantress
   ```
   
4. Start the server by opening a terminal in VS Code (Terminal > New Terminal) and running:
   ```bash
   node server.js
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## How to Use

1. Click the "Choose SWF File" button to select a Flash game file (.swf)
2. Once uploaded, the game will automatically start playing in the player window
3. Use the "Fullscreen" button in the bottom-right corner of the player to toggle fullscreen mode

## Project Structure

- `index.html` - Main HTML file
- `style.css` - Stylesheet for the application
- `script.js` - JavaScript for handling file uploads and Ruffle integration
- `server.js` - Simple Node.js server to host the application

## Troubleshooting

- **Game doesn't load**: Some complex SWF files might not be fully compatible with Ruffle. Try with simpler Flash games.
- **Controls not working**: Keyboard controls might vary depending on the game. Click inside the game area to ensure it has focus.
- **Performance issues**: Try closing other browser tabs or applications to free up resources.

## Credits

- [Ruffle](https://ruffle.rs/) - Flash Player emulator in WebAssembly

## License

This project is licensed under the MIT License - see the LICENSE file for details.
