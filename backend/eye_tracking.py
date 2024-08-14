import cv2
import numpy as np

def process_image(image_data):
    # ここでは、簡単な例として画像の中心を返します
    # 実際のアイトラッキング処理はより複雑になります
    image = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
    height, width = image.shape[:2]
    center_x, center_y = width // 2, height // 2
    return {"x": center_x, "y": center_y}