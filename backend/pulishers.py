"""
Pulishers using RPA
"""
import platform
from functools import wraps
import tagui as t

# setting up consts
system = platform.system()
if system == "Darwin":
    CTRL = "[cmd]"
else:
    CTRL = "[ctrl]"

XIAOHONGSHU_URL = "https://creator.xiaohongshu.com/publish/publish"
ZHIHU_URL = "https://zhuanlan.zhihu.com/write"
TWITTER_URL = "https://twitter.com/compose/post"
TWEET_LENGTH = 278
WEIBO_URL = "https://m.weibo.cn/compose/"


def forceClose(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            func(*args, **kwargs)
        except Exception as e:
            raise e
        finally:
            t.close()
    return wrapper


@forceClose
def pubXiaoHongShu(
    content,
    img_dir,
    title=None,
    isPrivate=False
):
    '''小红书发布
    必须先发布图片，才能发布文字
    标题可选'''
    t.init(visual_automation=True)
    t.url(XIAOHONGSHU_URL)
    t.wait(3)
    t.keyboard("[esc]")
    t.click('//*[@id="publish-container"]/div/div[1]/div[2]/span')

    t.upload(".upload-input", img_dir)
    if title is not None:
        t.hover('//input[@class="c-input_inner"]')
        t.clipboard(title)
        t.click('//input[@class="c-input_inner"]')
        t.keyboard(CTRL+"v")

    t.clipboard(content)
    t.click('//p[@id="post-textarea"]')

    # hashtags = generate_hash_tag(content)
    # # t.click(354,457)
    # for hashtag in hashtags:
    #     t.click("# 话题")
    #     t.type('//p[@id="post-textarea"]', hashtag)
    #     t.wait(2)
    #     # t.click(354,457)
    #     t.click(492, 579)
    #     t.wait(1)
    #     t.keyboard("[esc]")

    t.keyboard("[enter]")
    t.keyboard(CTRL+"v")

    if isPrivate:
        t.click('//span[text()="私密"]')
    t.click("//span[text()='发布']")
    t.click('//p[@id="post-textarea"]')
    t.keyboard("[enter]")
    # t.close()


@forceClose
def pubZhihu(content, title):
    '''知乎发布
    标题与正文都必需'''
    if not title:
        title = '无标题'
    t.init(visual_automation=True)
    t.url(ZHIHU_URL)
    t.wait(3)
    t.keyboard("[esc]")
    t.focus("Google Chrome")
    t.click('//*[@id="root"]/div/main/div/div[2]/div[2]/div[1]/label/textarea')

    passages = content.splitlines()
    t.focus("Google Chrome")

    # input title
    t.type('//*[@id="root"]/div/main/div/div[2]/div[2]/div[1]/label/textarea', title)

    # input content
    element_identifier = (
        '//*[@id="root"]/div/main/div/div[2]/div[2]/div[2]/div[1]/div/div[1]/div'
    )
    count = 1
    t.click(element_identifier)

    print(f"input H1")
    # t.type(element_identifier + '['+str(count)+']', passages[0]);t.click(750,650);t.keyboard('[enter][enter]')
    t.type(element_identifier + "[" + str(count) + "]", passages[0])
    t.keyboard("[enter]")
    print(f"input H1 done")

    print(f"for loop for content")
    for i in range(1, len(passages)):

        element_identifier = '//*[contains(@class, "Editable-unstyled")]'
        count = t.count(element_identifier)
        t.focus("Google Chrome")
        t.click(element_identifier + "[" + str(count) + "]")
        t.keyboard(CTRL+"[down]")
        t.type(element_identifier + "[" + str(count) + "]", passages[i])
        t.keyboard("[enter]")

    t.focus("Google Chrome")
    t.click("button.css-9dyic7")
    t.click("发布")
    # t.close()


def _processTwitterContent(b_content: bytearray):
    '''处理过长的文本，但应尽量避免使用该函数'''
    start = 0
    messages = []
    while start < len(b_content):
        chunk = b_content[start : start + TWEET_LENGTH]
        while True:
            try:
                msg = chunk.decode("GBK")
            except UnicodeDecodeError:
                chunk = chunk[:-1]
            else:
                break
        messages.append(msg)
        start += len(chunk)

    return messages


@forceClose
def pubTwitter(content, img_dir = None):
    '''X发布
    没有标题，仅内容必需'''
    t.init(visual_automation=True)
    t.url(TWITTER_URL)
    t.wait(3)
    t.keyboard("[esc]")

    if img_dir is not None:
        # Upload Img
        # t.upload("//*[@data-testid='fileInput']",img_dir)
        t.click("//*[@data-testid='fileInput']")
        t.wait(0.5)
        if CTRL == '[cmd]':
            t.keyboard(CTRL+"[shift]g")
        t.keyboard(img_dir + "[enter]")
        t.wait(0.5)

    # Text
    if len(b_content:=content.encode("GBK")) > TWEET_LENGTH:
        messages = _processTwitterContent(b_content)
    else:
        messages = [content]
    t.click("//*[@data-testid='tweetTextarea_0']")

    for i, message in enumerate(messages):
        if i > 0:
            t.click("//*[@data-testid='addButton']")
        # subprocess.run(COPY, text=True, input=message)
        t.clipboard(message)
        t.keyboard(CTRL + "v")
        t.click("//div[@role='tablist']") # re-focus to the input layer, in case of having hashtag at end of content

    t.wait(1)
    t.click("//*[@data-testid='tweetButton']")
    # t.close()


@forceClose
def pubWeibo(content, img_dir=None):
    '''发布微博
    仅需内容，无标题'''
    t.init(visual_automation=True)
    t.url(WEIBO_URL)
    t.wait(3)
    t.keyboard("[esc]")
    t.click("//textarea[1]")
    t.clipboard(content)
    t.keyboard(CTRL+"v")
    t.wait(0.8)
    if img_dir is not None:
        t.click("//label[@for='selectphoto']")
        t.wait(0.5)
        if CTRL == '[cmd]':
            t.keyboard(CTRL+"[shift]g")
        t.keyboard(img_dir + "[enter]")
        t.wait(0.8)

    t.click("//a[@class='m-send-btn']")


if __name__ == "__main__":
    content = """这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段
    测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本
    这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本
    这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本这是一段测试文本
    """
    content2 = "#标签一 #标签二 这是很短的一句话"
    img = r"D:\Desktop\sample.png"
    pubTwitter(content2)
