const { Vec3 } = require('vec3');

class Controller {
    constructor(bot) {
        this.bot = bot;
    }

    // pour mettre le code en pause
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
   async executePath(path) {
        if (!path || path.length === 0) return false;

        const depart = new Vec3(path[0].x, path[0].y, path[0].z);
        console.log("Centrage sur le bloc de départ");
        await this.bot.lookAt(depart.offset(0.5, 0, 0.5));
        await this.marcherVers(depart);

        // (index 0) la case où le bot se trouve déjà
        for (let i = 1; i < path.length; i++) {
            const combat = await this.modeDefense();
            if (combat){
                const etapePrecedente = new Vec3(path[i-1].x, path[i-1].y, path[i-1].z);
                await this.bot.lookAt(etapePrecedente.offset(0.5, 0, 0.5));
                await this.marcherVers(etapePrecedente);
            }


            const etape = path[i];
            const cible = new Vec3(etape.x, etape.y, etape.z);

            await this.bot.lookAt(cible.offset(0.5, 0, 0.5));
            let succes = false;
            
            // Un petit log pour savoir ce que le cerveau a décidé :
            console.log(`- Action demandée : ${etape.action} vers X:${etape.x} Y:${etape.y} Z:${etape.z}`);
            this.bot.chat(`Action : ${etape.action} vers X:${etape.x} Y:${etape.y} Z:${etape.z}`);
            if (etape.action === 'walk' || etape.action === 'drop') {
                succes = await this.marcherVers(cible);
            } 
            else if (etape.action === 'jump') {
                succes = await this.sauterVers(cible);
            }
            else if (etape.action === 'break') {
                succes = await this.casserEtMarcherVers(cible, etape.toBreak);
            }
            else if (etape.action === 'tower') {
                succes = await this.tower(cible);
            }
            else if (etape.action === 'break_and_tower') {
                succes = await this.breakTower(cible, etape.toBreak);
            }
            else if (etape.action === 'dig_down') {
                succes = await this.digDown(cible, etape.toBreak[0]); 
            }
            else if (etape.action === 'bridge') {
                succes = await this.bridge(cible); 
            }
            else if (etape.action === 'swim') {
                succes = await this.nagerVers(cible);
            }
            else if (etape.action === 'break_and_jump') {
                succes = await this.casserEtSauterVers(cible, etape.toBreak);
            }
            else {
                console.log(`Action INCONNUE : ${etape.action}`); // action oubliée dans movements.js
            }

            if (!succes) {
                console.log("Je suis bloqué ! J'abandonne ce chemin.");
                this.bot.clearControlStates();
                return false; 
            }      
            await this.wait(50); 
        }
        this.bot.clearControlStates();
        return true; // <-- C'est une réussite !
    }
    // Fonction pour nager
    async nagerVers(cible) {
        this.bot.setControlState('forward', true);
        this.bot.setControlState('jump', true); // On maintient le saut enfoncé pour nager 
        let tempsEcoule = 0; 
        while (true) {
            const botPos = this.bot.entity.position;
            const distance = Math.sqrt(Math.pow(botPos.x - (cible.x + 0.5), 2) + Math.pow(botPos.z - (cible.z + 0.5), 2));
            if (distance < 0.3) {
                this.bot.setControlState('forward', false);
                this.bot.setControlState('jump', false); // On lâche le saut en arrivant
                return true;
            }
            if (tempsEcoule > 4000) { 
                this.bot.clearControlStates(); 
                return false; 
            }
            await this.wait(50); 
            tempsEcoule += 50; 
        }
    }
    // Casse le chemin devant lui pour sauter sur le bloc au dessus
    async casserEtSauterVers(cible, blocsACasser) {
        await this.breakBlocks(blocsACasser);
        await this.bot.lookAt(cible.offset(0.5, 0, 0.5));
        return await this.sauterVers(cible);
    }
    // Marche vers le bloc devant lui 
    async marcherVers(cible) {
        this.bot.setControlState('forward', true);

        let tempsEcoule = 0; // chronomètre
        // on crée une boucle qui attend que le bot soit arrivé
        while (true) {
            // distance au centre du bloc visé (X et Z, on ignore un peu la hauteur précise)
            const botPos = this.bot.entity.position;
            const distance = Math.sqrt(Math.pow(botPos.x - (cible.x + 0.5), 2) + Math.pow(botPos.z - (cible.z + 0.5), 2));

            if (distance < 0.3) {
                this.bot.setControlState('forward', false);
                return true;
            }
            if (tempsEcoule > 2000) {
                this.bot.setControlState('forward', false);
                this.bot.clearControlStates(); // On lâche tout
                return false; // Échec du mouvement
            }
            await this.wait(50); // On attend 50ms avant de revérifier la distance
            tempsEcoule += 50; // On ajoute 50ms au chronomètre
        }
    }
    // Saute sur le bloc devant lui
    async sauterVers(cible) {
        this.bot.setControlState('forward', true);
        this.bot.setControlState('jump', true);

        let tempsEcoule = 0; // chronomètre
        while (true) {
            const botPos = this.bot.entity.position;
            const distance = Math.sqrt(Math.pow(botPos.x - (cible.x + 0.5), 2) + Math.pow(botPos.z - (cible.z + 0.5), 2));
            if (botPos.y >= cible.y) {
                this.bot.setControlState('jump', false);
            }
            if (distance < 0.3 && Math.abs(botPos.y - cible.y) < 0.25) {
                this.bot.setControlState('forward', false);
                this.bot.setControlState('jump', false);
                return true;
            }
            if (tempsEcoule > 2000) {
                this.bot.setControlState('forward', false);
                this.bot.setControlState('jump', false);
                this.bot.clearControlStates(); // On lâche tout
                return false; // Échec du mouvement
            }
            await this.wait(50); // On attend 50ms avant de revérifier la distance
            tempsEcoule += 50; // On ajoute 50ms au chronomètre
        }
    }
    // Casse les blocs donnés en paramètre
    async breakBlocks(blocsACasser) {
        //prendre le bon outil si est dans l'inventaire
        await this.equiperMeilleurOutil(this.bot.blockAt(new Vec3(blocsACasser[0].x, blocsACasser[0].y, blocsACasser[0].z))); // On équipe le meilleur outil pour le premier bloc à casser (s'il y en a un)
        for (const bloc of blocsACasser) {
            const blockToDig = this.bot.blockAt(new Vec3(bloc.x, bloc.y, bloc.z));
            await this.bot.lookAt(blockToDig.position.offset(0.5, 0, 0.5));
            await this.bot.dig(blockToDig);
        }
    }
    // Casse le ou les blocs devant lui puis marche vers la cible
    async casserEtMarcherVers(cible, blocsACasser) {
        await this.breakBlocks(blocsACasser);
        await this.bot.lookAt(cible.offset(0.5, 0, 0.5));
        return await this.marcherVers(cible);
    }
    // Pose un bloc en dessous de lui pour monter
    async tower(cible) {
        const positionActuelle = this.bot.entity.position;
        const blocSousPieds = this.bot.blockAt(positionActuelle.offset(0, -1, 0));
        const faceHaut = new Vec3(0, 1, 0);
        this.bot.clearControlStates();
        await this.equiperBloc(); 
        // yaw = direction du regard (on garde le même), pitch = angle vertical (-Math.PI/2 = regarder ses pieds)
        await this.bot.look(this.bot.entity.yaw, -Math.PI / 2, true);
        this.bot.setControlState('jump', true);
        await this.wait(150);
        try {
            await this.bot.placeBlock(blocSousPieds, faceHaut);
        } catch (err) {
            console.log("Impossible de faire le tower (timing raté) :", err.message);
            this.bot.setControlState('jump', false);
            return false;
        }
        this.bot.setControlState('jump', false);
        await this.wait(200); 
        return true;
    }
    // Pose un bloc devant lui pour faire un pont et avancer dessus
    async bridge(cible) {
        const positionActuelle = this.bot.entity.position;
        const blocSousPieds = this.bot.blockAt(positionActuelle.offset(0, -1, 0));
        const dx = Math.sign(Math.floor(cible.x) - Math.floor(positionActuelle.x));
        const dz = Math.sign(Math.floor(cible.z) - Math.floor(positionActuelle.z));
        const faceCote = new Vec3(dx, 0, dz);
        await this.equiperBloc();
        this.bot.setControlState('sneak', true);
        await this.bot.lookAt(cible.offset(0.5, 0, 0.5));
        this.bot.setControlState('forward', true);
        await this.wait(200); // 200ms suffisent pour se bloquer au bord en sneak
        this.bot.setControlState('forward', false);

        const pointDeVisee = blocSousPieds.position.offset(0.5 + (dx * 0.5), 0.5, 0.5 + (dz * 0.5));
        await this.bot.lookAt(pointDeVisee, true);
        
        try {
            await this.bot.placeBlock(blocSousPieds, faceCote);
        } catch (err) {
            console.log("Impossible de placer le bloc pour le bridge :", err.message);
            this.bot.setControlState('sneak', false);
            return false;
        }
        this.bot.setControlState('sneak', false);
        return await this.marcherVers(cible);   
    }
    // Creuse au dessus de lui puis pose un bloc en dessous pour monter
    async breakTower(cible, blocsACasser) {
        await this.breakBlocks(blocsACasser);
        return await this.tower(cible);
    }
    // Pour descendre en creusant sous lui
    async digDown(cible, blocSousPieds) {
        await this.breakBlocks([{ x: blocSousPieds.x, y: blocSousPieds.y, z: blocSousPieds.z }]);
        await this.bot.lookAt(cible.offset(0.5, 0, 0.5));
        return await this.marcherVers(cible);
    }
    // S'il y a un ennemi à proximité
    async modeDefense() {
        const mechants = ['zombie', 'skeleton', 'creeper', 'spider', 'enderman', 'witch', 'slime','blaze','drowned','husk','stray','vex','vindicator','evoker','pillager']; // Liste des mobs à attaquer (on peut en ajouter ou enlever selon les besoins)
        let aCombattu = false;
        // On cherche l'entité la plus proche qui respecte nos critères
        while (true) {
            // On cherche la cible la plus proche (dans un rayon de 5 blocs)
            const cible = this.bot.nearestEntity(entity => {
                return entity.name && 
                       mechants.includes(entity.name) && 
                       this.bot.entity.position.distanceTo(entity.position) < 5; 
            });
            // S'il n'y a plus de cible, on sort de la boucle
            if (!cible) {
                if (aCombattu) console.log("Zone sécurisée. Reprise de la mission !");
                return aCombattu; // Renvoie 'true' si on s'est battu, 'false' si c'était déjà calme
            }
            if (!aCombattu) {
                console.log(`Menace détectée (${cible.name}). Arrêt des mouvements et passage en mode Combat.`);
                this.bot.clearControlStates(); // On lâche toutes les touches de déplacement
                await this.equiperArme();
                aCombattu = true;
            }
            // On vise et on frappe
            await this.bot.lookAt(cible.position.offset(0, cible.height / 2, 0), true);
            this.bot.attack(cible);
            // Le cooldown de l'arme avant de pouvoir remettre un coup plein pot
            await this.wait(500);
        }
    }
    // Pour poser un bloc
    async equiperBloc() {
        // Liste de nos blocs préférés pour construire
        const blocsDeConstruction = ['dirt', 'cobblestone', 'stone', 'netherrack'];

        // On fouille l'inventaire pour trouver l'un de ces blocs
        const bloc = this.bot.inventory.items().find(item => blocsDeConstruction.includes(item.name));

        if (bloc) {
            try {
                await this.bot.equip(bloc, 'hand');
            } catch (err) {
                console.log(`Impossible d'équiper ${bloc.name}`);
            }
        } else {
            console.log("Aïe ! Je n'ai plus de blocs de construction dans mon inventaire !");
        }
    }
    // Pour casser un bloc
    async equiperMeilleurOutil(blockToDig) {
        let meilleurOutil = null;
        // on calcule le temps de minage avec la main vide (type = null)
        // Les 3 "false" correspondent à : mode créatif, sous l'eau, et en l'air (on part du principe qu'on est sur terre)
        let tempsMinimum = blockToDig.digTime(null, false, false, false);

        // on teste virtuellement tous les objets de l'inventaire
        for (const item of this.bot.inventory.items()) {
            // L'API calcule le temps que ça prendrait avec cet objet
            const tempsAvecOutil = blockToDig.digTime(item.type, false, false, false);
            if (tempsAvecOutil < tempsMinimum) {
                tempsMinimum = tempsAvecOutil;
                meilleurOutil = item;
            }
        }

        // si on a trouvé un outil qui va plus vite que nos mains, on l'équipe
        if (meilleurOutil) {
            try {
                await this.bot.equip(meilleurOutil, 'hand');
            } catch (err) {
                console.log(`Erreur lors de l'équipement de ${meilleurOutil.name} :`, err.message);
            }
        } else {
            // sinon, on déséquipe ce qu'on a en main pour miner à mains nues
            try {
                await this.bot.unequip('hand');
            } catch (err) {}
        }
    }
    // Pour le mode defense
    async equiperArme(){
        const items = this.bot.inventory.items();
        let arme  = items.find(item => item.name.includes('sword') );
        if (!arme){
            arme = items.find(item => item.name.includes('axe'));
        }
        if (!arme){
            arme = items.find(item => item.name.includes('pickaxe'));
        }
        if (arme){
            try{
                if(!this.bot.heldItem || this.bot.heldItem.name !== arme.name){
                    await this.bot.equip(arme, 'hand');
                }
            } catch (err){
                console.log(`Erreur lors de l'équipement de ${arme.name} :`, err.message);
            }
        }
        else{
            try {
                await this.bot.unequip('hand');
            } catch (err) {}
        }

    }
    // TODO : fonction pour faire du parkour (sauter de bloc en bloc)
}

module.exports = Controller;