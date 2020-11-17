const express = require("express");
const handlebars = require("express-handlebars");
const config = require("./config/config");
const httpsReq = require("./utils/https-request").httpsReq;
const app = express();
const port = 3000;

app.set("view engine", "hbs");

app.engine(
    "hbs",
    handlebars({
        layoutsDir: `${__dirname}/views/layouts`,
        extname: "hbs",
        defaultLayout: "index",
        partialsDir: `${__dirname}/views/partials`,
    })
);

app.use(express.static("public"));

app.get("/", (req, res) => {
    const authOpt = {
        host: config.AUTH_HOST,
        path: "/oauth/token",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: {
            grant_type: "client_credentials",
            client_id: "coding_test",
            client_secret: "bwZm5XC6HTlr3fcdzRnD",
        },
    };
    let token = null;

    // Get reports data from server
    httpsReq(authOpt)
        .then((resp) => {
            token = `${resp.token_type} ${resp.access_token}`;
            const opt = {
                host: config.REPORT_HOST,
                path: "/api/v2.0/gateway/reports/status/service",
                method: "POST",
                headers: {
                    Authorization: token,
                    Accept: "application/json",
                },
            };
            return httpsReq(opt);
        })
        .then((resp) => {
            const opt = {
                host: config.REPORT_HOST,
                path: `/api/v2.0/gateway/reports/status/service/${resp.job_id}`,
                method: "GET",
                headers: {
                    Authorization: token,
                    Accept: "application/json",
                },
            };
            return httpsReq(opt);
        })
        .then((resp) => {
            res.render("main", {
                data: encodeURIComponent(JSON.stringify(resp)),
            });
        })
        .catch((error) => console.log("ERROR: " + error));
});

app.listen(port, () => {
    console.log(`app is listening to port ${port}`);
});
