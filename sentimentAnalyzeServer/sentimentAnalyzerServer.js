const express = require('express');
const app = new express();
const dotenv = require('dotenv');
dotenv.config();

function getNLUInstance() {
    const apikey = process.env.API_KEY;
    const serviceUrl = process.env.API_URL;

    const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');

    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2021-06-06',
        authenticator: new IamAuthenticator({
            apikey
        }),
        serviceUrl,
    })
    return naturalLanguageUnderstanding;
}

const naturalLanguageUnderstanding = new getNLUInstance();

app.use(express.static('client'));

const cors_app = require('cors');
app.use(cors_app());

app.get("/", (req, res) => {
    res.render('index.html');
});

app.get("/url/emotion", (req, res) => {
    console.log(req.query.url);
    naturalLanguageUnderstanding.analyze(req.query.url)
        .then(res => {
            console.log(res);
            return res.send(res);
        })
        .catch(err => {
            console.log(err);
            return res.send(err);
        })
});

app.get("/url/sentiment", (req, res) => {
    return res.send("url sentiment for " + req.query.url);
});

app.get("/text/emotion", (req, res) => {
    return res.send({ "happy": "10", "sad": "90" });
});

app.get("/text/sentiment", (req, res) => {
    return res.send("text sentiment for " + req.query.text);
});

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})

