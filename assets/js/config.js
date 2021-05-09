//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/config.js                                                                         |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

popup.init();

const config = {
	container: $("#container"),
	formContainer: $("#formContainer"),
	formSubmit: $("#formSubmit"),
	configContainer: $("#configContainer"),

	configItem: {},
	configTree: {},

    async init() {
		if (localStorage.getItem("display.nightmode") === "true")
        	document.body.classList.add("dark");

		if (window.frameElement)
			document.body.classList.add("embeded");

		new Scrollable(this.container, {
			content: this.formContainer
		});
		
		tooltip.init();
		await sounds.init();
		await this.render();

		this.formContainer.addEventListener("submit", () => this.saveSettings());
	},

	__setTreePath(object, path = [], value) {
		let _p = "";

		for (let p of path) {
			_p += `["${p}"]`;

			if (eval(`typeof object${_p} !== "object"`))
				eval(`object${_p} = {}`);
		}

		eval(`object${_p} = value`);
		return object;
	},

	__render(item, container, path = []) {
		if (item.type) {
			let itemData = {}
			let keyPath = path.join(".");

			switch (item.type) {
				case "text":
				case "textarea":
				case "number": {
					let textInput = createInput({
						type: item.type,
						id: `config.${keyPath}`,
						label: item.label,
						value: item.value,
						color: item.color || "blue",
						required: item.required || false
					})

					if (item.height)
						textInput.input.style.height = item.height + "px";
	
					if (item.step)
						textInput.input.step = item.step;

					textInput.group.classList.add("sound");
					textInput.group.dataset.soundselectsoft = true;
					sounds.applySound(textInput.group);

					itemData = {
						type: item.type,
						node: textInput.group,
						setValue: (value) => textInput.input.value = value,
						getValue: () => (item.type === "number") ? parseInt(textInput.input.value) : textInput.input.value
					}

					break;
				}

				case "editor": {
					let updateTimeout = null;
					let container = document.createElement("div");
					container.classList.add("row", "editorContainer");

					if (item.height)
						container.style.height = `${item.height}px`;

					let editor = new Editor("none", {
						language: item.language,
						value: item.value,
						title: item.label
					});

					let preview = document.createElement("div");
					preview.classList.add("preview");
					preview.innerHTML = "<span></span>";

					container.append(editor.container, preview);
					editor.onScroll(e => preview.scrollTop = (e.target.scrollTop / (e.target.scrollHeight - e.target.offsetHeight)) * (preview.scrollHeight - preview.offsetHeight));
					editor.onInput((value) => {
						clearTimeout(updateTimeout);
						updateTimeout = setTimeout(() => preview.replaceChild(md2html.parse(value), preview.firstChild), 600);
					});

					itemData = {
						type: item.type,
						node: container,
						setValue: (value) => editor.value = value,
						getValue: () => editor.value
					}

					break;
				}
				
				case "checkbox": {
					let switchInput = createCheckbox({
						label: item.label,
						color: item.color || "blue",
						value: item.value
					})

					itemData = {
						type: item.type,
						node: switchInput.group,
						setValue: (value) => switchInput.input.checked = value,
						getValue: () => switchInput.input.checked
					}

					break;
				}

				case "note": {
					container.classList.add("lr", item.level);

					let node = `
						<div class="left">${item.text}</div>
						<div class="right"></div>
					`

					itemData = {
						type: item.type,
						node,
						ignore: true
					}

					break;
				}

				case "image": {
					let node = document.createElement("div");
					node.classList.add("configImageInput");

					let input = document.createElement("input");
					input.type = "file";
					input.id = `config.${keyPath}`;
					input.accept = "image/*";

					let imageContainer = document.createElement("label");
					imageContainer.htmlFor = input.id;
					imageContainer.dataset.soundhover = true;
					imageContainer.dataset.soundselect = true;
					sounds.applySound(imageContainer);

					let lazyloadImage = new lazyload({
						container: imageContainer,
						source: item.api,
						classes: ["imageBox", item.display || "square"]
					});

					let resetButton = document.createElement("button");
					resetButton.type = "button";
					resetButton.classList.add("sq-btn", "pink", "sound");
					resetButton.innerText = "Đặt Lại";
					resetButton.dataset.soundhover = true;
					resetButton.dataset.soundselect = true;
					sounds.applySound(resetButton);
					
					input.addEventListener("change", async e => {
						sounds.confirm(2);
						let file = e.target.files[0];
				
						try {
							await myajax({
								url: item.api,
								method: "POST",
								form: {
									token: API_TOKEN,
									file: file
								}
							})
						} catch(e) { errorHandler(e); sounds.warning() }
				
						e.target.value = "";
						lazyloadImage.src = item.api;
					})
				
					resetButton.addEventListener("mouseup", async () => {
						sounds.notification();
				
						try {
							await myajax({
								url: item.api,
								method: "DELETE",
								header: { token: API_TOKEN }
							})
						} catch(e) { errorHandler(e); sounds.warning() }
				
						lazyloadImage.src = item.api;
					})

					node.append(input, imageContainer, resetButton);

					itemData = {
						type: item.type,
						node,
						ignore: true
					}

					break;
				}

				case "datetime": {
					let node = document.createElement("div");
					node.classList.add("item", "flex-row");

					let dateInput = createInput({
						type: "date",
						id: `config.${keyPath}.date`,
						label: `Ngày`,
						color: item.color || "blue"
					});

					dateInput.group.classList.add("inner");

					let timeInput = createInput({
						type: "time",
						id: `config.${keyPath}.time`,
						label: `Thời Gian`,
						color: item.color || "blue"
					});

					timeInput.group.classList.add("inner");
					timeInput.input.step = 1;

					let setNow = createButton("🕒 Hiện Tại", {
						style: "round",
						complex: true
					});

					setNow.style.marginTop = "10px";
					sounds.applySound(setNow, ["soundhover", "soundselect"]);
					setNow.addEventListener("mouseup", () => setDateTimeValue(dateInput.input, timeInput.input));
					setDateTimeValue(dateInput.input, timeInput.input, item.value);

					node.append(dateInput.group, timeInput.group, setNow);

					itemData = {
						type: item.type,
						node,
						setValue: (value) => setDateTimeValue(dateInput.input, timeInput.input, value),
						getValue: () => getDateTimeValue(dateInput.input, timeInput.input)
					}

					break;
				}

				case "range": {
					let node = document.createElement("div");
					node.classList.add("configRangeInput");
					node.dataset.soundhoversoft = true;

					let previewContainer = document.createElement("div");
					previewContainer.classList.add("lr");

					let previewLabel = document.createElement("t");
					previewLabel.classList.add("left");
					previewLabel.innerText = item.label;

					let previewValue = document.createElement("t");
					previewValue.classList.add("right");

					previewContainer.append(previewLabel, previewValue);

					let input = createSlider({
						color: "blue",
						value: item.value,
						min: item.min,
						max: item.max,
						step: (typeof item.step === "number") ? item.step : 1
					});

					input.onInput((v, e) => {
						let value = (item.valueList) ? item.valueList[v] : v;
				
						previewValue.innerText = `${value} ${item.unit || "ĐV"}`;

						if (e && e.isTrusted)
							tooltip.show(previewValue.innerText, e.target);
				
						if (item.valueWarn) {
							let _p = (item.valueWarn.type === "lower")
								? (value < item.valueWarn.value)
								: (value > item.valueWarn.value);

							input.group.dataset.color = _p ? (item.valueWarn.color || "pink") : "blue";
						}
					});

					node.append(previewContainer, input.group);

					itemData = {
						type: item.type,
						node,
						setValue: (value) => input.setValue(value),
						getValue: () => parseFloat(input.input.value)
					}

					break;
				}

				case "select": {
					let node = document.createElement("div");
					node.classList.add("configSelectInput", "formGroup");
					node.dataset.color = item.color || "blue";
					node.dataset.soundhoversoft = true;

					let input = document.createElement("select");
					input.classList.add("formField");
					input.id = keyPath;

					for (let key of Object.keys(item.options)) {
						let option = document.createElement("option");
						option.value = key;
						option.innerHTML = item.options[key];
						input.appendChild(option);
					}

					let label = document.createElement("label");
					label.classList.add("formLabel");
					label.innerText = item.label;
					label.htmlFor = input.id;

					if (item.value && item.options[item.value])
						input.value = item.value;

					node.append(input, label);

					itemData = {
						type: item.type,
						node,
						setValue: (value) => input.value = value,
						getValue: () => input.value
					}

					break;
				}

				default:
					itemData = {
						type: item.type,
						node: htmlToElement(`<t>Unknown Item Type: ${item.type}</t>`),
						ignore: true
					}
					break;
			}

			itemData.path = path;

			if (item.note)
				container.dataset.tip = item.note;

			if (typeof itemData.node === "object" && itemData.node.classList)
				container.appendChild(itemData.node);
			else
				container.innerHTML += itemData.node;

			this.configItem[keyPath] = itemData;
			this.__setTreePath(this.configTree, path, itemData);
		} else {
			let keysList = Object.keys(item).filter(i => i.substr(0, 2) !== "__");

			for (let key of keysList) {
				let value = item[key];
				value.__key = key;

				if (typeof value !== "object" || key.substr(0, 2) === "__")
					continue;

				let _p = [ ...path ];
				_p.push(key);

				let itemContainer = document.createElement("div");
				itemContainer.dataset.path = _p.join(".");
				
				if (value.__icon && value.__title) {
					itemContainer.classList.add("group", value.__icon);
					itemContainer.innerHTML = `<t class="title">${value.__title}</t>`;
				} else {
					itemContainer.classList.add("item", "sound");
					itemContainer.dataset.soundhoversoft = true;

					if (value.__display)
						itemContainer.classList.add(`flex-${value.__display}`);

					if (value.__title)
						itemContainer.innerHTML = `<t class="title small">${value.__title}</t>`;

					sounds.applySound(itemContainer);
				}

				this.__render(value, itemContainer, _p);
				container.appendChild(itemContainer);
			}
		}
	},

	async render() {
		let request = await myajax({
			url: "/api/config",
			method: "GET",
			query: {
				type: "structure"
			}
		});

		this.configItem = {}
		this.configTree = {}
		emptyNode(this.configContainer);

		this.__render(request.data, this.configContainer);
		await this.updateSettings();
	},

	__setSetting(item, path = []) {
		if (typeof item === "object")
			for (let key of Object.keys(item)) {
				let _p = [ ...path ];
				_p.push(key);

				this.__setSetting(item[key], _p);
			}
		else {
			let keyPath = path.join(".");

			if (this.configItem[keyPath] && !this.configItem[keyPath].ignore)
				this.configItem[keyPath].setValue(item);
		}
	},

	async updateSettings() {
		clog("DEBG", "Updating Settings");

		let request = await myajax({
			url: "/api/config",
			method: "GET"
		});

		this.__setSetting(request.data);
	},

	__getSettings(item = this.configTree, path = []) {
		if (typeof item === "object" && typeof item.getValue !== "function") {
			let value = {}

			for (let key of Object.keys(item)) {
				let i = item[key];

				if (i.ignore)
					continue;

				let _p = [ ...path ];
				_p.push(key);

				value[key] = this.__getSettings(item[key], _p);
			}

			return value;
		} else
			return item.getValue();
	},

	async saveSettings() {
		this.formSubmit.disabled = true;
		let response

		try {
			response = await myajax({
				url: "/api/config",
				method: "POST",
				header: {
					token: API_TOKEN
				},
				json: this.__getSettings()
			});
		} catch(e) {
			errorHandler(e);
			return;
		}

		clog("OKAY", "Thay đổi cài đặt thành công");
		await this.updateSettings();

		this.formSubmit.disabled = false;
		popup.show({
			windowTitle: "Cài Đặt",
			title: "Cài Đặt",
			level: "okay",
			message: "Thay đổi cài đặt thành công",
			description: `Đã thay đổi ${response.data.changed || 0} giá trị`,
			buttonList: {
				close: { text: "ĐÓNG", color: "blue" }
			}
		});
	}
}

document.body.onload = () => config.init().catch(e => errorHandler(e));