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
            const etape = path[i];
            const cible = new Vec3(etape.x, etape.y, etape.z);

            await this.bot.lookAt(cible.offset(0.5, 0, 0.5));
            let succes = false;
            
            // Un petit log pour savoir ce que le cerveau a décidé :
            console.log(`- Action demandée : ${etape.action} vers X:${etape.x} Y:${etape.y} Z:${etape.z}`);

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

    async sauterVers(cible) {
        this.bot.setControlState('forward', true);
        this.bot.setControlState('jump', true);
        await this.wait(100);
        this.bot.setControlState('jump', false);

        let tempsEcoule = 0; // chronomètre
        while (true) {
            const botPos = this.bot.entity.position;
            const distance = Math.sqrt(Math.pow(botPos.x - (cible.x + 0.5), 2) + Math.pow(botPos.z - (cible.z + 0.5), 2));

            if (distance < 0.3 && Math.abs(botPos.y - cible.y) < 0.1) {
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
    async breakBlocks(blocsACasser) {
        //prendre le bon outil si est dans l'inventaire
        await this.equiperMeilleurOutil(this.bot.blockAt(new Vec3(blocsACasser[0].x, blocsACasser[0].y, blocsACasser[0].z))); // On équipe le meilleur outil pour le premier bloc à casser (s'il y en a un)
        for (const bloc of blocsACasser) {
            const blockToDig = this.bot.blockAt(new Vec3(bloc.x, bloc.y, bloc.z));
            await this.bot.lookAt(blockToDig.position.offset(0.5, 0, 0.5));
            await this.bot.dig(blockToDig);
        }
    }
    async casserEtMarcherVers(cible, blocsACasser) {
        await this.breakBlocks(blocsACasser);
        await this.bot.lookAt(cible.offset(0.5, 0, 0.5));
        return await this.marcherVers(cible);
    }
    // TODO : (optionnel) faire une fonction qui place les blocs mais il faudra enlever dans les autres fonctions qui le font
    /*
    async tower(cible) {
        const positionActuelle = this.bot.entity.position;
        const blocSousPieds = this.bot.blockAt(positionActuelle.offset(0, -1, 0));
        // Le vecteur qui indique le "dessus" du bloc
        const faceHaut = new Vec3(0, 1, 0);
        // on regarde vers le bas pour pouvoir poser le bloc
        await this.bot.lookAt(positionActuelle.offset(0, -2, 0), true);
        await this.equiperBloc(); // On équipe un bloc de construction avant de faire le tower
        this.bot.setControlState('jump', true);
        await this.wait(150);
        try {
            await this.bot.placeBlock(blocSousPieds, faceHaut);
        } catch (err) {
            // Si on n'a pas de blocs en main ou qu'on a raté le timing, ça va déclencher cette erreur
            this.bot.setControlState('jump', false);
            console.log("Impossible de faire le tower :", err.message);
            return false;
        }
        this.bot.setControlState('jump', false);
        await this.wait(300);
        return true;
    }*/
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

    async breakTower(cible, blocsACasser) {
        await this.breakBlocks(blocsACasser);
        return await this.tower(cible);
    }
    async digDown(cible, blocSousPieds) {
        await this.breakBlocks([{ x: blocSousPieds.x, y: blocSousPieds.y, z: blocSousPieds.z }]);
        await this.bot.lookAt(cible.offset(0.5, 0, 0.5));
        return await this.marcherVers(cible);
    }

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
    // TODO : améliorer la fonction pour qu'elle choisisse le meilleur outil en fonction du bloc à miner (ex: pelle pour la terre, pioche pour la pierre, hache pour le bois...)
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

    // TODO : fonction pour bridge
    // TODO : fonction pour faire du parkour (sauter de bloc en bloc)
}

module.exports = Controller;