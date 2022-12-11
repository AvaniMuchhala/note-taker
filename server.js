const express = require("express");
const db = require("./db/db.json");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const app = express();

app.use(express.static("public"));

// HTML routes
app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "public/notes.html"));
});

// Wildcard (fallback route)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// API routes
// Read db.json and return all saved notes as JSON
app.get("/api/notes", (req, res) => {
    return res.json(db);
});

app.listen(PORT, () => 
    console.log(`App listening to http://localhost:${PORT}`)
);