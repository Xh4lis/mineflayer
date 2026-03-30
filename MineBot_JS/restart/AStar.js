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
        // TODO (voir ce que j'ai dejà fait dans MineBot_JS/node_modules/mineflayer-pathfinder/lib/Astar.js): 
        // 1. Initialiser l'OpenList et le ClosedSet
        const openList = [];
        const closedSet = new Set();

        const startNode = new Node(startX, startY, startZ, null, 0, this.heuristic(startX, startY, startZ, goalX, goalY, goalZ));
        openList.push(startNode);
        // 2. Faire la boucle while
        while (openList.length > 0){
            // ÉTAPE 1 : Trouver le meilleur noeud
            // Cherche dans openList le Node qui a la propriété 'f' la plus petite.
            // (Fais une simple boucle for, et garde l'index du meilleur)
            // Appelle ce noeud 'currentNode' et retire-le de l'openList (avec .splice())
            let bestIndex = 0;
            for (let i = 1; i < openList.length; i++) {
                if (openList[i].f < openList[bestIndex].f) {
                    bestIndex = i;
                }
            }
            const currentNode = openList.splice(bestIndex, 1)[0];

            // ÉTAPE 2 : Condition de victoire
            // Si currentNode.x === goalX ET currentNode.y === goalY ET currentNode.z === goalZ :
            // BINGO ! Tu es arrivé. Il faudra remonter les 'parent' pour créer le chemin, puis le 'return'.
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
            // Ajoute le currentNode au closedSet. 
            // Attention : Un Set en JS compare les références. Ajoute plutôt une chaîne de texte unique :
            // closedSet.add(`${currentNode.x},${currentNode.y},${currentNode.z}`);
            closedSet.add(`${currentNode.x},${currentNode.y},${currentNode.z}`);

            // ÉTAPE 4 : Explorer les voisins
            // Récupère les voisins : const voisins = this.movements.getNeighbors(currentNode);
            const voisins = this.movements.getNeighbors(currentNode);
            
            // ÉTAPE 5 : Traiter chaque voisin (avec une boucle for)
            // Pour chaque 'voisin' :
                // a. S'il est déjà dans le closedSet (vérifie avec sa chaîne de texte), on l'ignore (continue).
                
                // b. Calcule son coût G potentiel : le 'g' du currentNode + le 'cost' du voisin.
                
                // c. Cherche si ce voisin est DÉJÀ dans l'openList (en comparant x, y, z).
                
                // d. Si le voisin N'EST PAS dans l'openList :
                    // Crée un nouveau Node pour lui.
                    // Calcule son 'h' (avec ton heuristique).
                    // Donne-lui son 'g', son 'parent' (le currentNode), et son 'action'/'toBreak'.
                    // Pousse-le dans l'openList !
                    
                // e. S'il EST DEJA dans l'openList, mais que le nouveau G calculé au point (b) est PLUS PETIT que son G actuel :
                // Mets à jour son 'g', recalcule son 'f', et change son 'parent' pour le currentNode (on a trouvé un raccourci !).
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
        // 3. Utiliser this.movements.getNeighbors() pour avancer
        // 4. Retourner un tableau de coordonnées [{x, y, z}, ...] (le chemin final)
        return null;
    }
}

module.exports = AStar;