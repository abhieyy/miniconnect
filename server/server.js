const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 60000
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../mobile')));

// Global state
let musicState = {
  isPlaying: false,
  title: 'No song playing',
  artist: 'Unknown artist',
  volume: 50,
  progress: 0,
  duration: 0
};

// Store playlists globally
let globalPlaylists = [];

let connectedClients = {
  extension: null,
  controllers: new Set()
};

// Command queue for extension
let commandQueue = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../mobile/index.html'));
});

app.get('/api/state', (req, res) => {
  res.json(musicState);
});

// HTTP endpoints for extension polling
app.post('/api/register', (req, res) => {
  const clientType = req.body?.clientType;
  if (clientType === 'extension') {
    connectedClients.extension = 'http-polling';
    console.log(`[${new Date().toISOString()}] Extension registered via HTTP polling`);
  }
  res.json({ success: true });
});

app.get('/api/commands', (req, res) => {
  // Return first command in queue, or empty
  const command = commandQueue.shift() || null;
  res.json(command ? { command: command.cmd, value: command.value } : {});
});

app.post('/api/state', (req, res) => {
  const newState = req.body;
  if (newState) {
    // Check if this is a playlist update
    if (newState.playlists && Array.isArray(newState.playlists)) {
      console.log(`[${new Date().toISOString()}] Playlists received from extension (${newState.playlists.length} items)`);
      newState.playlists.forEach((p, i) => {
        console.log(`  [${i}] ${p.name}`);
      });
      
      // Store playlists globally
      globalPlaylists = newState.playlists;
      
      // Broadcast playlists to all controllers
      connectedClients.controllers.forEach(controllerId => {
        io.to(controllerId).emit('playlists', newState.playlists);
      });
      res.json({ success: true, type: 'playlists' });
      return;
    }
    
    // Otherwise, update music state normally
    musicState = { ...musicState, ...newState };
    
    // Broadcast to all Socket.IO controllers
    connectedClients.controllers.forEach(controllerId => {
      io.to(controllerId).emit('state-update', musicState);
    });
    
    console.log(`[${new Date().toISOString()}] State updated via HTTP:`);
    console.log('  Title:', musicState.title);
    console.log('  Artist:', musicState.artist);
    console.log('  Playing:', musicState.isPlaying);
    console.log('  Volume:', musicState.volume);
    console.log('  Controllers notified:', connectedClients.controllers.size);
  }
  res.json({ success: true });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] New connection: ${socket.id}`);

  // Register clients
  socket.on('register', (clientType) => {
    if (clientType === 'extension') {
      connectedClients.extension = socket.id;
      console.log(`[${new Date().toISOString()}] Extension registered: ${socket.id}`);
      socket.emit('current-state', musicState);
    } else if (clientType === 'controller') {
      connectedClients.controllers.add(socket.id);
      console.log(`[${new Date().toISOString()}] Controller registered: ${socket.id}`);
      socket.emit('state-update', musicState);
    }
  });

  // Play/Pause command from controller
  socket.on('play-pause', () => {
    console.log(`[${new Date().toISOString()}] Play/Pause command from ${socket.id}`);
    if (connectedClients.extension) {
      if (connectedClients.extension === 'http-polling') {
        commandQueue.push({ cmd: 'play-pause' });
      } else {
        io.to(connectedClients.extension).emit('play-pause');
      }
    }
  });

  // Next track command
  socket.on('next', () => {
    console.log(`[${new Date().toISOString()}] Next command from ${socket.id}`);
    if (connectedClients.extension) {
      if (connectedClients.extension === 'http-polling') {
        commandQueue.push({ cmd: 'next' });
      } else {
        io.to(connectedClients.extension).emit('next');
      }
    }
  });

  // Previous track command
  socket.on('prev', () => {
    console.log(`[${new Date().toISOString()}] Previous command from ${socket.id}`);
    if (connectedClients.extension) {
      if (connectedClients.extension === 'http-polling') {
        commandQueue.push({ cmd: 'prev' });
      } else {
        io.to(connectedClients.extension).emit('prev');
      }
    }
  });

  // Volume command
  socket.on('volume', (value) => {
    console.log(`[${new Date().toISOString()}] Volume ${value} from ${socket.id}`);
    musicState.volume = value;
    if (connectedClients.extension) {
      if (connectedClients.extension === 'http-polling') {
        commandQueue.push({ cmd: 'volume', value: value });
      } else {
        io.to(connectedClients.extension).emit('volume', value);
      }
    }
    // Broadcast to all controllers
    connectedClients.controllers.forEach(controllerId => {
      io.to(controllerId).emit('state-update', musicState);
    });
  });

  // Shuffle command
  socket.on('shuffle', () => {
    console.log(`[${new Date().toISOString()}] Shuffle toggle from ${socket.id}`);
    if (connectedClients.extension) {
      if (connectedClients.extension === 'http-polling') {
        commandQueue.push({ cmd: 'shuffle' });
      } else {
        io.to(connectedClients.extension).emit('shuffle');
      }
    }
  });

  // Repeat command
  socket.on('repeat', () => {
    console.log(`[${new Date().toISOString()}] Repeat toggle from ${socket.id}`);
    if (connectedClients.extension) {
      if (connectedClients.extension === 'http-polling') {
        commandQueue.push({ cmd: 'repeat' });
      } else {
        io.to(connectedClients.extension).emit('repeat');
      }
    }
  });

  // Like command
  socket.on('like', () => {
    console.log(`[${new Date().toISOString()}] Like toggle from ${socket.id}`);
    if (connectedClients.extension) {
      if (connectedClients.extension === 'http-polling') {
        commandQueue.push({ cmd: 'like' });
      } else {
        io.to(connectedClients.extension).emit('like');
      }
    }
  });

  // Queue command
  socket.on('queue', () => {
    console.log(`[${new Date().toISOString()}] Queue open from ${socket.id}`);
    if (connectedClients.extension) {
      if (connectedClients.extension === 'http-polling') {
        commandQueue.push({ cmd: 'queue' });
      } else {
        io.to(connectedClients.extension).emit('queue');
      }
    }
  });

  // Get playlists command
  socket.on('get-playlists', () => {
    console.log(`[${new Date().toISOString()}] Get playlists request from ${socket.id}`);
    console.log(`[${new Date().toISOString()}] Sending ${globalPlaylists.length} playlists to controller`);
    
    // Send stored playlists immediately
    if (globalPlaylists.length > 0) {
      socket.emit('playlists', globalPlaylists);
    }
    
    // Also request fresh playlists from extension
    if (connectedClients.extension) {
      if (connectedClients.extension === 'http-polling') {
        commandQueue.push({ cmd: 'get-playlists' });
      } else {
        io.to(connectedClients.extension).emit('get-playlists');
      }
    } else {
      console.warn(`[${new Date().toISOString()}] No extension connected to get playlists from`);
    }
  });

  // Play playlist command
  socket.on('play-playlist', (playlistId) => {
    console.log(`[${new Date().toISOString()}] Play playlist from ${socket.id}:`, playlistId);
    if (connectedClients.extension) {
      if (connectedClients.extension === 'http-polling') {
        commandQueue.push({ cmd: 'play-playlist', value: playlistId });
      } else {
        io.to(connectedClients.extension).emit('play-playlist', playlistId);
      }
    }
  });

  // State updates from extension
  socket.on('state-update', (newState) => {
    console.log(`[${new Date().toISOString()}] State update from extension:`, newState);
    
    // Handle playlists separately
    if (newState.playlists) {
      console.log(`[${new Date().toISOString()}] Sending playlists to all controllers:`, newState.playlists.length);
      // Store playlists globally
      globalPlaylists = newState.playlists;
      connectedClients.controllers.forEach(controllerId => {
        io.to(controllerId).emit('playlists', newState.playlists);
      });
    } else {
      // Update music state and broadcast to all controllers
      musicState = { ...musicState, ...newState };
      connectedClients.controllers.forEach(controllerId => {
        io.to(controllerId).emit('state-update', musicState);
      });
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] Disconnect: ${socket.id}`);
    
    if (connectedClients.extension === socket.id) {
      connectedClients.extension = null;
      console.log(`[${new Date().toISOString()}] Extension disconnected`);
    }
    
    connectedClients.controllers.delete(socket.id);
  });

  // Error handler
  socket.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] Socket error:`, error);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] MiniConnect Server running on http://0.0.0.0:${PORT}`);
  console.log(`[${new Date().toISOString()}] Server initialized - waiting for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
