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


function goForWood() {
  let nbBlocks = 32;
  let blocsTrouves = bot.findBlocks({
    matching: block => block.name.includes('log'),
    maxDistance: nbBlocks,
  });

  // On agrandit la recherche tant qu'on a moins de 10 blocs
  while (blocsTrouves.length < 10 && nbBlocks <= 128) { // limite pour éviter boucle infinie
    nbBlocks *= 2;
    blocsTrouves = bot.findBlocks({
      matching: block => block.name.includes('log'),
      maxDistance: nbBlocks,
    });
  }

  console.log(`J'ai trouvé ${blocsTrouves.length} blocs de bois !`);
  console.log(blocsTrouves);
}

async function goForWood2(minBlocks=10 , tentative=1) {
  const maPosition = bot.entity.position;
  let nbBlocks = 256;
  let blocsTrouves = [];
  //si on a pas fait les tentatives
  if (blocsTrouves.length < minBlocks && tentative <= 10) {
    //cherche
    console.log("recherche "+tentative+": "+"nbBlocks = "+nbBlocks);
    const logIds = bot.registry.blocksArray
      .filter(block => block.name.includes('diamond'))
      .map(block => block.id);
    blocsTrouves = bot.findBlocks({
      matching: logIds,
      maxDistance: nbBlocks,
      count: minBlocks
    });
    //si trouve
    if (blocsTrouves.length >= minBlocks) {
      //on y va
      blocsTrouves.sort((a, b) => maPosition.distanceTo(a) - maPosition.distanceTo(b));
      const cible = blocsTrouves[0]; 
      const distance = Math.round(maPosition.distanceTo(cible));
      console.log(`Arbre le plus proche trouvé à ${distance} blocs (X:${cible.x}, Y:${cible.y}, Z:${cible.z}).`);

      const defaultMove = new Movements(bot);
      bot.pathfinder.setMovements(defaultMove);
      const objectif = new goals.GoalNear(cible.x, cible.y, cible.z, 1);
      bot.pathfinder.setGoal(objectif);
    } 
    //si on trouve pas (on avance si tentative !=10)
    else if (blocsTrouves.length < minBlocks && tentative !=10) {
      console.log("Pas assez de bois ici, j'avance de 256 blocs");    
      let xActuel = Math.round(maPosition.x); // On stocke le X de départ
      // La boucle for de 4 étapes
      for(let i = 0; i < 4; i++){
        xActuel += 64; // On ajoute 64 à chaque tour de boucle ! (64, 128, 192, 256)
        const defaultMove = new Movements(bot);
        bot.pathfinder.setMovements(defaultMove);
        console.log(`Étape ${i+1}/4 : Je marche vers X:${xActuel}...`);
        try {
          await bot.pathfinder.goto(new goals.GoalXZ(xActuel, Math.round(maPosition.z)));
          console.log(`${(i+1)*64} blocs parcourus !`);
        } 
        catch (err) {
          console.log("Impossible d'atteindre ce point (mur, océan...). Je m'arrête là pour ce voyage.");
          break; // On casse la boucle for si on est bloqué par une falaise
        }
      }
      setTimeout(() => goForWood2(minBlocks, tentative + 1), 500);
    }
  }
  else if (tentative>10){
    console.log(`Aucun bois trouvé dans les 10 tentatives`);  
    console.log("Fini !");
  }
}

async function goForWood(minBlocks = 10, tentative = 1, astar, controller) {
  const maPosition = bot.entity.position;
  let nbBlocks = 256;
  let blocsTrouves = [];

  if (tentative <= 10) {
    console.log("Recherche " + tentative + ": nbBlocks = " + nbBlocks);
    
    // (J'ai laissé diamond comme dans ton code !)
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
      const distance = Math.round(maPosition.distanceTo(cible));
      console.log(`Cible la plus proche trouvée à ${distance} blocs (X:${cible.x}, Y:${cible.y}, Z:${cible.z}).`);

      console.log("Calcul du chemin avec l'IA");
      const path = astar.findPath(
          Math.round(maPosition.x), Math.round(maPosition.y), Math.round(maPosition.z),
          cible.x, cible.y, cible.z
      );

      if (path) {
          console.log("Chemin trouvé !");
          await controller.executePath(path);
          console.log("Arrivé à destination !");
      } else {
          console.log("L'IA ne trouve aucun chemin sûr pour y aller.");
          setTimeout(() => goForWood(minBlocks, tentative + 1, astar, controller), 500);
      }
    } 
    
    // --- 2. SI ON NE TROUVE PAS (EXPLORATION) ---
    else {
      console.log("Pas assez de blocs ici, j'avance de 256 blocs pour explorer.");    
      
      let targetX = Math.round(maPosition.x);
      const targetY = Math.round(maPosition.y); // On garde la même hauteur pour chercher
      const targetZ = Math.round(maPosition.z); 

      // La boucle for de 4 étapes
      for (let i = 0; i < 4; i++) {
        targetX += 64; 
        console.log(`➡️ Étape ${i+1}/4 : Je marche vers X:${targetX}...`);
        
        // On demande à l'IA de nous emmener 64 blocs plus loin
        const path = astar.findPath(
            Math.round(bot.entity.position.x), Math.round(bot.entity.position.y), Math.round(bot.entity.position.z),
            targetX, targetY, targetZ
        );

        if (path) {
            await controller.executePath(path);
            console.log(`${(i+1)*64} blocs parcourus !`);
        } 
        else {
            console.log("Impossible d'aller plus loin (mur ou zone non chargée). Je m'arrête là.");
            break; // On casse la boucle for si on est bloqué
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
bot.on('error', (err) => console.log('Erreur du bot :', err));
bot.on('kicked', (reason) => console.log('Le bot a été kick :', reason));