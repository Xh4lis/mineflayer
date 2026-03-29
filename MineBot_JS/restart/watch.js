class Watch {
    constructor(bot) {
        this.bot = bot; // On stocke le bot pour pouvoir utiliser ses yeux
    }

    getBlock(x, y, z) {
        // TODO: utiliser this.bot.blockAt(pos) pour retourner le bloc
    }

    // Détermine si le bot peut se tenir sur cette case précise
    isWalkable(x, y, z) {
        // TODO: 
        // 1. Lire le bloc en (x, y, z) (doit être de l'air/traversable)
        // 2. Lire le bloc au-dessus (x, y+1, z) (doit être de l'air)
        // 3. Lire le bloc en-dessous (x, y-1, z) (doit être solide)
        // Retourner true si c'est bon, false sinon.
    }
}

module.exports = Watch;