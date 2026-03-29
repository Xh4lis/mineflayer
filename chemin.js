const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // minecraft server ip
  username: 'MineBot', // username to join as if auth is `offline`, else a unique identifier for this account. Switch if you want to change accounts
  //auth: "offline",//'microsoft', // for offline mode servers, you can set this to 'offline'
  port: 37659,              // set if you need a port that isn't 25565
  version: "1.21"           // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
  // password: '12345678'      // set if you want to use password-based auth (may be unreliable). If specified, the `username` must be an email
})

// Recherche efficace des arbres les plus proches
// findBlocks parcourt les chanks chargés autour du bot, mais l'ordre dans
// lequel il les examine privilégie les directions positives par rapport au bot
// Les blocks à sa gauche se retrouvent donc au début du tableau blocsTrouves et
// donc les arbres les plus proches ne sont pas choisis.
// Pour résoudre ça, on tri tous les blocks trouvés par distance au bot une fois 
// qu'il a trouvé les blocks les plus proches.

console.log(`Let's go !`);

function goForWood2(minBlocks = 10) {
  console.log("Recherche de bois en cours...");
  const maPosition = bot.entity.position;
  let nbBlocks = 32;
  let blocsTrouves = [];

  // On agrandit le rayon progressivement jusqu'à trouver au moins minBlocks
  while (blocsTrouves.length < minBlocks && nbBlocks <= 256) { // limite 256 pour éviter freeze
    console.log(`Recherche dans un rayon de ${nbBlocks} blocs`);
    blocsTrouves = bot.findBlocks({
      matching: block => block.name.includes('log'), // tous les logs
      maxDistance: nbBlocks,
      count: minBlocks
    });

    if (blocsTrouves.length < minBlocks) {
      nbBlocks *= 2; // double le rayon si pas assez de blocs trouvés
    }
  }

  if (blocsTrouves.length > 0) {
    // Tri les blocs par distance pour éviter le biais vers les coordonnées positives
    blocsTrouves.sort((a, b) => maPosition.distanceTo(a) - maPosition.distanceTo(b));
    const cible = blocsTrouves[0]; 
    const distance = Math.round(maPosition.distanceTo(cible));
    console.log(`Arbre le plus proche trouvé à ${distance} blocs (X:${cible.x}, Y:${cible.y}, Z:${cible.z}).`);

    // Déplacement vers le bloc le plus proche
    const defaultMove = new Movements(bot);
    bot.pathfinder.setMovements(defaultMove);
    const objectif = new goals.GoalNear(cible.x, cible.y, cible.z, 1);
    bot.pathfinder.setGoal(objectif);
  } else {
    console.log(`Aucun bois trouvé dans un rayon de ${nbBlocks} blocs.`);
  }
}


const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
bot.loadPlugin(pathfinder);

const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
})

bot.on('spawn', () => {
  console.log("Le bot est prêt !");
  // On ne lance pas la recherche immédiatement, on attend un peu que les chunks chargent
  setTimeout(() => goForWood2(), 2000); 
});