const mineflayer = require('mineflayer')
const { Vec3 } = require('vec3')

const bot = mineflayer.createBot({
  host: '82.64.200.38',
  port: 30020,
  username: 'Ilyas_bot'
})

bot.once('spawn', () => {
  console.log('Le bot est là')
  scanIron()
})

function findIron() {
  let yaw = 0
  const interval = setInterval(() => {
    yaw += Math.PI / 8  
    
    bot.look(yaw, 0, true)

    const ironBlocks = bot.findBlocks({
      matching: block => block.name === 'iron_ore',
      maxDistance: 500,
      count: 3
    })

    if (ironBlocks.length > 0) {
      clearInterval(interval)
      console.log( ironBlocks)
      bot.chat(ironBlocks)
    }
  }, 100)
}