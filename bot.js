const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const collectBlock = require('mineflayer-collectblock').plugin
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const inventoryViewer = require('mineflayer-web-inventory')

const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// CLOUD IP CONFIGURATION (Fallbacks used if no Environment Variables are set)
const MC_HOST = process.env.MC_HOST || 'smileysmp.eagler.host'
const MC_PORT = parseInt(process.env.MC_PORT) || 25565
const MC_USERNAME = process.env.MC_USERNAME || 'EmpireBuilder'

const bot = mineflayer.createBot({
  host: MC_HOST,
  port: MC_PORT,
  username: MC_USERNAME,
  version: '1.12.2'
})

console.log(`Connecting to Minecraft server at: ${MC_HOST}:${MC_PORT} as ${MC_USERNAME}...`)

bot.loadPlugin(pathfinder)
bot.loadPlugin(collectBlock)

bot.once('spawn', () => {
  console.log('Bot logged into Minecraft successfully!')
  
  // 🗺️ Bind the 3D World Viewer directly into our Express App (No extra port!)
  mineflayerViewer(bot, { app: app, firstPerson: false })
  
  // 🎒 Bind the Visual Inventory directly into our Express App (No extra port!)
  inventoryViewer(bot, { app: app, path: '/inventory' })

  const mcData = require('minecraft-data')(bot.version)
  const defaultMovements = new Movements(bot, mcData)
  defaultMovements.canDig = true
  defaultMovements.scafoldingBlocks = [mcData.blocksByName.dirt.id, mcData.blocksByName.cobblestone.id]
  bot.pathfinder.setMovements(defaultMovements)
})

// 🎛️ Unified Control Tower Layout (Everything on ONE page)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Empire Bot Control Tower</title>
        <script src="/socket.io/socket.io.js"></script>
        <style>
          body { font-family: sans-serif; background: #1a1a1a; color: #fff; margin: 0; padding: 20px; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; }
          h1 { margin: 0 0 10px 0; text-align: center; font-size: 24px; }
          .container { display: flex; flex: 1; gap: 20px; min-height: 0; }
          .left-panel { flex: 1; display: flex; flex-direction: column; gap: 15px; background: #2a2a2a; padding: 15px; border-radius: 8px; }
          .right-panel { flex: 2; background: #2a2a2a; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
          iframe { width: 100%; border: none; background: #000; }
          .view-3d { flex: 2; }
          .view-inv { flex: 1; border-top: 4px solid #1a1a1a; }
          button { padding: 12px; font-size: 16px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 5px; font-weight: bold; }
          button.mine { background: #008CBA; }
          input { padding: 10px; font-size: 15px; border-radius: 5px; border: 1px solid #444; background: #333; color: white; }
          hr { border: 0; border-top: 1px solid #444; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>👑 Empire Bot Control Tower</h1>
        <div class="container">
          
          <!-- Control Panel -->
          <div class="left-panel">
            <h3>Quick Actions</h3>
            <button class="mine" onclick="sendCommand('mine_iron')">⛏️ Mine Nearest Iron</button>
            <button class="mine" onclick="sendCommand('mine_wood')">🪓 Chop Nearest Wood</button>
            <hr/>
            <h3>Manual Navigation</h3>
            <input type="text" id="coords" placeholder="X Y Z (e.g. 100 64 -200)">
            <button onclick="sendCoordinates()">🚀 Navigate to Coords</button>
          </div>
          
          <!-- Visual Monitors -->
          <div class="right-panel">
            <iframe class="view-3d" src="/viewer" title="3D View"></iframe>
            <iframe class="view-inv" src="/inventory" title="Inventory"></iframe>
          </div>

        </div>
        
        <script>
          const socket = io();
          function sendCommand(action) { socket.emit('botAction', { type: action }); }
          function sendCoordinates() {
            const val = document.getElementById('coords').value;
            socket.emit('botAction', { type: 'goto', data: val });
          }
        </script>
      </body>
    </html>
  `)
})

// Process actions clicked on the website
io.on('connection', (socket) => {
  socket.on('botAction', async (msg) => {
    const mcData = require('minecraft-data')(bot.version)
    
    if (msg.type === 'mine_iron') {
      const block = bot.findBlock({ matching: mcData.blocksByName.iron_ore.id, maxDistance: 64 })
      if (block) bot.collectBlock.collect(block)
    }
    
    if (msg.type === 'mine_wood') {
      const block = bot.findBlock({ matching: mcData.blocksByName.log.id, maxDistance: 64 })
      if (block) bot.collectBlock.collect(block)
    }
    
    if (msg.type === 'goto') {
      const parts = msg.data.split(' ')
      if (parts.length === 3) {
        const x = parseInt(parts[0]), y = parseInt(parts[1]), z = parseInt(parts[2])
        bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z))
      }
    }
  })
})

// Force the app to bind to Render's preferred port (10000), or fallback to environment variables
const PORT = process.env.PORT || 10000; 

http.listen(PORT, '0.0.0.0', () => { 
  console.log(`=========================================`);
  console.log(`👑 SUCCESS: Control Tower website is live!`);
  console.log(`🌐 Listening on: http://0.0.0.0:${PORT}`);
  console.log(`=========================================`);
});
