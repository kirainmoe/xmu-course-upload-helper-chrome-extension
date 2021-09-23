/**
 * 厦大 course 文件上传助手 (XMU course file uploader)
 * 重写 course.xmu.edu.cn 提交作业页面中的上传逻辑，将基于 Flash 上传文件方案替换为基于 fetch() 的上传方案
 * 
 * @author Yume Akiyama <kirainmoe@gmail.com>
 * @version 1.0.4
 */

// 计算文件大小
const  getFileSize = (fileSizeByte) => {
    let  fileSizeMsg = "";
    if (fileSizeByte < 1048576) fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + "KB";
    else if (fileSizeByte == 1048576) fileSizeMsg = "1MB";
    else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(2) + "MB";
    else if (fileSizeByte > 1048576 && fileSizeByte == 1073741824) fileSizeMsg = "1GB";
    else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) fileSizeMsg = "超过 1GB";
    return fileSizeMsg;
}

// 创建通知
const makeToast = (str) => {
    const toast = document.createElement('div');
    toast.setAttribute('class', 'uploader-toast');
    toast.innerHTML = `<svg viewBox="64 64 896 896" focusable="false" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path></svg> <span>${str}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('move-up'), 4000);
    setTimeout(() => document.body.removeChild(toast), 4500);
};

// 插件执行入口
const pluginBootstrap = () => {
    // 文件上传 Button
    const tray = document.createElement('div');
    tray.setAttribute("class", "xmu-course-uploader-tray");
    tray.setAttribute("title", "已检测到作业提交页面，点击此处打开文件上传窗口。");
    tray.innerHTML = `上传文件`;
    document.body.appendChild(tray);

    // 文件上传窗口
    const uploadWindow = document.createElement('div');
    uploadWindow.setAttribute("class", "xmu-course-uploader-window item-hidden");
    uploadWindow.innerHTML = `
        <div class="window-mask">
            <div class="window-upload">
                <div class="window-header">
                    <span class="window-title">上传文件</span>
                    <span class="window-close">✕</span>
                </div>
                <div class="window-content">
                    <input type="file" class="upload-input" multiple  />
                    <p>待上传的文件 (文件大小不超过 1GB)：</p>
                    <div class="window-file-list">
                        (空)
                    </div>
                    <p class="status"></p>
                </div>
                <div class="window-actions">
                    <button class="action-cancel">取消</button>
                    <button disabled class="action-upload">上传</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(uploadWindow);

    /* 事件绑定 */
    const input = document.querySelector('.upload-input');
    const closeButton = document.querySelector('.window-close');
    const cancelButton = document.querySelector('.action-cancel'),
        uploadButton = document.querySelector('.action-upload'),
        fileList = document.querySelector('.window-file-list');

    // 关闭按钮点击事件
    closeButton.addEventListener('click', () => uploadWindow.classList.add('item-hidden'));
    cancelButton.addEventListener('click', () => uploadWindow.classList.add('item-hidden'));

    // 托盘点击事件
    tray.addEventListener('click', () => uploadWindow.classList.remove('item-hidden'));

    // 上传文件变化，更新上传列表
    input.addEventListener('change', (e) => {
        if (e.target.files.length === 0) {
            fileList.innerHTML = "(空)";
            uploadButton.setAttribute('disabled', true);
        }
        else {
            fileList.innerHTML = '';

            const fragment = document.createDocumentFragment();
            for (let i = 0; i < e.target.files.length; i++) {
                const item = document.createElement('div'),
                    file = e.target.files[i];
                item.setAttribute('class', 'file-item');
                item.innerHTML = `
                    <div class="file-name">${file.name} (${getFileSize(file.size)})</div>
                    <div class="file-status">待上传</div>
                `;
                fragment.append(item);
            }

            fileList.appendChild(fragment);
            uploadButton.removeAttribute('disabled');
        }
    });

    // 文件上传操作
    uploadButton.addEventListener('click', async (e) => {
        const length = input.files.length,
            listItem = document.querySelectorAll('.file-item');
        
        e.target.setAttribute('disabled', true);
        
        const response = [];
        const setState = (index, state, stateStr) => {
            listItem[index].setAttribute('class', 'file-item ' + state);
            listItem[index].querySelector('.file-status').innerHTML = stateStr;
        };

        if (length <= 0)
            return;
        for (let i = 0; i < length; i++) {
            const formData = new FormData();

            formData.append("Filename", input.files[i].name)
            formData.append("folder", "/uploads")
            formData.append("fileext", "*.*")
            formData.append("Upload", "Submit Query")
            formData.append("Filedata", input.files[i]);

            setState(i, 'uploading', '上传中');

            await fetch("/meol/servlet/SerUpload", {
                method: "POST",
                headers: {
                    'X-Requested-With': 'ShockwaveFlash/29.0.0.171'
                },
                credentials: 'same-origin',
                body: formData
            })
                .then(res => res.text())
                .then(res => {
                    setState(i, 'success', '已上传');
                    response.push({
                        filename: input.files[i].name,
                        address:`/meol/${res}`
                    });
                })
                .catch(err => {
                    setState(i, 'failed', '上传失败');
                    console.error(err);
                });
        }

        makeToast(`${response.length} 个文件上传成功，${length - response.length} 个文件上传失败。`);

        // 将服务器返回的地址插入编辑器中
        response.forEach(file => {
            const link = file.address, name = file.filename;
            
            // 检测 iframe 环境：如果当前处于课程页面主页，则需要先选择主 iframe
            let iframe = document;
            if (document.getElementById('mainFrame') !== null)
                iframe = document.getElementById('mainFrame').contentWindow.document;

            // 选择 CKEditor 中的按钮并替换
            iframe = iframe.querySelector('.cke_contents > iframe').contentWindow;
            const uploadItem = document.createElement('p');
            uploadItem.innerHTML = `<a data-cke-saved-href="${link}" href="${link}">${name}</a>`;
            iframe.document.body.appendChild(uploadItem);
        });

        e.target.removeAttribute('disabled');
        uploadWindow.classList.add('item-hidden');
    });

    return {
        openUploadWindow: () => tray.click(),
        // 清理函数：当 iframe 页面变更时，调用此函数
        cleanUp: () => {
            document.body.removeChild(tray);
            document.body.removeChild(uploadWindow);
        }
    };
};


