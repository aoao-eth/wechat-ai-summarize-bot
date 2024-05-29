<p align="center">
    <h1 align="center">微信群聊总结 AI 助手 (JS and Electron ver)</h1>
</p>
<p align="center">
    <a href="https://github.com/aoao-eth/wechat-ai-summarize-bot/releases/tag/1.1.0">Mac 版下载</a>
</p>
<p align="center">  
    <a href="https://zhinang.ai" target="_blank">
        <img src="https://img.shields.io/badge/Power%20by%20zhinang.ai-green?&labelColor=000&style=for-the-badge&logo=openai" />
    </a>
</p>
<p align="center">  
   本项目由免费白嫖 GPT 的智囊 AI <a href="https://zhinang.ai" target="_blank">https://zhinang.ai</a> 技术支持
</p>

--------

<p align="center">
    <h2 align="center">新版本：桌面应用</h2>
</p>

> 您可使用桌面版来使用，一键监控、总结、发送。也可以使用脚本版，手动运行监控和总结。

下载后直接打开配置 app key 即可运行监控和总结，一键总结，一键发送到群内。

[下载地址（暂时只有 mac 版本）](https://github.com/aoao-eth/wechat-ai-summarize-bot/releases/tag/1.1.0)

如您需要 windows 版本，可以自己构建或者直接代码运行，代码在 app 文件夹中，欢迎构建成功的同学提供 windows 安装包

#### 截图
功能：
* 每日群聊监控和数据统计（界面上实时更新）
* 一键总结，一键查看总结结果，一键发送到群聊
* 聊天记录实时查看，直接发送内容到群聊
* 随时更新的配置，可以配置截取的文本长度和结尾词等
* 机器人状态监控，账号切换


正常运行界面
![image](https://github.com/aoao-eth/wechat-ai-summarize-bot/assets/897401/42857974-8463-4b2f-aba5-145db3d902d5)


点击对话，可以看到实时的对话和对话记录，同时可以直接输入内容对话
![image](https://github.com/aoao-eth/wechat-ai-summarize-bot/assets/897401/fa894592-a797-4d93-bc61-8e7c6482cc8a)


微信登录界面
![image](https://github.com/aoao-eth/wechat-ai-summarize-bot/assets/897401/f267d112-f4c8-4c52-a7d6-4d141a2d2823)


<p align="center">
    <h2 align="center">项目介绍</h2>
</p>
 

本项目是基于微信机器人的微信群聊总结助手，可以帮助群主或管理员自动收集群聊中的聊天记录，并使用 AI 进行总结，最终将其发送到指定的群聊中。

> 这可能是最简单配置可以把完整功能跑起来的项目，因为尝试了几个项目，都不是很能搞得定，所以用 JS 简单封装了下

每次执行 summarize 命令都会生成三个总结文件，分别是：

```
xxx_sumarized.txt # 纯文本总结
xxx_sumarized.png # 总结的图片
xxx_sumarized.mp3 # 总结的语音
```

**提示：使用本项目登录微信可能存在封号的风险，请慎重使用并遵守相关平台的规则。使用本项目意味着您已经充分了解并接受这一风险。**

## 脚本版本运行

1. 安装依赖

```bash
npm install
```

2. 设置 env 环境变量

```bash
cp .env.example .env
```

.env 中有`3`个变量，这`3`个变量中`DIFY_API_KEY`,`PADLOCAL_API_KEY`代表
2个平台，`MONITOR_ROOMS`代表群组名称，接下来会分别介绍如何获取对应变量的值。

3. 获取 PADLOCAL_API_KEY

注册 http://pad-local.com 获取一个七天试用的账号，创建应用，然后在 .env 中填入 api key

```bash
PADLOCAL_API_KEY=puppet_padlocal_xxxxxx
```

4. 获取 DIFY_API_KEY

注册 https://dify.ai 账号
创建一个“文本生成”应用，创建完成后，在应用的“访问 api”菜单中，点击“api 秘钥”，点击生成新的秘钥 ，然后在 .env 中填入此秘钥

```bash
DIFY_API_KEY=xxxxxx
```

之后，在提示词编排中，在下拉框中选择模型“Claude-2”，平台免费送了一些免费的调用次数约 200 次，然后在 Prompt 内容中填入：

```
你是一个中文的群聊总结的助手，你可以为一个微信的群聊记录，提取并总结每个时间段大家在重点讨论的话题内容。

请帮我将给出的群聊内容总结成一个今日的群聊报告，包含不多于10个的话题的总结（如果还有更多话题，可以在后面简单补充）。每个话题包含以下内容：
- 话题名(50字以内，带序号1️⃣2️⃣3️⃣，同时附带热度，以🔥数量表示）
- 参与者(不超过5个人，将重复的人名去重)
- 时间段(从几点到几点)
- 过程(50到200字左右）
- 评价(50字以下)
- 分割线： ------------

另外有以下要求：
1. 每个话题结束使用 ------------ 分割
2. 使用中文冒号
3. 无需大标题
4. 开始给出本群讨论风格的整体评价，例如活跃、太水、太黄、太暴力、话题不集中、无聊诸如此类

最后总结下今日最活跃的前五个发言者。

以下是群聊内容
{{input_content}}
```

注意，还需要将此参数的类型设置成 段落。

点击右上角“发布”。
![](./static/1.jpg)

5. 设置 MONITOR_ROOMS
```bash
MONITOR_ROOMS=群名（目前只支持一个）
```

6. 设置支持命令触发总结的群名
   在群内发送 /summarize 命令，即可触发总结

```bash
#仅限机器人账户发送
/summarize
```

8. 运行微信监控程序

```bash
npm run watch
```

此时会弹出一个二维码，使用微信扫码登录，登录成功后，程序将持续抓取所有群聊的聊天记录，聊天记录会保存在本地文件中，位置在 data/日期文件夹/群名.txt 中，不会上传到任何第三方。

9. 手动运行总结程序
   在每天结束的时候，手动对某个群的内容进行总结

```bash
npm run summarize ./data/2023-08-23/xxx.txt
```

10. 总结语音生成的配置

```bash
# 添加以下两个配置即可开启语音生成
AZURE_TTS_APPKEY=
AZURE_TTS_REGION=
```

开通方式：azure 中的认知服务，找到 Speech 服务，开通后，找到密钥和区域，填入即可。每个月前 50W 字免费，基本不需要付费。

https://portal.azure.com/#view/Microsoft_Azure_ProjectOxford/CognitiveServicesHub/~/SpeechServices

<p align="center">
    <h2 align="center">友情链接</h2>
</p>

- [智囊 AI] https://zhinang.ai/chat
- [Dify.ai] https://dify.ai
- [PadLocal] http://pad-local.com

![Alt](https://repobeats.axiom.co/api/embed/09586a669359cc880471d7928d2512b6e262f76f.svg "Repobeats analytics image")
