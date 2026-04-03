const casserBloc = 2;
const deplacement = 0.5;
const poserBloc = 1;
class Movements {
    constructor(watch) {
        this.watch = watch;
        this.neighbors = []
    }

    //================= FONCTIONS NORD/SUD/EST/OUEST =================

    IW(x,y,z){ // Is Walkable
        if (this.watch.isWalkable(x, y, z)) {
            this.neighbors.push({x: x, y: y, z: z, cost: deplacement});
            return true;
        }
        return false;
    }
    IB(x,y,z){ // Is Breakable
        if (this.watch.isBreakable(x, y, z-1)){
            // On analyse ce qu'il faut casser exactement
            const blocsACasser = [];
            const pieds = this.watch.getBlock(x, y, z);
            const tete = this.watch.getBlock(x, y+1, z);

            if (pieds.name !== 'air') blocsACasser.push({ x: x, y: y, z: z });
            if (tete.name !== 'air') blocsACasser.push({ x: x, y: y+1, z: z });

            // Le coût dépend du nombre de blocs à casser ! (Casser 2 blocs prend 2x plus de temps)
            const coutTotal = deplacement + (blocsACasser.length*casserBloc); // 1 pour avancer + 5 par bloc à casser

            this.neighbors.push({ 
                x: x, y: y, z: z, 
                cost: coutTotal, 
                action: 'break', 
                toBreak: blocsACasser // On donne la liste des blocs à la pioche !
            });
            return true;
        }
        return false;
    }
    ID(x,y,z){ // Is Descendable (pas francais mais menfou)
        // Descente
        const videTete = this.watch.getBlock(x, y + 1, z);
        if (videTete && videTete.boundingBox === 'empty') {
            if (this.watch.isWalkable(x, y-1, z)) { // La case de réception en bas est bonne
                this.neighbors.push({ 
                    x: x, y: y-1, z: z, 
                    cost: deplacement, // Tomber ne coûte pas vraiment d'énergie
                    action: 'drop' 
                });
                return true;
            }
        }
        return false;
    }
    IJF(x,y,z){ // Is Jumpable Forward (pas francais aussi mais bon hein qui va me critiquer ?)
        if (this.watch.isWalkable(x, y+1, z)) { // La case d'arrivée en hauteur est libre
            this.neighbors.push({ 
                x: x, y: y+1, z: z, 
                cost: deplacement + 0.5, // Un saut coûte un peu plus d'énergie que marcher
                action: 'jump' 
            });
            return true;
        }
        return false;
    }

    //================= VOISINS =================
    // Renvoie toutes les cases accessibles depuis un "node" (nœud)
    getNeighbors(node) {
        this.neighbors = []
        // Nord
        if (this.IW(node.x,node.y,node.z-1));
        else if(this.IB(node.x, node.y, node.z-1));
        else if(this.ID(node.x, node.y, node.z-1));

        // Sud
        if (this.IW(node.x,node.y,node.z+1));
        else if(this.IB(node.x, node.y, node.z+1));
        else if(this.ID(node.x, node.y, node.z+1));

        // Est
        if (this.IW(node.x+1,node.y,node.z));
        else if(this.IB(node.x+1, node.y, node.z));
        else if(this.ID(node.x+1, node.y, node.z));

        // Ouest
        if (this.IW(node.x-1,node.y,node.z));
        else if(this.IB(node.x-1, node.y, node.z));
        else if(this.ID(node.x-1, node.y, node.z));
        
        if (this.watch.canTowerUp(node.x, node.y, node.z)) {
            // Coût modéré : sauter et poser un bloc ça demande un petit effort
            this.neighbors.push({ x: node.x, y: node.y + 1, z: node.z, cost: deplacement + poserBloc, action: 'tower' });
            // Nord
            if (this.IJF(node.x, node.y + 1, node.z-1));
            // Sud
            if (this.IJF(node.x, node.y + 1, node.z+1));
            // Est
            if (this.IJF(node.x+1, node.y + 1, node.z));
            // Ouest
            if (this.IJF(node.x-1, node.y + 1, node.z));
        } else if (this.watch.canBreakAndTowerUp(node.x, node.y, node.z)) {
            // Coût élevé : il faut miner, puis sauter, puis poser le bloc
            this.neighbors.push({ x: node.x, y: node.y + 1, z: node.z, cost: deplacement + poserBloc, action: 'break_and_tower', toBreak: [{ x: node.x, y: node.y + 2, z: node.z }]});
        } else if (this.watch.canDigDown(node.x, node.y, node.z)) {
            // Coût élevé : il faut miner le bloc sous nos pieds, tomber, puis éventuellement se relever
            this.neighbors.push({x: node.x, y: node.y - 1, z: node.z, cost: casserBloc, action: 'dig_down', toBreak: [{ x: node.x, y: node.y - 1, z: node.z }]});
        }
        return this.neighbors; 
    }
}

module.exports = Movements;