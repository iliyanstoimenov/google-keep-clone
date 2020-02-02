class App {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem("notes")) || [], //read the notes from local storage
        //initialize constructor with title, text & id
        this.title = "";
        this.text = "";
        this.id = "";
        
        this.$form = document.querySelector("#form"); //grab the form element in the html ($)
        this.$noteTitle = document.querySelector("#note-title");
        this.$noteText = document.querySelector("#note-text");
        this.$placeholder = document.querySelector("#placeholder");
        this.$formButtons = document.querySelector("#form-buttons");
        this.$notes = document.querySelector("#notes");
        this.$closeButton = document.querySelector("#form-close-button");
        this.$modal = document.querySelector(".modal"); //here modal is with CLASS, not with id
        this.$modalTitle = document.querySelector(".modal-title");
        this.$modalText = document.querySelector(".modal-text");
        this.$modalCloseButton = document.querySelector(".modal-close-button");
        this.$toolbarDelete = document.querySelector(".toolbar-delete");
        this.$colorTooltip = document.querySelector("#color-tooltip"); //select color tooltip


        this.addEventListeners(); //initialize the event listeners
        if (this.notes.length) this.displayNotes(); //show notes when initializing the application
    };

    addEventListeners() { //function for event listeners
        document.body.addEventListener("click", event => { //event for clicking on the form
            this.handleFormClick(event);
            this.selectNote(event); //first function is to selectNote and then open modal (otherwise it does not work)
            this.openModal(event);
            this.deleteNote(event);
        });

        this.$colorTooltip.addEventListener("click", event => {
            const color = event.target.dataset.color;
            if (color) {
                this.editNoteColor(color);
            }
        });

        this.$form.addEventListener("submit", event => { //event for clicking submit
            event.preventDefault(); //prevents the page to be refreshed once user clicks on submit

            const title = this.$noteTitle.value; //get the title value
            const text = this.$noteText.value; //get the title text value           
            const hasNote = title || text; //check if either has been filled in

            if (hasNote) {                  // if yes, then call addNote function
                this.addNote({ title, text });
            }
        })

        this.$closeButton.addEventListener("click", event => {
            event.stopPropagation();
            this.closeForm();
        })

        
        this.$modalCloseButton.addEventListener("click", event => {
            this.closeModal(event);
        });

        document.body.addEventListener("mouseover", event => {    
            this.openTooltip(event);
        })

        document.body.addEventListener("mouseout", event => {
            this.closeTooltip(event);
        });

        this.$colorTooltip.addEventListener("mouseover", function() {
            this.style.display = "flex";
        });
      
        this.$colorTooltip.addEventListener("mouseout", function() {
            this.style.display = "none";
        });

    };

    handleFormClick(event) {
        const isFormClicked = this.$form.contains(event.target); //checks if event.target is in the form element
        
        const title = this.$noteTitle.value; //get the title value
        const text = this.$noteText.value; //get the title text value
        const hasNote = title || text; //check if either has been filled in

        if (isFormClicked) {
            this.openForm(); //open form
        } else if (hasNote) {
            this.addNote({ title, text })
        } else {
            this.closeForm() //close form
        }
    };

    openForm() {
        this.$form.classList.add("form-open"); //style with box-shadow
        this.$noteTitle.style.display = "block"; // display the contents
        this.$formButtons.style.display = "block" // display the contents
    };

    closeForm() {
        this.$form.classList.remove("form-open"); // remove style with box-shadow
        this.$noteTitle.style.display = "none"; // set display to none
        this.$formButtons.style.display = "none"; // set display to none
        this.$noteTitle.value = ""; //clear the contents in the input fields
        this.$noteText.value = "";
    };

    addNote({ title, text }) { //function to handle submit event
        const newNote = { //create new object for new note (title, text, color & id)
            title: title,
            text: text,
            color: "white",
            id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 1
        }
        this.notes = [...this.notes, newNote]; //update notes object with newNote

        this.saveNote(); //call saveNote function to save to storage
        this.displayNotes(); //update display notes function
        this.closeForm();
    }

    saveNote() {
        localStorage.setItem("notes", JSON.stringify(this.notes)) //save to local storage in browser
    };

    displayNotes() { //logic for displaying individual notes
        const hasNote = this.notes.length > 0; //check if there are any notes
        this.$placeholder.style.display = hasNote ? "none" : "flex"; //if hasNote=true then display them

        //map over the notes to display them with innerHTML
        this.$notes.innerHTML = this.notes.map(note => `
            <div style="background: ${note.color};" class="note" data-id="${
            note.id
            }">
                <div class="${note.title && "note-title"}">${note.title}</div>
                <div class="note-text">${note.text}</div>
                <div class="toolbar-container">
                    <div class="toolbar">
                        <img class="toolbar-color" data-id=${note.id} src="https://icon.now.sh/palette">
                        <img data-id=${note.id} class="toolbar-delete" src="https://icon.now.sh/delete">
                    </div>
                </div>
            </div>
        `)
    .join("");
    };

    openModal() {
        if (event.target.matches('.toolbar-delete')) return; //do not open modal if toolbar delete is selected

        if (event.target.closest(".note")) { //select closest element to note
            this.$modal.classList.toggle("open-modal"); //toggle to add Class
            this.$modalTitle.value = this.title; //update the values of title & text
            this.$modalText.value = this.text;
        }
    }

    closeModal() {
        this.editNote();
        this.$modal.classList.toggle("open-modal");
    }

    selectNote() {
        const $selectedNote = event.target.closest('.note');

        if (!$selectedNote) return;
        const [$noteTitle, $noteText] = $selectedNote.children;
        this.title = $noteTitle.innerText;
        this.text = $noteText.innerText;
        this.id = $selectedNote.dataset.id;
    }

    editNote() {
        const title = this.$modalTitle.value;
        const text = this.$modalText.value;
        this.notes = this.notes.map(note =>
            note.id === Number(this.id) ? { ...note, title, text } : note
        );
        this.displayNotes();
    }

    editNoteColor(color) {
        this.notes = this.notes.map(note =>
            note.id === Number(this.id) ? { ...note, color } : note
        );
        this.saveNote();
        this.displayNotes();
    }

    deleteNote(event) {
        event.stopPropagation();
        if (!event.target.matches('.toolbar-delete')) return;

        const id = event.target.dataset.id;
        this.notes = this.notes.filter(note => note.id !== Number(id));
        this.saveNote();
        this.displayNotes();
    }

    openTooltip(event) {
        if (!event.target.matches(".toolbar-color")) return;
        this.id = event.target.nextElementSibling.dataset.id;
        const noteCoords = event.target.getBoundingClientRect();
        const horizontal = noteCoords.left;
        const vertical = noteCoords.bottom - 12;
        this.$colorTooltip.style.transform = `translate(${horizontal}px, ${vertical}px)`;
        this.$colorTooltip.style.display = "flex";
    }

    closeTooltip(event) {
        if (!event.target.matches(".toolbar-color")) return;
        this.$colorTooltip.style.display = "none";
    }

}

new App();