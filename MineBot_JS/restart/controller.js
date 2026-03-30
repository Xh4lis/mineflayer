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
        if (!path || path.length === 0) return;

        // (index 0) la case où le bot se trouve déjà
        for (let i = 1; i < path.length; i++) {
            const etape = path[i];
            const cible = new Vec3(etape.x, etape.y, etape.z);

            // on vise les pieds du bloc cible + offset pour centrer
            await this.bot.lookAt(cible.offset(0.5, 0, 0.5));

            // on exécute l'action demandée
            if (etape.action === 'walk' || etape.action === 'drop') {
                await this.marcherVers(cible);
            } 
            else if (etape.action === 'jump') {
                await this.sauterVers(cible);
            }
            else if (etape.action === 'break') {
                await this.casserEtMarcherVers(cible, etape.toBreak);
            }
            else if (etape.action === 'tower') {
                await this.tower(cible);
            }
            else if (etape.action === 'break_and_tower') {
                await this.breakTower(cible, etape.toBreak);
            }
            
            // On fait une micro-pause pour éviter que le bot ne glisse ou n'aille trop vite
            await this.wait(50); 
        }

        // Quand la boucle est finie, on lâche toutes les touches !
        this.bot.clearControlStates();
    }


    async marcherVers(cible) {
        this.bot.setControlState('forward', true);

        // on crée une boucle qui attend que le bot soit arrivé
        while (true) {
            // distance au centre du bloc visé (X et Z, on ignore un peu la hauteur précise)
            const botPos = this.bot.entity.position;
            const distance = Math.sqrt(Math.pow(botPos.x - (cible.x + 0.5), 2) + Math.pow(botPos.z - (cible.z + 0.5), 2));

            if (distance < 0.3) {
                this.bot.setControlState('forward', false);
                break;
            }
            await this.wait(50); // On attend 50ms avant de revérifier la distance
        }
    }

    async sauterVers(cible) {
        this.bot.setControlState('forward', true);
        this.bot.setControlState('jump', true);
        await this.wait(100);
        this.bot.setControlState('jump', false);

        while (true) {
            const botPos = this.bot.entity.position;
            const distance = Math.sqrt(Math.pow(botPos.x - (cible.x + 0.5), 2) + Math.pow(botPos.z - (cible.z + 0.5), 2));

            if (distance < 0.3 && Math.abs(botPos.y - cible.y) < 0.1) {
                this.bot.setControlState('forward', false);
                break;
            }
            await this.wait(50);
        }
    }
    async breakBlocks(blocsACasser) {
        for (const bloc of blocsACasser) {
            const blockToDig = this.bot.blockAt(new Vec3(bloc.x, bloc.y, bloc.z));
            await this.bot.lookAt(blockToDig.position.offset(0.5, 0, 0.5));
            //TODO : rajouter prendre le bon outil si est dans l'inventaire
            await this.bot.dig(blockToDig);
        }
    }
    async casserEtMarcherVers(cible, blocsACasser) {
        await this.breakBlocks(blocsACasser);
        await this.bot.lookAt(cible.offset(0.5, 0, 0.5));
        await this.marcherVers(cible);
    }

    async tower(cible) {
        // TODO : S'assurer que le bot a équipé un bloc (dirt, cobble...) dans sa main !
        const positionActuelle = this.bot.entity.position;
        const blocSousPieds = this.bot.blockAt(positionActuelle.offset(0, -1, 0));
        // Le vecteur qui indique le "dessus" du bloc
        const faceHaut = new Vec3(0, 1, 0);
        // on regarde vers le bas pour pouvoir poser le bloc
        await this.bot.lookAt(positionActuelle.offset(0, -2, 0), true);

        this.bot.setControlState('jump', true);
        await this.wait(100);

        try {
            await this.bot.placeBlock(blocSousPieds, faceHaut);
        } catch (err) {
            // Si on n'a pas de blocs en main ou qu'on a raté le timing, ça va déclencher cette erreur
            console.log("Impossible de faire le tower (pas de bloc en main ?) :", err.message);
        }
        this.bot.setControlState('jump', false);
        await this.wait(150);
    }

    async breakTower(cible, blocsACasser) {
        await this.breakBlocks(blocsACasser);
        await this.tower(cible);
    }
}

module.exports = Controller;