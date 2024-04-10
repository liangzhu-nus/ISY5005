from flask import Flask, render_template, request, session, jsonify
import os
# import openai
from flask_cors import CORS
from werkzeug.utils import secure_filename

from llm_agent import (
    get_llm_response,
    beautify_picture_description,
    get_original_description,
)
from pulishers import (
    pubXiaoHongShu, pubTwitter, pubZhihu, pubWeibo
)

app = Flask(__name__)
CORS(app)

# 设置允许上传的文件类型
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# 配置上传文件夹
UPLOAD_FOLDER = "uploads/"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# 确保上传文件夹存在
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/upload", methods=["POST"])
def upload_file():
    print("upload_file")
    # 检查是否有文件在请求中
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]

    # 如果用户没有选择文件，浏览器可能会提交一个没有文件名的空part
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # 为了安全起见，使用 Werkzeug 提供的 secure_filename
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        return (
            jsonify({"message": "File uploaded successfully", "filename": filename}),
            200,
        )
    else:
        return jsonify({"error": "File type not allowed"}), 400


@app.route("/generate-text", methods=["POST"])
def generate_text():
    data = request.get_json()
    topic = data["topic"]
    description = data["description"]
    wordcount = data["wordCount"]
    isLiveSearchEnabled = data["isLiveSearchEnabled"]
    selectedPlatform = data["selectedPlatform"]
    selectedStyle = data["selectedStyle"]
    result = get_llm_response(
        topic,
        description,
        wordcount,
        isLiveSearchEnabled,
        selectedPlatform,
        selectedStyle,
    )
    print(result)
    return jsonify({"result": result})


@app.route("/post-social", methods=["POST"])
def post_social():
    """Post to social media"""
    data = request.get_json()  # 获取发布平台以及发布内容
    content = data["content"]
    title = data["topic"]
    platform = data["platform"]
    # TODO: 请求包含图片名称
    # filename = data["filename"]
    # img_dir = os.path.join(app.config["UPLOAD_FOLDER"], filename)  # 必须是本地的绝对路径！没有文件则设为None
    img_dir = os.path.abspath(os.path.join(app.config["UPLOAD_FOLDER"], "1.png"))  # 测试用
    try:
        if platform == 'xiaohongshu': #图片正文必需 可在前端验证
            pubXiaoHongShu(content, img_dir, title, isPrivate=False)
        elif platform == 'zhihu': #标题正文必需
            pubZhihu(content, title)
        elif platform == 'x': #仅需正文
            pubTwitter(content, img_dir)
        elif platform == 'weibo': #仅需正文
            pubWeibo(content, img_dir)
        else:
            assert not 'reachable', 'Invalid platform'
    except Exception as e:
        return jsonify({"error": e}), 400
    return jsonify({"status": "success"})


@app.route("/get_pic_description", methods=["POST"])
def get_pic_description():
    """img_url: must be a file name in the uploads folder"""
    data = request.get_json()
    img_url = data["img_url"]
    # img_url = "1.png"
    description = get_original_description(img_url)
    return jsonify({"description": beautify_picture_description(description)})


if __name__ == "__main__":
    app.run()
