import fetch from 'node-fetch'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'

const app = express(),
    CLIENT_KEY = "aw3j6qwzdg5p2b3d",
    CLIENT_SECRET = "2dfc65b9f2fa89e355876b9262147af4";

app.use(cookieParser());
app.use(cors());
app.listen(process.env.PORT || 80)

app.get('/', (req, res) => {
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie('csrfState', csrfState, { maxAge: 60000 });

    let url = 'https://www.tiktok.com/auth/authorize/';

    url += '?client_key=' + CLIENT_KEY;
    url += '&scope=user.info.basic,video.list';
    url += '&response_type=code';
    url += '&redirect_uri=https://tiktok-examp.herokuapp.com/redirect';
    url += '&state=' + csrfState;

    res.redirect(url);
})

app.get('/redirect', (req, res) => {
    const { code, state } = req.query;
    const { csrfState } = req.cookies;

    // if (state !== csrfState) {
    //     res.status(422).send('Invalid state');
    //     return;
    // }

    let url_access_token = 'https://open-api.tiktok.com/oauth/access_token/';
    url_access_token += '?client_key=' + CLIENT_KEY;
    url_access_token += '&client_secret=' + CLIENT_SECRET;
    url_access_token += '&code=' + code;
    url_access_token += '&grant_type=authorization_code';

    fetch(url_access_token, {method: 'post'})
        .then(res => res.json())
        .then(json => {
            // res.send(json);

            // let url = '/refresh_token/';

            // url += '?refresh_token=' + json.data.refresh_token;
            // res.redirect(url)

            let url = '/videoList/';
            url += '?access_token=' + json.data.access_token;
            url += '&open_id=' + json.data.open_id;
            res.redirect(url)
        });
})

app.get('/videoList/', (req, res) => {
    const access_token = req.query.access_token,
        open_id = req.query.open_id;

    let url_refresh_token = 'https://open-api.tiktok.com/video/list/';
    const object = { 
        access_token: access_token,
        open_id: open_id,
        cursor: 0,
        max_count: 10,
        fields: ["embed_html", "embed_link", "share_count"]
    };
    fetch(url_refresh_token, {
        method: 'post', 
        body: JSON.stringify(object),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(json => {
        res.send(json);
    });
})

app.get('/refresh_token/', (req, res) => {
    const refresh_token = req.query.refresh_token;

    let url_refresh_token = 'https://open-api.tiktok.com/oauth/refresh_token/';
    url_refresh_token += '?client_key=' + CLIENT_KEY;
    url_refresh_token += '&grant_type=refresh_token';
    url_refresh_token += '&refresh_token=' + refresh_token;

    fetch(url_refresh_token, {method: 'post'})
        .then(res => res.json())
        .then(json => {
            // res.send(json);

            let url = '/getUserInfo/';

            url += '?access_token=' + json.data.access_token;
            url += '&open_id=' + json.data.open_id;
            res.redirect(url)
        });
})

// app.get('/getUserInfo/', (req, res) => {
//     const access_token = req.query.access_token,
//         open_id = req.query.open_id;

//     let url_refresh_token = 'https://open-api.tiktok.com/user/info/';
//     const object = { 
//         access_token: access_token,
//         open_id: open_id,
//         fields: ["open_id", "union_id", "avatar_url"]
//     };
//     fetch(url_refresh_token, {
//         method: 'post', 
//         body: JSON.stringify(object),
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     })
//     .then(res => res.json())
//     .then(json => {
//         res.send(json);
//     });
// })

// app.get('/videoQuery/', (req, res) => {
//     const access_token = req.query.access_token,
//         open_id = req.query.open_id;

//     let url_refresh_token = 'https://open-api.tiktok.com/video/query/';
//     const object = { 
//         access_token: access_token,
//         open_id: open_id,
//         filters: {
//             "video_ids": ["7019589425600449794"]
//         },
//         fields: ["embed_html", "embed_link"]
//     };
//     fetch(url_refresh_token, {
//         method: 'post', 
//         body: JSON.stringify(object),
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     })
//     .then(res => res.json())
//     .then(json => {
//         // res.send(json);
//         res.send("<p>aa</p>")
//         console.log(json)
//     });
// })

// Export the Express API
module.exports = app;