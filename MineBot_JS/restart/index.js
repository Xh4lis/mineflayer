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

async function goForWood(minBlocks = 10, tentative = 1, astar, controller) {
  const maPosition = bot.entity.position;
  let nbBlocks = 256;
  let blocsTrouves = [];
  if (tentative <= 10) {
    console.log("Recherche " + tentative + ": nbBlocks = " + nbBlocks);
    // On cherche des diamants
    const targetIds = bot.registry.blocksArray
      .filter(block => block.name.includes('diamond'))
      .map(block => block.id);      
    blocsTrouves = bot.findBlocks({
      matching: targetIds,
      maxDistance: nbBlocks,
      count: minBlocks
    });

    // --- 1. SI ON TROUVE LA CIBLE ---
    if (blocsTrouves.length >= minBlocks) {
      blocsTrouves.sort((a, b) => maPosition.distanceTo(a) - maPosition.distanceTo(b));
      const cible = blocsTrouves[0]; 
      const distance = Math.floor(maPosition.distanceTo(cible));
      console.log(`Cible la plus proche trouvée à ${distance} blocs (X:${cible.x}, Y:${cible.y}, Z:${cible.z}).`);
      console.log("Calcul du chemin avec l'IA");
      const path = astar.findPath(
          Math.floor(maPosition.x), Math.floor(maPosition.y), Math.floor(maPosition.z),
          cible.x, cible.y, cible.z
      );
      if (path) {
          console.log("Chemin trouvé !");  
          const estArrive = await controller.executePath(path);          
          if (estArrive) {
              console.log("Arrivé à destination !");
              // TODO : lui dire de casser la cible (il le fait déjà)
              // await controller.breakBlocks([cible]);
          } else {
              console.log("Bloqué en route, New A*");
              setTimeout(() => goForWood(minBlocks, tentative, astar, controller), 1000);
          }          
      } else {
          console.log("L'IA ne trouve aucun chemin sûr pour y aller.");
          setTimeout(() => goForWood(minBlocks, tentative + 1, astar, controller), 500);
      }
    } 
    // --- 2. SI ON NE TROUVE PAS (EXPLORATION) ---
    else {
      console.log("Pas assez de blocs ici, j'avance de 256 blocs pour explorer.");    
      
      let targetX = Math.floor(maPosition.x);
      const targetY = Math.floor(maPosition.y); 
      const targetZ = Math.floor(maPosition.z); 
      for (let i = 0; i < 4; i++) {
        targetX += 64; 
        console.log(`Étape ${i+1}/4 : Je marche vers X:${targetX}...`);
        const posActuelle = bot.entity.position;
        const path = astar.findPath(
          Math.floor(posActuelle.x), Math.floor(posActuelle.y), Math.floor(posActuelle.z), //Math.floor super important
          targetX, targetY, targetZ
        );
        if (path) {
            const reussite = await controller.executePath(path);
            if (reussite) {
                console.log(`${(i+1)*64} blocs parcourus !`);
            } else {
                console.log("Bloqué pendant l'exploration ! Je m'arrête là pour ce voyage.");
                break; // Si on se bloque en explorant, on casse la boucle et on relance une recherche depuis la nouvelle position
            }
        } 
        else {
            console.log("Impossible d'aller plus loin (mur ou zone non chargée). Je m'arrête là.");
            break; 
        }
      }
      // On relance la recherche après l'exploration
      setTimeout(() => goForWood(minBlocks, tentative + 1, astar, controller), 500);
    }
  }
  else {
    console.log(`Aucun bloc trouvé dans les 10 tentatives.`);  
    console.log("Fini !");
  }
}

