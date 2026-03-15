import time
from pynput.keyboard import Key, Controller as KeyboardController
from pynput.mouse import Button, Controller as MouseController

clavier = KeyboardController()
souris = MouseController()

time.sleep(5) #Le temps de cliquer sur la fenêtre
print("========= Controller script started =========")

def avancer(duration):
    print("Action - Z")
    clavier.press("z")
    time.sleep(duration)
    clavier.release("z")

def reculer(duration):
    print("Action - S")
    clavier.press("s")
    time.sleep(duration)
    clavier.release("s")

def gauche(duration):
    print("Action - Q")
    clavier.press("q")
    time.sleep(duration)
    clavier.release("q")

def droite(duration):
    print("Action - D")
    clavier.press("d")
    time.sleep(duration)
    clavier.release("d")

def sneak(duration):
    print("Action - R") #perso j'suis sur R pour sneak, de base c'est shift
    clavier.press("r")
    time.sleep(duration)
    clavier.release("r")

def sauter(duration):
    print("Action - Space")
    clavier.press(Key.space)
    time.sleep(duration) #souvent mettre peu genre 0.1
    clavier.release(Key.space)

def inventaire(duration):
    print("Action - E")
    clavier.press("d")
    time.sleep(duration) #souvent mettre peu genre 0.1
    clavier.release("d")

def left_click(duration):
    print("Action - Click Gauche")
    souris.press(Button.left)
    time.sleep(duration)
    souris.release(Button.left)

def right_click(duration):
    print("Action - Click Droite")
    souris.press(Button.right)
    time.sleep(duration)
    souris.release(Button.right)

def camera (dx, dy):
    # dx : mouvement horizontal (positif = droite, négatif = gauche)
    # dy : mouvement vertical (positif = bas, négatif = haut)
    print(f"Action : Tourne la caméra (X:{dx}, Y:{dy})")
    # Dans Minecraft, on utilise move() pour envoyer un mouvement relatif
    souris.move(dx, dy)
    time.sleep(0.1)



#test 
"""
try:
    # Avance pendant 2 secondes
    avancer(2)
    
    # Tourne la tête à droite (le chiffre dépend de la sensibilité de ton jeu, il faudra tester !)
    tourner_camera(500, 0) 
    time.sleep(1)
    
    # Saute et pose un bloc sous ses pieds
    sauter()
    poser_bloc()
    time.sleep(1)
    
    # Regarde vers le bas et mine pendant 3 secondes
    tourner_camera(0, 500)
    attaquer_ou_miner(3)
    
    print("✅ Séquence terminée.")

except KeyboardInterrupt:
    print("\n🛑 Arrêt d'urgence du script.")
    # Sécurité : on relâche toutes les touches si on coupe le script avec Ctrl+C
    clavier.release('w')
    clavier.release(Key.shift)
    souris.release(Button.left)
"""