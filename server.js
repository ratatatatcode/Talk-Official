const express = require("express");
const app = express();
const { resolveInclude } = require('ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));

const db = require("./db");
const { stat } = require("fs");

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderContent(req, res, status) {
    const contentSelectQuery = "SELECT ID, Content FROM ContentTable";
        db.query(contentSelectQuery, (err, results) => {
            if(err) {
                console.error(err);
                return res.render("main.ejs", {status: "Please try again later..."});
            }

            results = shuffleArray(results);
            res.render("main.ejs", {contentData: results, status: status});
        });
}

function checkWords (sentence, targetWords, req, res) {
    const words = sentence.split(/\s+/);
    for (let count = 0; count < words.length; count++) {
        const currentWords = words[count];
        if (targetWords.includes(currentWords)) {
            let status = "Avoid the use of inappropriate words."
            renderContent(res, req, status)
        }
    }
}

app.get('/', (req, res) => {
    let status = ": )"
    renderContent(req, res, status);
});

let lastSubmittedContent = null;

app.post('/', (req, res) => {
    let content = req.body.content;
    let status = "";

    const contentInsertQuery = "INSERT INTO ContentTable (Content) VALUES (?)";

    db.query(contentInsertQuery, content, (err, results) => {
        if(err) {
            console.error(err);
            return res.render("/", {status: "Failed to submit."});
        }

        targetWords = ["mamatay", "Mamatay", "pumatay", "patay", "Patay"]; // I'll leave this blank for now.
        checkWords(content, targetWords, res);
        res.redirect('/smile');
    });
});

app.get('/smile', (req, res) => {
    let status = "Smile 😉"
    renderContent(req, res, status);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});