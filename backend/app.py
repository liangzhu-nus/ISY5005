from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS

from llm_agent import (
    get_llm_response,
    beautify_picture_description,
    get_original_description,
)
from pulishers import (
    pubXiaoHongShu, pubTwitter, pubZhihu, pubWeibo
)

# Initialize Flask application
app = Flask(__name__, static_folder='uploads')
CORS(app)

# Define the allowed extensions for uploaded files
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# Configure the folder to store uploads
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Function to check allowed file types
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Route to upload files
@app.route("/upload", methods=["POST"])
def upload_file():
    print("upload_file")
    # Check if there is a file in the request
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]

    # If the user does not select a file, the browser may submit an empty part without a filename
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # If a file is present and allowed, save it securely
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # Construct the URL for the uploaded file
        url = f"http://127.0.0.1:5000/uploads/{filename}"  # Adjust this to your server's URL and port
        return jsonify({
            "message": "File uploaded successfully",
            "filename": filename,
            "url": url  # Return the URL that points to the Flask route serving the file
        }), 200
    else:
        return jsonify({"error": "File type not allowed"}), 400

@app.route("/generate-text", methods=["POST"])
def generate_text():
    data = request.get_json()
    topic = data["topic"]
    description = data["description"]
    wordcount = data["wordCount"]
    isLiveSearchEnabled = data["isLiveSearchEnabled"]
    isGenDescEnabled = data["isGenDescEnabled"]
    selectedPlatform = data["selectedPlatform"]
    selectedStyle = data["selectedStyle"]
    
    if isGenDescEnabled:
        filename = data['filename'] # must be a file name in the uploads folder
        description = get_original_description(filename).strip('\n')
        # description = beautify_picture_description(description)
    
    result = get_llm_response(
        topic,
        description,
        wordcount,
        isLiveSearchEnabled,
        selectedPlatform,
        selectedStyle,
    )
    result = result.strip('\n "')
    return jsonify({"result": result, "desc":description})


@app.route("/post-social", methods=["POST"])
def post_social():
    """Post to social media"""
    data = request.get_json()  # 获取发布平台以及发布内容
    content = data["content"]
    title = data["topic"]
    platform = data["platform"]
    filename = data["filename"]
    if filename == "":  # 没有文件设为None
        img_dir = None
    else:  # 必须是本地的绝对路径
        img_dir = os.path.join(CURRENT_DIR, app.config["UPLOAD_FOLDER"], filename)
    # img_dir = os.path.abspath(os.path.join(app.config["UPLOAD_FOLDER"], "1.png"))
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

# def get_pic_description():
#     """filename: must be a file name in the uploads folder"""
#     data = request.get_json()
#     filename = data["filename"]
#     # img_url = "1.png"
#     description = get_original_description(filename)
#     return jsonify({"description": beautify_picture_description(description)})

# Start the Flask application
if __name__ == "__main__":
    app.run(debug=True, port=5000)
