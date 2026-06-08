const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const collectBlock = require('mineflayer-collectblock').plugin
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const inventoryViewer = require('mineflayer-web-inventory')

const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// 🌐 CLOUD IP CONFIGURATION: Reads settings from Railway/Render variables
const MC_HOST = process.env.MC_HOST || 'localhost'                // Fallback to local
const MC_PORT = parseInt(process.env.MC_PORT) || 25565           // Fallback to default port
const MC_USERNAME = process.env.MC_USERNAME || 'EmpireWebBot'    // Fallback username

const bot = mineflayer.createBot({
  host: smileysmp.eagler.host,
  port: 25565,
  username: tuffmen,
  version: '1.12.2'
})

console.log(`Connecting to Minecraft server at: ${MC_HOST}:${MC_PORT} as ${MC_USERNAME}...`)

bot.loadPlugin(pathfinder)
bot.loadPlugin(mcData) // Make sure to use the proper data loader
bot.loadPlugin(collectBlock)

bot.once('spawn', () => {
  console.log('Bot logged into Minecraft successfully!')
  
  mineflayerViewer(bot, { port: 3000, firstPerson: false })
  inventoryViewer(bot, { port: 4000 })

  const mcData = require('minecraft-data')(bot.version)
  const defaultMovements = new Movements(bot, mcData)
  defaultMovements.canDig = true
  defaultMovements.scafoldingBlocks = [mcData.blocksByName.dirt.id, mcData.blocksByName.cobblestone.id]
  bot.pathfinder.setMovements(defaultMovements)
})

// Custom panel code (Keep your existing app.get and io.on code here...)

const PORT = process.env.PORT || 5000; 
http.listen(PORT, () => { 
  console.log(`Control Tower website active on port ${PORT}`); 
});
