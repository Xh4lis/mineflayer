const casserBloc = 2;
const deplacement = 0.5;
const poserBloc = 1;
class Movements {
    constructor(watch) {
        this.watch = watch;
    }

    // Renvoie toutes les cases accessibles depuis un "node" (nœud)
    getNeighbors(node) {
        console.log("getNeighbors");    

        const neighbors = [];
        
        // Nord
        if (this.watch.isWalkable(node.x, node.y, node.z-1)) {
            neighbors.push({x: node.x, y: node.y, z: node.z-1, cost: deplacement});
            
        }
        else if (this.watch.isBreakable(node.x, node.y, node.z-1)) {
            // On analyse ce qu'il faut casser exactement
            const blocsACasser = [];
            const pieds = this.watch.getBlock(node.x, node.y, node.z-1);
            const tete = this.watch.getBlock(node.x, node.y+1, node.z-1);

            if (pieds.name !== 'air') blocsACasser.push({ x: node.x, y: node.y, z: node.z-1 });
            if (tete.name !== 'air') blocsACasser.push({ x: node.x, y: node.y+1, z: node.z-1 });

            // Le coût dépend du nombre de blocs à casser ! (Casser 2 blocs prend 2x plus de temps)
            const coutTotal = deplacement + (blocsACasser.length*casserBloc); // 1 pour avancer + 5 par bloc à casser

            neighbors.push({ 
                x: node.x, y: node.y, z: node.z-1, 
                cost: coutTotal, 
                action: 'break', 
                toBreak: blocsACasser // On donne la liste des blocs à la pioche !
            });
        }
        else {
            // Descente
            const videPieds = this.watch.getBlock(node.x, node.y, node.z - 1);
            const videTete = this.watch.getBlock(node.x, node.y + 1, node.z - 1);

            if (videPieds && videTete && videPieds.boundingBox === 'empty' && videTete.boundingBox === 'empty') {
                if (this.watch.isWalkable(node.x, node.y - 1, node.z - 1)) { // La case de réception en bas est bonne
                    neighbors.push({ 
                        x: node.x, y: node.y - 1, z: node.z - 1, 
                        cost: deplacement, // Tomber ne coûte pas vraiment d'énergie
                        action: 'drop' 
                    });
                }
            }
        }

        // Sud
        if (this.watch.isWalkable(node.x, node.y, node.z+1)) {
            neighbors.push({x: node.x, y: node.y, z: node.z+1, cost: deplacement});
        }
        else if (this.watch.isBreakable(node.x, node.y, node.z+1)) {
            const blocsACasser = [];
            const pieds = this.watch.getBlock(node.x, node.y, node.z+1);
            const tete = this.watch.getBlock(node.x, node.y+1, node.z+1);
            if (pieds.name !== 'air') blocsACasser.push({ x: node.x, y: node.y, z: node.z+1 });
            if (tete.name !== 'air') blocsACasser.push({ x: node.x, y: node.y+1, z: node.z+1 });
            const coutTotal = deplacement + (blocsACasser.length*casserBloc);
            neighbors.push({ 
                x: node.x, y: node.y, z: node.z+1, 
                cost: coutTotal, 
                action: 'break', 
                toBreak: blocsACasser 
            });
        }
        else {
            // Descente
            const videPieds = this.watch.getBlock(node.x, node.y, node.z + 1);
            const videTete = this.watch.getBlock(node.x, node.y + 1, node.z + 1);

            if (videPieds && videTete && videPieds.boundingBox === 'empty' && videTete.boundingBox === 'empty') {
                if (this.watch.isWalkable(node.x, node.y - 1, node.z + 1)) { // La case de réception en bas est bonne
                    neighbors.push({ 
                        x: node.x, y: node.y - 1, z: node.z + 1, 
                        cost: deplacement, // Tomber ne coûte pas vraiment d'énergie
                        action: 'drop' 
                    });
                }
            } 
        }
        // Est
        if (this.watch.isWalkable(node.x+1, node.y, node.z)) {
            neighbors.push({x: node.x+1, y: node.y, z: node.z, cost: deplacement});
        }
        else if (this.watch.isBreakable(node.x+1, node.y, node.z)) {
            const blocsACasser = [];
            const pieds = this.watch.getBlock(node.x+1, node.y, node.z);
            const tete = this.watch.getBlock(node.x+1, node.y+1, node.z);
            if (pieds.name !== 'air') blocsACasser.push({ x: node.x+1, y: node.y, z: node.z });
            if (tete.name !== 'air') blocsACasser.push({ x: node.x+1, y: node.y+1, z: node.z });
            const coutTotal = deplacement + (blocsACasser.length*casserBloc);
            neighbors.push({ 
                x: node.x+1, y: node.y, z: node.z, 
                cost: coutTotal, 
                action: 'break', 
                toBreak: blocsACasser 
            });
        }
        else {
            // Descente
            const videPieds = this.watch.getBlock(node.x+1, node.y, node.z);
            const videTete = this.watch.getBlock(node.x+1, node.y + 1, node.z);

            if (videPieds && videTete && videPieds.boundingBox === 'empty' && videTete.boundingBox === 'empty') {
                if (this.watch.isWalkable(node.x+1, node.y - 1, node.z)) { // La case de réception en bas est bonne
                    neighbors.push({ 
                        x: node.x+1, y: node.y - 1, z: node.z, 
                        cost: deplacement, // Tomber ne coûte pas vraiment d'énergie
                        action: 'drop' 
                    });
                }
            }
        }
        // Ouest
        if (this.watch.isWalkable(node.x-1, node.y, node.z)) {
            neighbors.push({x: node.x-1, y: node.y, z: node.z, cost: deplacement});
        }
        else if (this.watch.isBreakable(node.x-1, node.y, node.z)) {
            const blocsACasser = [];
            const pieds = this.watch.getBlock(node.x-1, node.y, node.z);
            const tete = this.watch.getBlock(node.x-1, node.y+1, node.z);
            if (pieds.name !== 'air') blocsACasser.push({ x: node.x-1, y: node.y, z: node.z });
            if (tete.name !== 'air') blocsACasser.push({ x: node.x-1, y: node.y+1, z: node.z });
            const coutTotal = deplacement + (blocsACasser.length*casserBloc);
            neighbors.push({ 
                x: node.x-1, y: node.y, z: node.z, 
                cost: coutTotal, 
                action: 'break', 
                toBreak: blocsACasser 
            });
        }
        else {
            // Descente
            const videPieds = this.watch.getBlock(node.x-1, node.y, node.z);
            const videTete = this.watch.getBlock(node.x-1, node.y + 1, node.z);
            if (videPieds && videTete && videPieds.boundingBox === 'empty' && videTete.boundingBox === 'empty') {
                if (this.watch.isWalkable(node.x-1, node.y - 1, node.z)) { // La case de réception en bas est bonne
                    neighbors.push({ 
                        x: node.x-1, y: node.y - 1, z: node.z, 
                        cost: deplacement, // Tomber ne coûte pas vraiment d'énergie
                        action: 'drop' 
                    });
                }
            }
        }
        
        if (this.watch.canTowerUp(node.x, node.y, node.z)) {
            // Coût modéré : sauter et poser un bloc ça demande un petit effort
            neighbors.push({ x: node.x, y: node.y + 1, z: node.z, cost: deplacement + poserBloc, action: 'tower' });
            //Nord
            if (this.watch.isWalkable(node.x, node.y + 1, node.z - 1)) { // La case d'arrivée en hauteur est libre
                neighbors.push({ 
                    x: node.x, y: node.y + 1, z: node.z - 1, 
                    cost: deplacement + 0.5, // Un saut coûte un peu plus d'énergie que marcher
                    action: 'jump' 
                });
            }
            //Sud
            if (this.watch.isWalkable(node.x, node.y + 1, node.z + 1)) { // La case d'arrivée en hauteur est libre
                neighbors.push({ 
                    x: node.x, y: node.y + 1, z: node.z + 1, 
                    cost: deplacement + 0.5, // Un saut coûte un peu plus d'énergie que marcher
                    action: 'jump' 
                });
            }
            //Est
            if (this.watch.isWalkable(node.x + 1, node.y + 1, node.z)) { // La case d'arrivée en hauteur est libre
                neighbors.push({ 
                    x: node.x + 1, y: node.y + 1, z: node.z, 
                    cost: deplacement + 0.5, // Un saut coûte un peu plus d'énergie que marcher
                    action: 'jump' 
                });
            }
            //Ouest
            if (this.watch.isWalkable(node.x - 1, node.y + 1, node.z)) { // La case d'arrivée en hauteur est libre
                neighbors.push({ 
                    x: node.x - 1, y: node.y + 1, z: node.z, 
                    cost: deplacement + 0.5, // Un saut coûte un peu plus d'énergie que marcher
                    action: 'jump' 
                });
            }
        } else if (this.watch.canBreakAndTowerUp(node.x, node.y, node.z)) {
            // Coût élevé : il faut miner, puis sauter, puis poser le bloc
            neighbors.push({ 
                x: node.x, y: node.y + 1, z: node.z, 
                cost: deplacement + poserBloc, // 1 pour casser + 2 pour sauter/poser + 1 de pénalité pour la complexité 
                action: 'break_and_tower',
                toBreak: [{ x: node.x, y: node.y + 2, z: node.z }] // On dit au contrôleur de casser le plafond !
            });
        }




        return neighbors; 
    }
}

module.exports = Movements;