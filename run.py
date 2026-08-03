"""竹下问甲 - 甲骨文识别（本地一键启动）"""
import json, os, torch, torchvision, torch.nn as nn
from torchvision import transforms
from PIL import Image
import gradio as gr

# ── 加载模型 ──
MODEL_PATH = os.path.join(os.path.dirname(__file__), "hust-obc-model", "Validation", "max_val_acc.pth")
MAPPING_PATH = os.path.join(os.path.dirname(__file__), "api", "class_to_common.json")
NUM_CLASSES = 1588

with open(MAPPING_PATH, "r", encoding="utf-8") as f:
    class_to_char = json.load(f)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = torchvision.models.resnet50(pretrained=False)
model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)
checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=True)
model.load_state_dict(checkpoint["state_dict"])
model.to(device)
model.eval()
print(f"模型加载成功！设备: {device}, 类别数: {NUM_CLASSES}")

# ── 可读汉字过滤 ──
def is_readable(c: str) -> bool:
    if not c or len(c) != 1: return False
    return 0x4E00 <= ord(c) <= 0x9FFF

# ── 预处理 ──
def preprocess(image: Image.Image) -> torch.Tensor:
    if image.mode != "RGB":
        image = image.convert("RGB")
    w, h = image.size
    # 补白成正方形
    if w > h:
        pad = (w - h)
        image = transforms.Pad([0, pad//2, 0, pad - pad//2], fill=(255,255,255), padding_mode="constant")(image)
    elif h > w:
        pad = (h - w)
        image = transforms.Pad([pad//2, 0, pad - pad//2, 0], fill=(255,255,255), padding_mode="constant")(image)
    transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
        transforms.Normalize([0.85233593, 0.85246795, 0.8517555], [0.31232414, 0.3122127, 0.31273854])
    ])
    return transform(image).unsqueeze(0)

# ── 识别 ──
def recognize(image: Image.Image):
    if image is None:
        return "请上传一张甲骨文图片"

    tensor = preprocess(image).to(device)
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)
        top_probs, top_indices = torch.topk(probs, 50, dim=1)

    results = []
    for i in range(min(3, top_indices.shape[1])):
        idx = str(top_indices[0][i].item())
        char = class_to_char.get(idx, "?")
        conf = round(top_probs[0][i].item() * 100, 2)
        results.append(f"{char} — 置信度 {conf:.1f}%")
    return "\n\n".join(results)

# ── 启动 ──
if __name__ == "__main__":
    demo = gr.Interface(
        fn=recognize,
        inputs=gr.Image(type="pil", label="上传甲骨文图片"),
        outputs=gr.Textbox(label="识别结果", lines=8),
        title="竹下问甲 - 甲骨文识别",
        description="基于 HUST-OBC ResNet50 模型 · 1588 类甲骨文识别 · 准确率 94.6%",
    )
    demo.launch(server_name="127.0.0.1", server_port=7860, share=False)
