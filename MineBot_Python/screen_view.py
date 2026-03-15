import cv2
import numpy as np
from PIL import ImageGrab

def capture_ecran():
    print("Démarrage de la capture... Appuie sur 'q' pour arrêter.")
    while True:
        # ImageGrab.grab() fonctionne mieux sur les sessions Wayland/X11 hybrides
        # bbox=(left_x, top_y, right_x, bottom_y)
        screenshot = ImageGrab.grab(bbox=(0, 0, 1920, 1080)) 
        
        # Conversion PIL -> OpenCV
        frame = np.array(screenshot)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        cv2.imshow('IA Vision', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

if __name__ == "__main__":
    try:
        capture_ecran()
    except Exception as e:
        print(f"Erreur : {e}")
    finally:
        cv2.destroyAllWindows()