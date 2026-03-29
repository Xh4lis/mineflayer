class Controller {
    constructor(bot) {
        this.bot = bot; // On a besoin du bot pour le faire bouger
    }

    // Prend le tableau de chemin généré par A* et l'exécute
    async executePath(path) {
        // TODO: 
        // Pour chaque point dans le 'path' :
        // 1. Faire tourner la tête du bot vers le point : this.bot.lookAt(...)
        // 2. Appuyer sur avancer : this.bot.setControlState('forward', true)
        // 3. Attendre d'être assez proche du centre du bloc
        // 4. S'arrêter et passer au bloc suivant
    }
}

module.exports = Controller;