async function chercherBloc(nomDuBloc, minBlocks = 1, tentative = 1, astar, controller) {
  const maPosition = bot.entity.position;
  let nbBlocks = 256;
  let blocsTrouves = [];
  if (tentative <= 10) {
    console.log(`Recherche ${tentative} pour ${nomDuBloc} : nbBlocks = ${nbBlocks}`);
    // ON UTILISE LE NOM DU BLOC DONNÉ DANS LE CHAT :
    const targetIds = bot.registry.blocksArray
      .filter(block => block.name.includes(nomDuBloc.toLowerCase()))
      .map(block => block.id);
    blocsTrouves = bot.findBlocks({
      matching: targetIds,
      maxDistance: nbBlocks,
      count: minBlocks
    });

    // --- 1. SI ON TROUVE LA CIBLE ---
    if (blocsTrouves.length >= minBlocks) {
      blocsTrouves.sort((a, b) => maPosition.distanceTo(a) - maPosition.distanceTo(b));
      const cible = blocsTrouves[0]; 
      const distance = Math.floor(maPosition.distanceTo(cible));
      console.log(`Cible la plus proche trouvée à ${distance} blocs (X:${cible.x}, Y:${cible.y}, Z:${cible.z}).`);
      console.log("Calcul du chemin avec l'IA");
      const path = astar.findPath(
          Math.floor(maPosition.x), Math.floor(maPosition.y), Math.floor(maPosition.z),
          cible.x, cible.y, cible.z
      );
      if (path) {
          console.log("Chemin trouvé !");  
          const estArrive = await controller.executePath(path);          
          if (estArrive) {
              console.log("Arrivé à destination !");
              // TODO : lui dire de casser la cible (il le fait déjà)
              // await controller.breakBlocks([cible]);
          } else {
              console.log("Bloqué en route, New A*");
              setTimeout(() => chercherBloc(nomDuBloc, minBlocks, tentative, astar, controller), 1000);
          }          
      } else {
          console.log("L'IA ne trouve aucun chemin sûr pour y aller.");
          setTimeout(() => goForWood(nomDuBloc, minBlocks, tentative + 1, astar, controller), 500);
      }
    } 
    // --- 2. SI ON NE TROUVE PAS (EXPLORATION) ---
    else {
      console.log("Pas assez de blocs ici, j'avance de 256 blocs pour explorer.");    
      
      let targetX = Math.floor(maPosition.x);
      const targetY = Math.floor(maPosition.y); 
      const targetZ = Math.floor(maPosition.z); 
      for (let i = 0; i < 4; i++) {
        targetX += 64; 
        console.log(`Étape ${i+1}/4 : Je marche vers X:${targetX}...`);
        const posActuelle = bot.entity.position;
        const path = astar.findPath(
          Math.floor(posActuelle.x), Math.floor(posActuelle.y), Math.floor(posActuelle.z), //Math.floor super important
          targetX, targetY, targetZ
        );
        if (path) {
            const reussite = await controller.executePath(path);
            if (reussite) {
                console.log(`${(i+1)*64} blocs parcourus !`);
            } else {
                console.log("Bloqué pendant l'exploration ! Je m'arrête là pour ce voyage.");
                break; // Si on se bloque en explorant, on casse la boucle et on relance une recherche depuis la nouvelle position
            }
        } 
        else {
            console.log("Impossible d'aller plus loin (mur ou zone non chargée). Je m'arrête là.");
            break; 
        }
      }
      // On relance la recherche après l'exploration
      setTimeout(() => goForWood(minBlocks, tentative + 1, astar, controller), 500);
    }
  }
  else {
    console.log(`Aucun bloc trouvé dans les 10 tentatives.`);  
    console.log("Fini !");
  }
}

const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { Vec3 } = require('vec3');

bot.once('spawn', () => {
    mineflayerViewer(bot, { port: 3007, firstPerson: true });
    const watch = new Watch(bot);
    const movements = new Movements(watch);
    const astar = new AStar(movements);
    const controller = new Controller(bot);
    
    console.log("Le bot est prêt !");
    bot.on('chat', (username, message) => {
        // On ignore les messages du bot lui-même
        if (username === bot.username) return;
        // Si le message commence par "cherche "
        if (message.startsWith('cherche ')) {
            const nomDuBloc = message.split(' ')[1]; 
            if (nomDuBloc) {
                bot.chat(`C'est parti ${username}, je pars à la recherche de : ${nomDuBloc} !`);
                chercherBloc(nomDuBloc, 1, 1, astar, controller);
            }
        }
        // Stop
        if (message === 'stop') {
            bot.chat("J'arrête tout !");
            bot.clearControlStates();
        }
    });
});
bot.on('error', (err) => console.log('Erreur du bot :', err));
bot.on('kicked', (reason) => console.log('Le bot a été kick :', reason));



/*
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }); // )if first person is false, you get a bird's-eye view

    const watch = new Watch(bot);
    const movements = new Movements(watch);
    const astar = new AStar(movements);
    const controller = new Controller(bot);
    // Faire le reste du script ici

    
    console.log("Le bot est prêt !");
    // On ne lance pas la recherche immédiatement, on attend un peu que les chunks chargent
    setTimeout(() => goForWood(10,1,astar,controller), 2000); 
});
*/
