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
        // distance de Manhattan
        return Math.abs(x - goalX) + Math.abs(y - goalY) + Math.abs(z - goalZ);
    }

    findPath(startX, startY, startZ, goalX, goalY, goalZ) {
        // TODO : faire avec une MinHeap pour optimiser la recherche du meilleur noeud
        // Initialiser l'OpenList et le ClosedSet
        const openList = [];
        const closedSet = new Set();

        const startNode = new Node(startX, startY, startZ, null, 0, this.heuristic(startX, startY, startZ, goalX, goalY, goalZ));
        openList.push(startNode);
        // Faire la boucle while
        while (openList.length > 0){
            // ÉTAPE 1 : Trouver le meilleur noeud
            let bestIndex = 0;
            for (let i = 1; i < openList.length; i++) {
                if (openList[i].f < openList[bestIndex].f) {
                    bestIndex = i;
                }
            }
            const currentNode = openList.splice(bestIndex, 1)[0];

            // ÉTAPE 2 : Condition de victoire
            if (currentNode.x === goalX && currentNode.y === goalY && currentNode.z === goalZ) {
                const path = [];
                let node = currentNode;
                while (node) {
                    path.unshift({ x: node.x, y: node.y, z: node.z, action: node.action, toBreak: node.toBreak });
                    node = node.parent;
                }
                return path;
            }

            // ÉTAPE 3 : Le Cimetière (Closed Set)
            closedSet.add(`${currentNode.x},${currentNode.y},${currentNode.z}`);

            // ÉTAPE 4 : Explorer les voisins
            const voisins = this.movements.getNeighbors(currentNode);
            
            // ÉTAPE 5 : Traiter chaque voisin
            for (const voisin of voisins) {
                const voisinKey = `${voisin.x},${voisin.y},${voisin.z}`;
                if (closedSet.has(voisinKey)) {
                    continue; // Ignorer les voisins déjà explorés
                }

                const gCost = currentNode.g + voisin.cost;

                let openNode = openList.find(node => node.x === voisin.x && node.y === voisin.y && node.z === voisin.z);
                
                if (!openNode) {
                    // Voisin pas encore dans l'openList, on le crée
                    const hCost = this.heuristic(voisin.x, voisin.y, voisin.z, goalX, goalY, goalZ);
                    openNode = new Node(voisin.x, voisin.y, voisin.z, currentNode, gCost, hCost);
                    openNode.action = voisin.action; // Stocker l'action à faire pour arriver à ce voisin
                    openNode.toBreak = voisin.toBreak; // Stocker les blocs à casser si nécessaire
                    openList.push(openNode);
                } else if (gCost < openNode.g) {
                    // On a trouvé un meilleur chemin vers ce voisin
                    openNode.g = gCost;
                    openNode.f = gCost + openNode.h;
                    openNode.parent = currentNode;
                    openNode.action = voisin.action; // Mettre à jour l'action si le chemin change
                    openNode.toBreak = voisin.toBreak; // Mettre à jour les blocs à casser si le chemin change
                }
            }
            
        }
        return null;
    }
}

module.exports = AStar;