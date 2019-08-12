/*
The model object stores the note text entered by the user and enables easy accessibility of the data.
*/
let model = {
	id: 0,
	notes: []
};

/*
Alpha is the controller object which serves as the intermediary between the
the model object and the view 
*/
let alpha = {
	addNote(category, note) {
		let id = ++model.id;
		let obj = {
			id: id,
			category: category,
			text: note,
			time: new Date().toLocaleString()
		};
		model.notes.push(obj);
		this.saveNote(obj);
	},

	getNotes() {
		let notes = [];
		for (let items of model.notes) {
			notes.push([items.text, items.time, items.id]);
		}
		return notes;
	},

	displayText(elm) {
		let idx = elm.dataset.id;
		let text = model.notes[idx].text.split(/\n/).join("<br>"),
			time = model.notes[idx].time,
			category = model.notes[idx].category;
		let content = `
			<div class="note-content">
				<i class="fa fa-arrow-left"></i>
				<h3>${category}</h3><span class="time">${time}</span><br>
				<p class="note-text">${text}</p>
				<i class="fa fa-pencil-alt edit-text"></i>
			</div>`;
		console.log(text);
		noteView.render(content);
	},

	// Sets up indexedDB
	setupDB() {
		return new Promise((resolve, reject) => {
			let request = window.indexedDB.open("noteAppDB", 1);

			request.onupgradeneeded = function(e) {
				let db = request.result,
					store = db.createObjectStore("noteStore", {
						keyPath: "id"
					}),
					index = store.createIndex("category", "category", {
						unique: false
					});
			};

			request.onerror = function(e) {
				console.log("There was an error while trying to open the database");
				reject(e.target.errorCode);
			};
			request.onsuccess = function() {
				if (request.readyState == "done") {
					console.log(request.readyState);
					alpha.dbRequest = request;
					resolve();
				}
			};
		});
	},
	// Saves note in indexedDB
	saveNote(noteObj) {
		console.log(this.dbRequest);
		let db = this.dbRequest.result;
		let tx = db.transaction("noteStore", "readwrite");
		let store = tx.objectStore("noteStore");
		let index = store.index("category");

		db.onerror = function(e) {
			console.log("Error: ", e.target.errorCode);
		};

		store.put(noteObj);
		console.log("Success");

		// tx.oncomplete = function() {
		// 	db.close();
		// };
	},

	// Gets available notes from indexedDB
	getDBNotes() {
		return new Promise(resolve => {
			let db = this.dbRequest.result;
			let tx = db.transaction("noteStore", "readwrite");
			let store = tx.objectStore("noteStore");
			let index = store.index("category");

			db.onerror = function(e) {
				console.log("Error: ", e.target.errorCode);
			};

			store.getAll("id");
			let id = store.getAll();

			id.onsuccess = function() {
				console.log(id.result);
				model.notes = id.result;
				let len = model.notes.length;
				model.id = len - 1;
				resolve();
			};
		});

		// tx.oncomplete = function() {
		// 	db.close();
		// };
	},

	init() {
		if (!window.indexedDB) {
			console.log(
				"Sorry, Your browser can not run this application, upgrade to the latest version of your browser"
			);
			return;
		}
		this.setupDB().then(() => {
			console.log("Done with setting things up");
			this.getDBNotes().then(() => view1.init());
		});
	}
};

/*
The view object deals with the DOM initialization
and rendering 
*/
let view1 = {
	init() {
		let addBut = document.querySelector("#add button");
		window.noteDiv = document.querySelector("section.note");
		window.temp = document.querySelector("template#addNote").innerHTML;
		this.main = document.querySelector("section.note");
		this.temp = document.querySelector("template#addDiv").innerHTML;
		if (model.notes[0]) {
			console.log(model.notes);
			view2.render(window.temp);
		}
		addBut.addEventListener("click", () => {
			this.render();
			view2.init();
		});
	},

	render() {
		this.main.innerHTML = this.temp;
	}
};

let view2 = {
	init() {
		let note = document.querySelector(".note-edit textarea");
		let noteBut = document.querySelector(".note-edit button");
		let category = document.querySelector("select.category");
		let returnBtn = document.querySelector("button.return");
		this.temp = document.querySelector("template#addNote").innerHTML;

		noteBut.addEventListener("click", () => {
			if (!note.value) return;
			alpha.addNote(category.value, note.value);
			console.log(category.value);
			console.log(alpha.getNotes());
			this.render();
		});

		returnBtn.addEventListener("click", () => this.render());

		this.resize = function() {
			view2.render();
		};
		window.addEventListener("resize", this.resize);
	},

	//Renders list of notes that have been saved, this function is also re-used in view1
	//to render notes list if there are notes saved in indexedDB
	render(temp = this.temp) {
		let noteArr = alpha.getNotes();
		window.noteDiv.innerHTML = "";
		let notes = "",
			noteTemp;
		let upperBound;

		if (window.innerWidth > 360) upperBound = 35;
		else upperBound = 25;
		for (let note of noteArr) {
			noteTemp = temp.replace(
				/{{ brief }}/g,
				note[0].slice(0, upperBound) + "..."
			);
			noteTemp = noteTemp.replace(/{{ time }}/g, note[1]);
			noteTemp = noteTemp.replace(/{{ id }}/g, note[2]);
			notes += noteTemp;
		}
		window.noteDiv.innerHTML = notes;
		noteView.init();
	}
};

//handles variable initialization and render of note text
let noteView = {
	init() {
		window.removeEventListener("resize", view2.resize);
		this.notes = [...document.querySelectorAll(".note-list")];
		this.returnBtn = document.querySelector("i.fa.fa-arrow-left");
		this.notes.forEach(function(each) {
			each.addEventListener("click", function() {
				alpha.displayText(each);
			});
		});
	},

	init2() {
		this.editIcon = document.querySelector("i.edit-text");
		let text;
		// this.deleteIcon = document.querySelector("");

		this.editIcon.addEventListener("click", () => {
			text = window.noteDiv.innerHTML.split("<br>");
			console.log(text);
			text = text[3].split(/<\s+/);
			console.log(text);
		});
	},

	render(note) {
		window.noteDiv.innerHTML = note;
		document
			.querySelector("i.fa.fa-arrow-left")
			.addEventListener("click", () => view2.render(window.temp));
		this.init2();
	}
};

let noteView2 = {};

alpha.init();
