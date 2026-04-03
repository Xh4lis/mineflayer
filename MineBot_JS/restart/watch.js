const { Vec3 } = require('vec3');
class Watch {
    constructor(bot) {
        this.bot = bot; // On stocke le bot pour pouvoir utiliser ses yeux
    }

    getBlock(x, y, z) {
        return this.bot.blockAt(new Vec3(x, y, z));
    }

    // Détermine si le bot peut se tenir sur cette case précise
    isWalkable(x, y, z) {
        if (y < -64||y>319) return false; // limites du monde
        const sol = this.getBlock(x, y-1, z);
        const pieds = this.getBlock(x, y, z);
        const tete = this.getBlock(x, y+1, z);
        if (!sol || !pieds || !tete) return false;
        if (sol.boundingBox === 'block') { // le bloc en dessous doit être solide
            if (pieds.boundingBox === 'empty' && tete.boundingBox === 'empty') { // les blocs à la hauteur du bot doivent être de l'air
                return true;
            }
        }
        return false;
    }
    // Détermine si le bot peut casser le bloc à côté de lui (dans la direction donnée) et le bloc en dessous pour s'y frayer un chemin (checker si le bloc encore au dessus n'est pas de la lave/eau/gravier/sable/enclume ? | et que le bloc encore en dessous est solide)
    isBreakable(x, y, z) {
        if (y < -64||y>319) return false; // limites du monde
        const sol = this.getBlock(x, y-1, z);
        const pieds = this.getBlock(x, y, z);
        const tete = this.getBlock(x, y+1, z);
        const plafond = this.getBlock(x, y+2, z);
        if (sol.boundingBox === 'block') { // le bloc en dessous doit être solide
            if (!["sand","anvil","gravel"].includes(plafond.name)) { // s'il y a un bloc au dessus, il ne doit pas être du sable/gravier/enclume/lave/eau
                if ((pieds.diggable === true||pieds.boundingBox === 'empty') && (tete.diggable === true||pieds.boundingBox === 'empty') ) { // les blocs à la hauteur du bot doivent être de l'air
                    return true;
                }
            }
        }
        return false;
    }

    // Détermine si on peut creuser le bloc exactement sous nos pieds
    canDigDown(x, y, z) {
        if (y < -63) return false; // On ne creuse pas la Bedrock

        const blocAScasser = this.getBlock(x, y - 1, z);
        const blocDeReception = this.getBlock(x, y - 2, z); // Le bloc sur lequel on va atterrir

        if (!blocAScasser || !blocDeReception) return false;

        // Le bloc sous nos pieds doit être cassable
        if (blocAScasser.diggable === true) {
            const dangers = ['lava', 'water','air'];
            if (!dangers.includes(blocDeReception.name)) {
                return true;
            }
        }
        return false;
    }
    // Détermine si le bot a la place de sauter pour poser un bloc sous lui
    canTowerUp(x, y, z) {
        if (y > 319) return false;

        const espaceTeteSaut = this.getBlock(x, y + 2, z);

        if (!espaceTeteSaut) return false;

        // Pour sauter sur place, il suffit que le bloc au-dessus de notre tête soit vide
        return espaceTeteSaut.boundingBox === 'empty';
    }

    // Détermine si on peut casser le plafond pour ensuite faire un Tower Up
    canBreakAndTowerUp(x, y, z) {
        if (y > 318) return false;

        const plafond = this.getBlock(x, y + 2, z);
        const auDessusDuPlafond = this.getBlock(x, y + 3, z);

        if (!plafond || !auDessusDuPlafond) return false;

        // Le plafond doit être un bloc solide, mais cassable
        if (plafond.boundingBox === 'block' && plafond.diggable === true) {
            
            const dangers = ['sand', 'gravel', 'anvil', 'lava', 'water'];
            if (!dangers.includes(auDessusDuPlafond.name)) {
                return true;
            }
        }
        return false;
    }
}

module.exports = Watch;