# Taches à faire dans le dossier Minebot_JS/restart
## Ce dont on part de base :
- la fonction ```js bot.blockAt(pos)```
- de quoi se connecter à un serveur
- version 1.21 de minecraft
## À faire (mettre un ✅ dès que c'est fini)
- faire une fonction ```scan(rayon, block(s))``` qui renvoie la liste des blocks trouvés autour de nous
- ✅ une fonction ```isWalkable(pos)``` qui détermine si le bot peut aller sur le bloc (donc (x,y,z)= air, (x,y+1,z)= air, (x,y-1,z)= solide)
- ✅ une fonction ```isBreakable(pos)``` qui détermine si le bot peut casser le bloc à côté de lui (dans la direction donnée) et le bloc en dessous pour s'y frayer un chemin (checker si le bloc encore au dessus n'est pas de la lave/eau/gravier/sable/enclume ? | et que le bloc encore en dessous est solide)
- (optionnel) ```parcours2blocks(pos)``` et ```parcours3blocks(pos)``` qui checke si on peut sauter de 2/3 blocks devant.
- ✅ une fonction ```getVoisins()``` qui renvoie la liste ordonnée des déplacements possibles (et dire quel déplacement est nécessaire) + donner un coût à chaque voisin (1 pour le sol, 1.5 pour le saut, 1.2 pour creuser sous soi ...)
- faire le A* qui renvoie la liste des déplacements
- faire un programme qui exécute le A* et genre tous les x actions le recalcule

## Infos complémentaires
- Hauteurs max : -64 | 319