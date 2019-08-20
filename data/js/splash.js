class splash {
    constructor(container, name, subname, icon) {
        if (!container.classList)
            return false;

        const tree = [{
            type: "div",
            class: "middle",
            name: "middle",
            list: [{
                type: "div",
                class: "logo",
                name: "logo"
            }, {
                type: "div",
                class: "appname",
                name: "appname"
            }, {
                type: "div",
                class: "appsubname",
                name: "appsubname"
            }, {
                type: "div",
                class: "progressBar",
                name: "progress",
                list: [{
                    type: "div",
                    class: "bar",
                    name: "bar"
                }]
            }, {
                type: "t",
                class: "phase",
                name: "phase"
            }, {
                type: "t",
                class: "status",
                name: "status"
            }, {
                type: "t",
                class: "errormsg",
                name: "errorMsg"
            }, {
                type: "t",
                class: "tips",
                name: "tips"
            }]
        }, {
            type: "div",
            class: "footer",
            name: "footer",
            list: [{
                type: "div",
                class: "icon",
                name: "icon"
            }, {
                type: "div",
                class: "text",
                name: "text"
            }]
        }]

        this.tree = buildElementTree("div", "splash", tree);
        container.insertBefore(this.tree.tree, container.childNodes[0]);
        this.splash = this.tree.tree;

        this.init = async () => {};
        this.postInit = async () => {};
        this.preLoaded = false;
        this.loaded = false;
        this.tree = this.tree.obj;
        this.bar = this.tree.middle.progress.bar;
        this.bar.dataset.color = "blue";
        this.status = this.tree.middle.status;
        this.phase = this.tree.middle.phase;

        // Middle
        this.tree.middle.logo.innerHTML = `
        <div class="lazyload noBackground light inner">
            <img onload="this.parentNode.dataset.loaded = 1" src="${icon}"/>
            <div class="simple-spinner"></div>
        </div>`
        this.tree.middle.appname.innerText = name;
        this.tree.middle.appsubname.innerText = subname;

        // Footer
        this.tree.footer.icon.innerHTML = `
            <div class="lazyload chrome">
                <img onload="this.parentNode.dataset.loaded = 1" src="/data/img/chrome-icon.webp"/>
                <div class="simple-spinner"></div>
            </div>
            <div class="lazyload coccoc">
                <img onload="this.parentNode.dataset.loaded = 1" src="/data/img/coccoc-icon.webp"/>
                <div class="simple-spinner"></div>
            </div>`
        this.tree.footer.text.innerText = "Trang web hoạt động tốt nhất trên trình duyệt chrome và coccoc.";

        this.__preLoadInit();
    }

    __preLoadInit() {
        this.bar.dataset.slow = 30;
        this.preLoaded = false;
        this.status.innerText = "Đang Tải...";
        this.phase.innerText = "Phase 1/3: Page Initialization";

        setTimeout(() => {
            this.bar.style.width = "50%";
        }, 200);

        document.body.onload = () => {
            this.__loadInit();
        }
    }

    async __loadInit() {
        this.bar.dataset.slow = "";
        this.preLoaded = true;
        this.loaded = false;
        this.phase.innerText = "Phase 2/3: Script Initialization";
        this.bar.style.width = `50%`;
        this.tree.middle.tips.innerHTML = `Thử tải lại cứng bằng tổ hợp phím <b>Ctrl + Shift + R</b> hoặc <b>Ctrl + F5</b> nếu có lỗi xảy ra`;

        await this.init((progress = 0, text = "") => {
            if (!this.preLoaded)
                return false;

            this.status.innerText = `${text} [${progress.toFixed(2)}%]`;
            this.bar.style.width = `${50 + progress*0.5}%`;
        }).catch(e => this.__panic(e));

        this.loaded = true;
        await this.__postInit();

        this.bar.style.width = `100%`;
        this.status.innerText = "Đã tải";
        this.splash.classList.add("done");
    }

    async __postInit() {
        this.phase.innerText = "Phase 3/3: Post Initialization";
        this.bar.style.width = `90%`;

        await this.postInit((progress = 0, text = "") => {
            if (!this.loaded)
                return false;
    
            this.status.innerText = `${text} [${progress}%]`;
            this.bar.style.width = `${90 + progress*0.1}%`;
        }).catch(e => this.__panic(e, false));
    }

    __panic(error, stop = true) {
        let e = error.name || `${error.data.data.file}:${error.data.data.line}`;
        let d = error.message || error.data.description;

        this.status.innerText = "Lỗi đã xảy ra";
        this.tree.middle.errorMsg.innerText = `${e}: ${d}`;
        this.bar.dataset.color = "red";
        
        if (stop)
            throw error;
        else
            console.error(error);
    }
}