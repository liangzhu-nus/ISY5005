import os
import sys
from langchain_community.llms import OpenAI
from langchain.agents import initialize_agent, AgentType, Tool
from langchain import SerpAPIWrapper
from ImageCaption.predict import get_caption

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
os.environ["OPENAI_API_KEY"] = None
os.environ["OPENAI_BASE_URL"] = "https://aihubmix.com/v1"
os.environ["SERPAPI_API_KEY"] = (
    # add your key
    "1e3c93e0753ac224098370cd71da86150c6609caba6b5aaa307e04b72a5006e1"
)
llm = OpenAI()

STYLE_MAP = {
    "none": "",
    "tech": "technical styled",
    "entertainment": "casual and entertaining styled",
    "life": "slice of life styled",
}

def get_llm_response(
    topic: str,
    description: str,
    wordcount,
    isLiveSearchEnabled,
    selectedPlatform,
    selectedStyle,
) -> str:
    res = ""
    llm = OpenAI()
    if isLiveSearchEnabled:
        res = search_google(topic)
    else:
        res = llm(topic)

    style_adj = STYLE_MAP[selectedStyle]

    if selectedPlatform == "xiaohongshu":
        return get_xiaohongshu_response(wordcount, topic, description, res, style_adj)
    elif selectedPlatform == "x":
        return get_x_response(wordcount, topic, description, res, style_adj)
    elif selectedPlatform == "zhihu":
        return get_zhihu_response(wordcount, topic, description, res, style_adj)
    elif selectedPlatform == "weibo":
        return get_zhihu_response(wordcount, topic, description, res, style_adj)


def get_xiaohongshu_response(wordcount, topic, description, res, style) -> str:
    prompt = (
        f"Please generate a {wordcount}-word {style} paragraph of Little Red Book copy based on the {topic} {description} and {res},"
        + " include emojis, and add a few hashtags at the end of the copy, something like: '#travel'."
    )
    return llm(prompt)


def get_x_response(wordcount, topic, description, res, style) -> str:
    prompt = (
        f"Please generate a {style} paragraph for Twitter based on the {topic} {description} and {res}."
        + " The content is better within 280 characters."
        + " You may add hashtags like '#life'."
    )
    return llm(prompt)


def get_zhihu_response(wordcount, topic, description, res, style) -> str:
    prompt = f"Please generate a {wordcount}-word {style} paragraph of zhihu copy based on the {topic} {description} and {res}."
    return llm(prompt)


def get_weibo_response(wordcount, topic, description, res, style) -> str:
    prompt = (
        f"Please generate a {wordcount}-word {style} paragraph of Weibo copy based on the {topic} {description} and {res}."
        + " You may add hashtags like '#hashtag#'."
    )
    return llm(prompt)


def search_google(topic: str) -> str:
    llm = OpenAI()
    search = SerpAPIWrapper()
    tools = [
        Tool(
            name="Intermediate Answer",
            func=search.run,
            description="useful for when you need to ask with search",
        )
    ]

    self_ask_with_search = initialize_agent(
        tools,
        llm,
        agent=AgentType.SELF_ASK_WITH_SEARCH,
        verbose=True,
        handle_parsing_errors=True,
    )

    return self_ask_with_search(topic)


def beautify_picture_description(description: str, word_count=100) -> str:
    """Polishing according to the image description"""
    prompt = f"Please polish {description} with a word count of {word_count}."
    return llm(prompt)


def get_original_description(pic):
    """Get the original description of the picture, NOTICE:`pic` must be a file in the uploads folder."""
    return get_caption(f"{CURRENT_DIR}/uploads/{pic}")


if __name__ == "__main__":
    llm = OpenAI()
    # print(get_llm_response("openai sora", "llm", 100, False))
    # print(get_llm_response("openai sora", "llm", 100, True))
    print(get_original_description("1.png"))
