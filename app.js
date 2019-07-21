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
		model.notes.push({
			id: id,
			category: category,
			text: note,
			time: new Date().toLocaleString()
		});
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
		let content = `<span class="time">${
			model.notes[idx - 1].time
		}</span><br><p class="note-text">
		${model.notes[idx - 1].text}</p>`;
		noteView.render(content);
	},

	init() {
		view1.init();
	}
};

/*
The view object deals with the DOM initialization
and rendering 
*/
let view1 = {
	init() {
		let addBut = document.querySelector("#add button");
		this.main = document.querySelector("section.note");
		this.temp = document.querySelector("template#addDiv").innerHTML;

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

		noteBut.addEventListener("click", () => {
			if (!note.value) return;
			alpha.addNote(category.value, note.value);
			console.log(category.value);
			console.log(alpha.getNotes());
			this.render();
		});

		returnBtn.addEventListener("click", () => {
			this.render();
		});

		this.noteDiv = document.querySelector("section.note");
		this.temp = document.querySelector("template#addNote").innerHTML;

		this.resize = function() {
			view2.render();
		};

		window.addEventListener("resize", this.resize);
	},

	render() {
		let noteArr = alpha.getNotes();
		this.noteDiv.innerHTML = "";
		let notes = "";
		let upperBound;

		if (window.innerWidth > 360) upperBound = 35;
		else upperBound = 25;
		for (let note of noteArr) {
			let noteTemp = this.temp.replace(
				/{{ brief }}/g,
				note[0].slice(0, upperBound) + "..."
			);
			noteTemp = noteTemp.replace(/{{ time }}/g, note[1]);
			noteTemp = noteTemp.replace(/{{ id }}/g, note[2]);
			notes += noteTemp;
		}
		this.noteDiv.innerHTML = notes;
		noteView.init();
	}
};

let noteView = {
	init() {
		window.removeEventListener("resize", view2.resize);
		this.notes = [...document.querySelectorAll(".note-list")];
		this.noteDiv = view2.noteDiv;
		this.notes.forEach(function(each) {
			each.addEventListener("click", function() {
				alpha.displayText(each);
				console.log(this);
			});
		});
	},

	render(note) {
		this.noteDiv.innerHTML = note;
	}
};
alpha.init();
