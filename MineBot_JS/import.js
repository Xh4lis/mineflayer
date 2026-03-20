const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // minecraft server ip
  username: 'MineBot', // username to join as if auth is `offline`, else a unique identifier for this account. Switch if you want to change accounts
  //auth: "offline",//'microsoft', // for offline mode servers, you can set this to 'offline'
  port: 37659,              // set if you need a port that isn't 25565
  version: "1.21"           // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
  // password: '12345678'      // set if you want to use password-based auth (may be unreliable). If specified, the `username` must be an email
})

function goForWood () {
    // Cherche tous les blocs d'un certain type dans les chunks chargés
    const blocsTrouves = bot.findBlocks({
    matching: block => block.name.includes('log'), // Ce qu'on cherche
    maxDistance: 64,  // Rayon de recherche (64 blocs autour du bot)
    });

    console.log(`J'ai trouvé ${blocsTrouves.length} de bois !`);
    console.log(`${blocsTrouves}`);
    // blocsTrouves est un tableau contenant les coordonnées [Vec3] de chaque bloc
}

function goForWood2 () {
    console.log("Recherche absolue en cours...");
    const maPosition = bot.entity.position;

    // 1. On récupère un grand nombre de blocs (pour être sûr de couvrir toutes les directions)
    const blocsTrouves = bot.findBlocks({
        matching: bot.registry.blocksByName.oak_log.id,
        maxDistance: 64,
        count: 200 // On force l'algo à chercher loin et partout
    });

    if (blocsTrouves.length > 0) {
        
        blocsTrouves.sort((a, b) => {
            return maPosition.distanceTo(a) - maPosition.distanceTo(b);
        });

        const cible = blocsTrouves[0]; 
        
        // On calcule la distance pour vérifier que ça marche
        const distance = Math.round(maPosition.distanceTo(cible));
        console.log(`Arbre le plus proche trouvé à ${distance} blocs (X:${cible.x}, Y:${cible.y}, Z:${cible.z}).`);

        const defaultMove = new Movements(bot);
        bot.pathfinder.setMovements(defaultMove);

        // cible est un Vec3, on peut utiliser directement ses coordonnées
        const objectif = new goals.GoalNear(cible.x, cible.y, cible.z, 1);
        bot.pathfinder.setGoal(objectif);
        
    } else {
        console.log("Aucun bois trouvé dans un rayon de 64 blocs.");
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
/*
bot.on('error', (err) => {
    console.log("Aïe, petite erreur :", err.message);
});

bot.on('kicked', (reason) => {
    console.log("Le bot a été expulsé :", reason);
});
*/