// 检测当前页面是否存在 iframe 从而判断是否包含子页面
const detectSubFrame = () => {
    return document.getElementById('mainFrame');
};

// 检测当前页面是否存在 CKEditor
const getHook = (doc) => {
    return doc.querySelector('.cke_button_file');
}

// 因为 Chrome 插件访问不到 window，无法通过 window.CKEditor.on 在 CKEditor 准备好后 callback
// 因此使用定时器等待 CKEditor 加载完成，执行事件
let pluginInstance = null;
const awaitUntilLoadComplete = (doc) => {
    // 先检测一下是不是在提交作业的页面，防止无意义的 setInterval 对页面性能造成影响
    // 虽然好像并不会有多大的影响……
    if (!doc.querySelector('form[action="write.do.jsp"]'))
        return;

    makeToast("已检测到作业提交页面，点击编辑器或右下角的“上传文件”激活上传窗口。");

    const interval = setInterval(() => {
        let btn = getHook(doc);
        if (!btn)
            return;
        
        pluginInstance = pluginBootstrap();

        const newBtn = doc.createElement('a');
        newBtn.innerHTML = btn.innerHTML + `上传文件`;
        newBtn.title = "上传文件";
        newBtn.addEventListener('click', () => pluginInstance.openUploadWindow());
        
        btn.parentNode.insertBefore(newBtn, btn);
        btn.parentNode.removeChild(btn);

        clearInterval(interval);
    }, 100);
    return interval;
};


(() => {
    const subFrame = detectSubFrame();
    if (!subFrame)
        awaitUntilLoadComplete(document);
    else {
        subFrame.onload = function() {
            // 页面变更时，首先清理
            if (pluginInstance !== null) {
                pluginInstance.cleanUp();
                pluginInstance = null;
            }
            awaitUntilLoadComplete(subFrame.contentWindow.document);
        }
    }
})();
