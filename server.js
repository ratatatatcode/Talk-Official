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

app.get('/', (req, res) => {
    let status = req.query.status || "Don't worry; your story is safe with me.";
    renderContent(req, res, status);
});

let lastSubmittedContent = null;

app.post('/', (req, res) => {
    let content = req.body.content;

    const contentInsertQuery = "INSERT INTO ContentTable (Content) VALUES (?)";

    db.query(contentInsertQuery, content, (err, results) => {
        if(err) {
            console.error(err);
            return res.render("/", {status: "Failed to submit."});
        }

        // Redirect to the same page after form submission to avoid resubmission on refresh
        let status = "Your post has been submitted. Smile! Hope you’re doing fine! 😉";
        res.redirect('/?status=' + encodeURIComponent(status));
    });
});

app.get('/feedback', (req, res) => {
    let status = req.query.status || "Feel free to share your thoughts.";
    return res.render("feedback.ejs", {status: status})
});

app.post('/feedback', (req, res) => {
    let content = req.body.content;

    const contentInsertQuery = "INSERT INTO Feedback (feedback) VALUES (?)";

    db.query(contentInsertQuery, content, (err, results) => {
        if(err) {
            console.error(err);
            return res.render("/feedback", {status: "Failed to submit."});
        }

        // Redirect to the same page after form submission to avoid resubmission on refresh
        let status = "Your post has been submitted. Thank you for your feedback!";
        res.redirect('/feedback/?status=' + encodeURIComponent(status));
    });
});

// app.get('/smile', (req, res) => {
//     let status = "Smile 😉"
//     renderContent(req, res, status);
// });

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});