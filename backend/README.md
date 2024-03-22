要开启实时搜索需要去 https://serpapi.com/ 开通下api-key，有免费额度。在llm_agent.py 中修改 SERPAPI_API_KEY。


## API
| Url                  | 描述                  | Method | 传参            | return             |
| -------------------- | --------------------- | ------ | --------------- | ------------------ |
| /get_pic_description | 获取图片描述          | Post   | pic：<图片地址> | description：<str> |
| /post-social         | 发布到社交平台（RPA） | post   |                 |                    |

