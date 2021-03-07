/**
 * XMU course file uploader - 厦大 course 文件上传助手
 * 将 course.xmu.edu.cn 提交作业页面中基于 Flash 上传文件方案，替换为基于 fetch() 的上传方案
 * 
 * @author Yume Akiyama <kirainmoe@gmail.com>
 */
(() => {
    console.log("[Info] XMU course file uploader extension is running.");

    // 托盘
    const tray = document.createElement('div');
    tray.setAttribute("class", "xmu-course-uploader-tray");
    tray.setAttribute("title", "打开文件上传窗口");
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

    // 关闭按钮点击
    closeButton.addEventListener('click', () => uploadWindow.classList.add('item-hidden'));
    cancelButton.addEventListener('click', () => uploadWindow.classList.add('item-hidden'));

    // 托盘点击
    tray.addEventListener('click', () => {
        uploadWindow.classList.remove('item-hidden');
    });
    // 上传文件变化
    input.addEventListener('change', (e) => {
        if (e.target.files.length === 0) {
            fileList.innerHTML = "(空)";
            uploadButton.setAttribute('disabled', true);
            return;
        } else {
            fileList.innerHTML = '';

            const fragment = document.createDocumentFragment();
            for (let i = 0; i < e.target.files.length; i++) {
                const item = document.createElement('div'),
                    file = e.target.files[i];
                item.setAttribute('class', 'file-item');
                item.innerHTML = `
                    <div class="file-name">${file.name}</div>
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

            await fetch("http://course.xmu.edu.cn/meol/servlet/SerUpload", {
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
                        address:`http://course.xmu.edu.cn/meol/${res}`
                    });
                })
                .catch(err => {
                    setState(i, 'failed', '上传失败');
                    console.error(err);
                });
        }

        response.forEach(file => {
            const link = file.address, name = file.filename;
            const iframe = document.querySelector('.cke_contents > iframe').contentWindow;
            const uploadItem = document.createElement('p');
            uploadItem.innerHTML = `<a data-cke-saved-href="${link}" href="${link}">${name}</a>`;
            iframe.document.body.appendChild(uploadItem);
        });

        e.target.removeAttribute('disabled');
        uploadWindow.classList.add('item-hidden');
    });

    // 替换原有的事件
    const interval = setInterval(() => {
        const btn = document.querySelector('.cke_button_file');
        if (!btn)
            return;
        const newBtn = document.createElement('a');
        newBtn.innerHTML = btn.innerHTML + `上传文件`;
        btn.parentNode.insertBefore(newBtn, btn);
        btn.parentNode.removeChild(btn);
        newBtn.title = "上传文件";
        newBtn.addEventListener('click', (e) => {
            tray.click();
        });
        clearInterval(interval);
    }, 100);
})();
