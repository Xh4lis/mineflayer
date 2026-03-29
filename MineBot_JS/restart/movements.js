class Movements {
    constructor(watch) {
        this.watch = watch;
    }

    // Renvoie toutes les cases accessibles depuis un "node" (nœud)
    getNeighbors(node) {
        const neighbors = [];
        
        // TODO: Vérifier les cases Nord, Sud, Est, Ouest
        // Exemple Nord :
        // Si this.watch.isWalkable(node.x, node.y, node.z - 1) est vrai,
        // alors on l'ajoute à la liste 'neighbors' avec un coût (G) de 1.
        
        // TODO (optionnel) : Ajouter la logique pour les sauts et les chutes

        return neighbors; 
    }
}

module.exports = Movements;