//? |-----------------------------------------------------------------------------------------------|
//? |  /static/js/login.js                                                                          |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

if (localStorage.getItem("display.nightmode") === "true")
	document.body.classList.add("dark");

const login = {
	container: $("#container"),
	splash: $("#splash"),
	left: null,
	right: null,

	/**
	 * Login Panel
	 * @type {HTMLElement}
	 */
	login: null,

	/**
	 * Register Panel
	 * @type {HTMLElement}
	 */
	register: null,

	async init() {
		await updateServerData();

		this.left = makeTree("div", "leftPanel", {
			splash: new lazyload({
				classes: "landing",
				source: "/api/images/landing",
				spinner: "spinner"
			}),

			contestTitle: { tag: "t", class: "title", text: SERVER.contest.name }
		});

		this.login = makeTree("div", "login", {
			info: { tag: "div", class: "userInfo", child: {
				avatar: new lazyload({
					source: `/api/avatar`,
					classes: "avatar"
				}),

				displayName: { tag: "t", class: "displayName", text: "nhập tên người dùng để tiếp tục" },
				close: { tag: "icon", class: "close", data: { icon: "close" } }
			}},

			boxes: { tag: "div", class: "boxes", child: {
				usernameBox: { tag: "div", class: ["box", "username"], child: {
					username: createInput({
						label: "Tên Đăng Nhập",
						required: true,
						autofill: false
					}),
	
					buttons: { tag: "div", class: "buttons", child: {
						login: createButton("tiếp theo", {
							color: "green",
							style: "round",
							complex: true
						}),
						
						register: { tag: "button", class: "text-btn", text: "chưa có tài khoản?" }
					}}
				}},
	
				passwordBox: { tag: "div", class: ["box", "password"], child: {
					password: createInput({
						label: "Mật Khẩu",
						required: true,
						autofill: false
					}),
	
					buttons: { tag: "div", class: "buttons", child: {
						login: createButton("ĐĂNG NHẬP", {
							color: "blue",
							style: "round",
							complex: true
						})
					}}
				}},
	
				completeBox: { tag: "div", class: ["box", "complete"], child: {
					
				}}
			}}
		});

		this.register = makeTree("div", "register", {

		});

		this.right = makeTree("div", "rightPanel", {
			icon: new lazyload({
				classes: "icon",
				source: "/api/images/icon"
			}),

			center: { tag: "div", class: "center", child: {
				action: { tag: "t", class: "action", text: "đăng nhập" },
				description: { tag: "t", class: "description", html: `để tiếp tục tới <b>${SERVER.APPNAME}</b>` },
	
				// note: createNote({
				// 	level: "warning",
				// 	message: "Sample Warning Message",
				// 	style: "round"
				// }),
	
				panels: { tag: "div", class: "panels", child: {
					login: this.login,
					register: this.register
				}}
			}},
		});

		this.container.append(this.left, this.right);
		this.splash.classList.add("hide");
	},

	changePanel(panel) {
		
	}
}

window.addEventListener(
	"DOMContentLoaded",
	() => login.init().catch(console.error)
);