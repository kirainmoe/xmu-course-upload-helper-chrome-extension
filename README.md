# 厦大 course 文件上传助手

用于在不使用 Flash 的情况下，上传文件到 course.xmu.edu.cn 的 Chrome 拓展。目前支持 Google Chrome / 新版 Microsoft Edge 和 Firefox.

- [厦大 course 文件上传助手](#厦大-course-文件上传助手)
  - [(重要) 关于插件无法使用的解决方案](#重要-关于插件无法使用的解决方案)
  - [这是什么？](#这是什么)
  - [使用方法](#使用方法)
    - [在 Google Chrome 上使用](#在-google-chrome-上使用)
    - [在 Microsoft Edge 上使用](#在-microsoft-edge-上使用)
    - [在 Mozilla Firefox 上使用](#在-mozilla-firefox-上使用)
  - [原理](#原理)
  - [兼容性](#兼容性)
  - [Licence](#licence)

## (重要) 关于插件无法使用的解决方案

由于 course 更换域名 （由 course.xmu.edu.cn 更换为 course2.xmu.edu.cn），会导致插件无法正常挂载与使用。请参考下文更新最新版插件即可继续使用，参见 [#2](https://github.com/kirainmoe/xmu-course-upload-helper-chrome-extension/issues/2).

## 这是什么？

众所周知在 2021 年之后，Chrome/Firefox/Edge 都停止了对 Flash 的支持，而你厦这个老旧的 course 平台上传个文件还得用 Flash. 这就造成了以上浏览器的用户今年没法正常提交作业了。而学校给出的解决方案是：

![image.png](https://i.loli.net/2021/03/07/feUvjHmh5R2MydK.png)

好家伙，这个新平台到 2077 年能不能用得上我暂且不关心，但这个让我去下载搜狗浏览器的解决方案，让我想起“大连车务段人人都是高手.jpg”。

于是乎，我就整了这么一个活：

![image.png](https://i.loli.net/2021/03/07/pnqjELmPFdY1xiG.png)

这是一个 Chrome 拓展。它能将 course.xmu.edu.cn 提交作业页面中基于 Flash 上传文件方案，替换为基于 fetch() 的上传方案，使你不需要更换浏览器就能上传和提交你的作业，同时在 Windows / Linux / macOS 下都可以直接提交；效果如图：

![image.png](https://i.loli.net/2021/03/07/8LV9pwlncHQ7G4z.png)

![image.png](https://i.loli.net/2021/03/07/u67mDbfY4HglqyR.png)

![image.png](https://i.loli.net/2021/03/07/8Pn6OSCpJBtalAG.png)

## 使用方法

因为我没办法交 5 刀的注册费，因此没有提交到网上应用商店。因此需要手动加载此插件：

### 在 Google Chrome 上使用

- 首先，[下载](https://github.com/kirainmoe/xmu-course-upload-helper-chrome-extension/archive/main.zip)并解压这个 Repo
  - 你会得到一个名为 xmu-course-upload-helper-chrome-extension-main 的文件夹

![image.png](https://i.loli.net/2021/03/08/WfaNovxlEt95pMQ.png)

- 打开 Chrome，地址栏中输入 `chrome://extensions` 并回车

![image.png](https://i.loli.net/2021/03/08/OgAY3lZ2zNKusCq.png)

- 打开右上角的 “开发者模式”
- 点击 “加载已解压的拓展程序”

![image.png](https://i.loli.net/2021/03/08/ljSrMQnAU3m8oF9.png)

- 打开解压好的文件夹

![image.png](https://i.loli.net/2021/03/08/oS1IfQ2MHJzjkhd.png)

- 启用插件

![image.png](https://i.loli.net/2021/03/08/RqJBemsLPOzVECu.png)

- 大功告成了。从今以后，你在 course 上交作业就不必再劳烦已经入土的 Flash 了。

### 在 Microsoft Edge 上使用

- 首先，[下载](https://github.com/kirainmoe/xmu-course-upload-helper-chrome-extension/archive/main.zip)并解压这个 Repo
  - 你会得到一个名为 xmu-course-upload-helper-chrome-extension-main 的文件夹

- 打开 Edge，在地址栏中输入 `edge://extensions` 并回车
- 打开左下角的 “开发人员模式”
- 点击右上角的 “加载已解压的拓展”

![image.png](https://i.loli.net/2021/03/08/dwhgJPUAmNCox5q.png)

- 打开解压好的文件夹
- 完成

![image.png](https://i.loli.net/2021/03/08/a1BnomAVqwvtZRy.png)

### 在 Mozilla Firefox 上使用

[charlieJ107 维护的 Firefox 版本](https://github.com/charlieJ107/xmu-course-upload-helper-extension/releases/tag/v1.0.3)

## 原理

这并不是通过什么神奇的操作实现的。这个 course 系统用的编辑器 CKEditor 使用了 Flash 来实现无刷新上传文件，这在当年也算是主流的操作。

然而，大人，时代变了。现在用 XMLHttpRequest 和 fetch API 也可以做到无刷新上传文件了。

所以这个插件的原理其实就是：

- 通过 Chrome 的插件 API，向页面里插入一个上传对话框，并替换掉原先的上传。
- 使用 fetch API 和 FormData 重写了上传逻辑。
- 把服务器返回的上传文件地址插入到 CKEditor 中。

就这么简单。

## 兼容性

理论上所有 Chromium 内核的浏览器和 Firefox 都可以兼容。

## Licence

MIT
