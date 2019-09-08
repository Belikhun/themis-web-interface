//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/account.js                                                                        |
//? |                                                                                               |
//? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const sbar = new statusBar(document.body);
sbar.additem(USERNAME, "account", {space: false, aligin: "left"});

document.__onclog = (type, ts, msg) => {
    type = type.toLowerCase();
    const typelist = ["okay", "warn", "errr", "crit", "lcnt"]
    if (typelist.indexOf(type) === -1)
        return false;

    sbar.msg(type, msg, {time: ts, lock: (type === "crit" || type === "lcnt") ? true : false});
}

$("body").onload = e => {
    if (cookie.get("__darkMode") === "true")
        document.body.classList.add("dark");

    if (window.frameElement)
        document.body.classList.add("embeded");

    account.init()
    sounds.init();
}

const account = {
    container: $("#accountContainer"),

    async init() {
        await this.reload();
    },

    async reload() {
        let response = await myajax({
            url: "/api/account/get",
            method: "POST",
            form: { token: API_TOKEN }
        })

        this.container.innerHTML = "";
        let html = "";
        let data = response.data;

        for (let key of Object.keys(data)) {
            let userData = data[key];

            html += `
                <div class="group user sound" data-soundhover data-edit-target="${userData["username"]}">
                    <div class="item accountInfo">
                        <span class="lazyload avatar">
                            <img onload="this.parentNode.dataset.loaded = 1" src="/api/avatar?u=${userData["username"]}"/>
                            <div class="simple-spinner"></div>
                        </span>
                        <ul class="info">
                            <li class="id">${userData["username"]}#${userData["id"]}</li>
                            <li class="name">${userData["name"]}</li>
                        </ul>
                        <span class="button">
                            <span class="delete sound" data-soundhover data-soundselect onclick="account.delete(this.parentElement.parentElement.parentElement)"></span>
                            <span class="edit sound" data-soundhover data-soundselect onclick="account.edit(this.parentElement.parentElement.parentElement)"></span>
                        </span>
                    </div>
                    <div class="accountEditor"></div>
                </div>
            `
        }

        this.container.innerHTML = html;
        sounds.scan();
    },

    async edit(targetElement) {
        let username = targetElement.dataset.editTarget;
        let container = fcfn(targetElement, "accountEditor");

        clog("INFO", "Editing user", username);

        let htmlTemplate = `
            <form class="editor" action="javascript:void(0);">

                <input type="file" class="avatarInput" id="userAvatar_${username}" accept="image/*">
                <label class="lazyload column avatar sound avatarImageContainer" data-soundhover data-soundselect for="userAvatar_${username}">
                    <img class="avatarImage" onload="this.parentNode.dataset.loaded = 1" src="/api/avatar?u=${username}"/>
                    <div class="simple-spinner"></div>
                </label>

                <span class="column grow">
                    <div class="row">
                        <div class="formgroup blue sound userID" data-soundselectsoft>
                            <input id="userID_${username}" type="text" class="formfield" autocomplete="off" placeholder="ID" required>
                            <label for="userID_${username}" class="formlabel">ID</label>
                        </div>

                        <div class="formgroup blue sound username" data-soundselectsoft>
                            <input id="userUsername_${username}" type="text" class="formfield" autocomplete="off" placeholder="Tên người dùng" required>
                            <label for="userUsername_${username}" class="formlabel">Tên người dùng</label>
                        </div>
                    </div>
                    
                    <div class="row formgroup blue sound" data-soundselectsoft>
                        <input id="userPassword_${username}" type="text" class="formfield" autocomplete="off" placeholder="Mật khẩu">
                        <label for="userPassword_${username}" class="formlabel">Mật khẩu</label>
                    </div>

                    <div class="row formgroup blue sound" data-soundselectsoft>
                        <input id="userName_${username}" type="text" class="formfield" autocomplete="off" placeholder="Tên" required>
                        <label for="userName_${username}" class="formlabel">Tên</label>
                    </div>
                </span>

                <span class="column">
                    <button class="submitButton row sq-btn blue sound" data-soundhover data-soundselect>Lưu</button>
                    <button class="cancelButton row sq-btn red sound" type="button" data-soundhover data-soundselect>Hủy</button>
                </span>
            </form>
        `
        
        container.innerHTML = htmlTemplate;
        sounds.scan();
        container.parentElement.classList.add("showEditor");
        sounds.toggle(0);

        var avatarInput = $(`#userAvatar_${username}`);
        var avatarPreviewContainer = fcfn(container, "avatarImageContainer");
        var avatarPreview = fcfn(container, "avatarImage");
        
        var userIDInput = $(`#userID_${username}`);
        var usernameInput = $(`#userUsername_${username}`);
        var passwordInput = $(`#userPassword_${username}`);
        var nameInput = $(`#userName_${username}`);

        let submitButton = fcfn(container, "submitButton");
        let cancelButton = fcfn(container, "cancelButton");

        cancelButton.addEventListener("mouseup", e => {
            container.parentElement.classList.remove("showEditor");
            sounds.toggle(1);
        });

        let response = await myajax({
            url: "/api/account/get",
            method: "POST",
            form: {
                u: username,
                token: API_TOKEN
            }
        })

        let passwordPlaceholder = "ĐÃ BỊ MÃ HÓA!!!";
        let data = response.data;
        userIDInput.value = data.id;
        usernameInput.value = data.username;
        usernameInput.disabled = true;
        nameInput.value = data.name;
        
        if (data.password.substring(0, 4) === "$2y$") {
            passwordInput.value = passwordPlaceholder;
            passwordInput.onclick = e => {
                if (e.target.value === passwordPlaceholder)
                    e.target.value = "";
                
                e.target.onclick = null;
            }
        } else
            passwordInput.value = data.password;

        // Set up events
        avatarInput.addEventListener("change", e => {
            avatarPreviewContainer.removeAttribute("dataset-loaded");
            avatarPreview.src = URL.createObjectURL(e.target.files[0]);
        });

        submitButton.addEventListener("mouseup", async e => {
            let data = {
                id: userIDInput.value,
                n: nameInput.value
            }

            if (passwordInput.value !== passwordPlaceholder && passwordInput.value !== "" && passwordInput.value.substring(0, 4) !== "$2y$")
                data.p = passwordInput.value;

            if (avatarInput.files[0])
                data.avatar = avatarInput.files[0];

            let response = await myajax({
                url: "/api/account/edit",
                method: "POST",
                form: {
                    u: username,
                    token: API_TOKEN,
                    ...data
                }
            })

            this.reload();
        })
    },

    async delete(targetElement) {
        let username = targetElement.dataset.editTarget;

        let doIt = confirm(`Bạn có chắc muốn xóa người dùng ${username} không?\nHành động này không thể hoàn tác một khi đã thực hiện!`);

        if (doIt !== true)
            return false;

        clog("WARN", "Đang xóa người dùng", {
            text: username,
            color: flatc("yellow")
        });

        let respond = await myajax({
            url: "/api/account/remove",
            method: "POST",
            form: {
                u: username,
                token: API_TOKEN
            }
        })

        clog("OKAY", "Đã xóa người dùng", {
            text: username,
            color: flatc("yellow")
        });
    }
}

window.reloadAccountList = () => account.reload();