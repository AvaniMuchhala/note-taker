const express = require("express");
const db = require("./db/db.json");
const fs = require("fs");
const path = require("path");
const util = require("util");
const {v4: uuidv4} = require("uuid");   // create random UUID

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

const PORT = 3001;
const app = express();

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// HTML routes
app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "public/notes.html"));
});

// API routes
// Read db.json and return all saved notes as JSON
app.get("/api/notes", (req, res) => {
    console.info(`${req.method} /api/notes`);
    readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));   
});

// POST request to save a new note
app.post("/api/notes", (req, res) => {
    console.info(`${req.method} request received to add a new note`);

    const {title, text} = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuidv4()
        };

        fs.readFile("./db/db.json", "utf8", (err, data) => {
            if (err) {
                console.log(err);
                res.status(400).json("Error reading file");
            } else {
                console.log(data);

                const notesList = JSON.parse(data);
                notesList.push(newNote);

                // Write the updated notesList to db.json
                fs.writeFile("./db/db.json", JSON.stringify(notesList, null, "\t"), (err) =>
                    err ? console.error(err) : console.log(`Note ${newNote.id} has been written to db.JSON file`)
                );
            }
        });

        const response = {
            status: "success",
            body: newNote
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json("Error in posting note");
    }
});

app.delete("/api/notes/:id", (req, res) => {
    const deleteNoteID = req.params.id;
    
    readFromFile("./db/db.json", "utf8", (err, data) => {
        if (err) {
            console.log(err);
            res.status(400).json("Error reading file");
        } else {
            console.log(data);
            const notesList = JSON.parse(data);
            notesList.forEach((note, i) => {
                if (note.id === deleteNoteID) {
                    notesList.splice(i, 1);
                }
            });
            // Write the updated notesList to db.json
            fs.writeFile("./db/db.json", JSON.stringify(notesList, null, "\t"), (err) =>
                err ? console.error(err) : console.log(`Note ${deleteNoteID} has been deleted from db.JSON file`)
            );
        }
    });

    const response = {
        status: "success",
    };

    console.log(response);
    res.status(201).json(response);
});

// Wildcard (fallback route)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => 
    console.log(`App listening to http://localhost:${PORT}`)
);