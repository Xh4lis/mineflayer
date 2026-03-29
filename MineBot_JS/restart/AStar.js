// Ta classe Node basique pour stocker les infos d'une case
class Node {
    constructor(x, y, z, parent = null, g = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.parent = parent;
        this.g = g;
        this.h = h;
        this.f = g + h;
    }
}

class AStar {
    constructor(movements) {
        this.movements = movements;
    }

    heuristic(x, y, z, goalX, goalY, goalZ) {
        // TODO: Coder la distance de Manhattan
    }

    // Le cœur de l'algorithme
    findPath(startX, startY, startZ, goalX, goalY, goalZ) {
        // TODO (voir ce que j'ai dejà fait dans MineBot_JS/node_modules/mineflayer-pathfinder/lib/Astar.js): 
        // 1. Initialiser l'OpenList et le ClosedSet
        // 2. Faire la boucle while
        // 3. Utiliser this.movements.getNeighbors() pour avancer
        // 4. Retourner un tableau de coordonnées [{x, y, z}, ...] (le chemin final)
    }
}

module.exports = AStar;