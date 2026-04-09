class MinHeap {
    constructor() {
        this.heap = [];
    }

    get size() { return this.heap.length; }

    #parent(i)     { return Math.floor((i - 1) / 2); }
    #leftChild(i)  { return 2 * i + 1; }
    #rightChild(i) { return 2 * i + 2; }
    #swap(i, j)    { [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]; }

    insert(node) {
        this.heap.push(node);
        this.#bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.#bubbleDown(0);
        return min;
    }

    update(node) {
        const i = this.heap.indexOf(node);
        if (i !== -1) this.#bubbleUp(i);
    }

    #bubbleUp(i) {
        while (i > 0) {
            const p = this.#parent(i);
            if (this.heap[i].f < this.heap[p].f) {
                this.#swap(i, p);
                i = p;
            } else break;
        }
    }

    #bubbleDown(i) {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = this.#leftChild(i);
            const r = this.#rightChild(i);
            if (l < n && this.heap[l].f < this.heap[smallest].f) smallest = l;
            if (r < n && this.heap[r].f < this.heap[smallest].f) smallest = r;
            if (smallest !== i) {
                this.#swap(i, smallest);
                i = smallest;
            } else break;
        }
    }
}


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
        const openList = new MinHeap();
        const openMap  = new Map();   
        const closedSet = new Set();

        const startNode = new Node(
            startX, startY, startZ,
            null, 0,
            this.heuristic(startX, startY, startZ, goalX, goalY, goalZ)
        );
        openList.insert(startNode);
        openMap.set(`${startX},${startY},${startZ}`, startNode);

        while (openList.size > 0) {

            const currentNode = openList.extractMin();
            const currentKey  = `${currentNode.x},${currentNode.y},${currentNode.z}`;
            openMap.delete(currentKey);

            if (currentNode.x === goalX && currentNode.y === goalY && currentNode.z === goalZ) {
                const path = [];
                let node = currentNode;
                while (node) {
                    path.unshift({ x: node.x, y: node.y, z: node.z, action: node.action, toBreak: node.toBreak });
                    node = node.parent;
                }
                return path;
            }

            closedSet.add(currentKey);

            const voisins = this.movements.getNeighbors(currentNode);

            for (const voisin of voisins) {
                const voisinKey = `${voisin.x},${voisin.y},${voisin.z}`;

                if (closedSet.has(voisinKey)) continue;

                const gCost   = currentNode.g + voisin.cost;
                const openNode = openMap.get(voisinKey); 

                if (!openNode) {
                    const hCost = this.heuristic(voisin.x, voisin.y, voisin.z, goalX, goalY, goalZ);
                    const newNode = new Node(voisin.x, voisin.y, voisin.z, currentNode, gCost, hCost);
                    newNode.action  = voisin.action;
                    newNode.toBreak = voisin.toBreak;
                    openList.insert(newNode); 
                    openMap.set(voisinKey, newNode);

                } else if (gCost < openNode.g) {
                    openNode.g      = gCost;
                    openNode.f      = gCost + openNode.h;
                    openNode.parent = currentNode;
                    openNode.action  = voisin.action;
                    openNode.toBreak = voisin.toBreak;
                    openList.update(openNode);  
                }
            }
        }

        return null;
    }
}

module.exports = { AStar, MinHeap };
