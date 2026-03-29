const mineflayer = require('mineflayer');
const Watch = require('./watch.js');
const Movements = require('./movements.js');
const AStar = require('./AStar.js');
const Controller = require('./controller.js');

const bot = mineflayer.createBot({
  host: 'localhost', // minecraft server ip
  username: 'MineBot', // username to join as if auth is `offline`, else a unique identifier for this account. Switch if you want to change accounts
  //auth: "offline",//'microsoft', // for offline mode servers, you can set this to 'offline'
  port: 30303,              // set if you need a port that isn't 25565
  version: "1.21"           // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
  // password: '12345678'      // set if you want to use password-based auth (may be unreliable). If specified, the `username` must be an email
})


const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { Vec3 } = require('vec3');
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }); // )if first person is false, you get a bird's-eye view

    const watch = new Watch(bot);
    const movements = new Movements(watch);
    const astar = new AStar(movements);
    const controller = new Controller(bot);
    // Faire le reste du script ici

    
    console.log("Le bot est prêt !");
    // On ne lance pas la recherche immédiatement, on attend un peu que les chunks chargent
    //setTimeout(() => goForWood(), 2000); 
});
bot.on('error', (err) => console.log('Erreur du bot :', err));
bot.on('kicked', (reason) => console.log('Le bot a été kick :', reason));