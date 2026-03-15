const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: '82.64.200.38', // minecraft server ip
  username: 'MineBot', // username to join as if auth is `offline`, else a unique identifier for this account. Switch if you want to change accounts
  //auth: "offline",//'microsoft', // for offline mode servers, you can set this to 'offline'
  port: 30020              // set if you need a port that isn't 25565
  // version: false,           // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
  // password: '12345678'      // set if you want to use password-based auth (may be unreliable). If specified, the `username` must be an email
})

function goForWood () {

}

function lookAtNearestPlayer () {
  const playerFilter = (entity) => entity.type === "player"
  const playerEntity = bot.nearestEntity(playerFilter)
  if (!playerEntity) return
  const pos = playerEntity.position.offset(0,playerEntity.height,0)
  bot.lookAt(pos) 
}

const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
})


// N'oublie pas d'installer pathfinder : npm install mineflayer-pathfinder
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

// Charger le plugin indispensable pour se déplacer
bot.loadPlugin(pathfinder);

bot.on('spawn', () => {
  console.log("Le bot est prêt !");
  // On ne lance pas la recherche immédiatement, on attend un peu que les chunks chargent
  setTimeout(() => couperBoisProche(bot), 2000); 
});

async function couperBoisProche(instanceBot) {
  // On utilise instanceBot (l'argument passé) pour éviter les erreurs de undefined
  const mcData = require('minecraft-data')(instanceBot.version);
  
  // Trouver le bois
  const bois = instanceBot.findBlock({
    matching: block => block.name.includes('log'),
    maxDistance: 32
  });

  if (!bois) {
    console.log("Aucun bois trouvé aux alentours.");
    return;
  }

  console.log(`Arbre trouvé à : ${bois.position}`);
  
  // Configuration des mouvements
  const defaultMove = new Movements(instanceBot, mcData);
  instanceBot.pathfinder.setMovements(defaultMove);

  // Aller vers le bloc et le couper
  try {
    await instanceBot.pathfinder.setGoal(new goals.GoalGetToBlock(bois.position.x, bois.position.y, bois.position.z));
    await instanceBot.dig(bois);
    console.log("Bois coupé !");
  } catch (err) {
    console.log("Erreur pendant le minage : ", err);
  }
}

//bot.on("physicTick", lookAtNearestPlayer)

/*
bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})
// Log errors and kick reasons:

bot.on('kicked', console.log)
bot.on('error', console.log)
*/
