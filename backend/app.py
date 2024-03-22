from flask import Flask, render_template, request, session, jsonify
import os
import openai
from flask_cors import CORS
from llm_agent import (
    get_llm_response,
    beautify_picture_description,
    get_original_description,
)

app = Flask(__name__)
CORS(app)


@app.route("/generate-text", methods=["POST"])
def generate_text():
    data = request.get_json()
    topic = data["topic"]
    description = data["description"]
    wordcount = data["wordCount"]
    isLiveSearchEnabled = data["isLiveSearchEnabled"]
    result = get_llm_response(topic, description, wordcount, isLiveSearchEnabled)
    print(result)
    return jsonify({"result": result})


@app.route("/post-social", methods=["POST"])
def post_social():
    data = request.get_json()
    # RPA code here

    # return jsonify({"result": result})


@app.route("/get_pic_description", methods=["POST"])
def get_pic_description():
    data = request.get_json()
    img_url = data["img_url"]
    description = get_original_description(img_url)
    return jsonify({"description": beautify_picture_description(description)})


if __name__ == "__main__":
    app.run()
