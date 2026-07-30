"""竹下问甲 - 甲骨文识别 API 服务"""
import json
import os
import io

import torch
import torchvision
import torch.nn as nn
from torchvision import transforms
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ── 配置 ──
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "hust-obc-model", "Validation", "max_val_acc.pth")
MAPPING_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "hust-obc-model", "class_to_char.json")
NUM_CLASSES = 1588

# ── 加载模型 ──
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
class_to_char = {}

def load_model():
    global model, class_to_char
    # 加载类别映射
    with open(MAPPING_PATH, "r", encoding="utf-8") as f:
        class_to_char = json.load(f)
    # 构建 ResNet50
    model = torchvision.models.resnet50(pretrained=False)
    model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)
    checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=True)
    model.load_state_dict(checkpoint["state_dict"])
    model.to(device)
    model.eval()
    print(f"Model loaded on {device}, {NUM_CLASSES} classes")

# ── 图像预处理 (与 HUST-OBC test.py 保持一致) ──
def preprocess(image: Image.Image) -> torch.Tensor:
    # 转 RGB
    if image.mode != "RGB":
        image = image.convert("RGB")
    # 补白填充为正方形
    w, h = image.size
    if w > h:
        pad_top = (w - h) // 2
        pad_bot = w - h - pad_top
        image = transforms.Pad([0, pad_top, 0, pad_bot], fill=(255, 255, 255), padding_mode="constant")(image)
    elif h > w:
        pad_left = (h - w) // 2
        pad_right = h - w - pad_left
        image = transforms.Pad([pad_left, 0, pad_right, 0], fill=(255, 255, 255), padding_mode="constant")(image)
    # 缩放到 128x128 并归一化
    transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
        transforms.Normalize([0.85233593, 0.85246795, 0.8517555],
                             [0.31232414, 0.3122127, 0.31273854])
    ])
    return transform(image).unsqueeze(0)  # 加 batch 维度

# ── 推理 ──
def predict(image: Image.Image, top_k: int = 5):
    tensor = preprocess(image).to(device)
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)
        top_probs, top_indices = torch.topk(probs, top_k, dim=1)
    results = []
    for i in range(top_k):
        idx = str(top_indices[0][i].item())
        char = class_to_char.get(idx, f"?")
        conf = round(top_probs[0][i].item() * 100, 2)
        results.append({"char": char, "confidence": conf, "class_id": int(idx)})
    return results

# ── API 路由 ──
@app.route("/")
def index():
    return jsonify({"service": "BambooOracle OCR", "classes": NUM_CLASSES, "device": str(device)})

@app.route("/recognize", methods=["POST"])
def recognize():
    if "image" not in request.files:
        return jsonify({"error": "请上传图片字段 'image'"}), 400
    file = request.files["image"]
    try:
        image = Image.open(io.BytesIO(file.read()))
        results = predict(image, top_k=5)
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── 启动 ──
if __name__ == "__main__":
    load_model()
    app.run(host="0.0.0.0", port=5000, debug=False)
