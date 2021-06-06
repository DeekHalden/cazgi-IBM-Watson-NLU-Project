const express = require('express');
const app = new express();
const dotenv = require('dotenv');
dotenv.config();

function getNLUInstance() {
    const apikey = process.env.API_KEY;
    const serviceUrl = process.env.API_URL;
    console.log(serviceUrl)
    const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');

    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2020-08-01',
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
    const { url } = req.query;
    const data = {
        url,
        'features': {
            'entities': {
                'emotion': true,
                'sentiment': false
            }, 'keywords': {
                'emotion': true,
                'sentiment': false

            }
        }
    }
    naturalLanguageUnderstanding.analyze(data)
        .then(response => {
            console.log(response.result.keywords)
            const data = calcSum(response.result.keywords)
            return res.send({ data });
        })
        .catch(err => {
            console.log(err);
            return res.send(err);
        })
});

app.get("/url/sentiment", (req, res) => {
    const { url } = req.query;
    const data = {
        url,
        'features': {
            'entities': {
                'emotion': false,
                'sentiment': true
            }, 'keywords': {
                'emotion': false,
                'sentiment': true

            }
        }
    }
    naturalLanguageUnderstanding.analyze(data)
        .then(response => {
            return res.send({ data: response.result.keywords[0].sentiment.label });
        })
        .catch(err => {
            console.log(err);
            return res.send(err);
        })
});

app.get("/text/emotion", (req, res) => {
    const { text } = req.query;
    const data = {
        text: text,
        'features': {
            'entities': {
                'emotion': true,
                'sentiment': false
            }, 'keywords': {
                'emotion': true,
                'sentiment': false
            }
        }
    }
    naturalLanguageUnderstanding.analyze(data)
        .then(response => {
            const data = calcSum(response.result.keywords)
            return res.send({ data });
        })
        .catch(err => {
            console.log(err);
            return res.send(err);
        })
});

app.get("/text/sentiment", (req, res) => {
    const { text } = req.query;
    const data = {
        text: text,
        'features': {
            'entities': {
                'emotion': false,
                'sentiment': true
            }, 'keywords': {
                'emotion': false,
                'sentiment': true
            }
        }
    }
    naturalLanguageUnderstanding.analyze(data)
        .then(response => {
            return res.send({ data: response.result.keywords[0].sentiment.label });
        })
        .catch(err => {
            console.log(err);
            return res.send(err);
        })
});

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})

function calcSum(data) {
    return data.reduce((acc, { emotion }) => {
        // console.log(emotion)
        Object.entries(emotion).forEach(([key, value], index) => {
            console.log(key, value);
            if (!acc[index]) {
                acc.push([key, value]);
            }
            else {
                acc[index][1] += value;
            }
        });
        return acc;
    }, []).map(([key, value]) => {
        return [key, value / data.length];
    });
}

