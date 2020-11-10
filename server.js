const express = require("express");
const app = express();
const port = 3000;

const handlebars = require("express-handlebars");

app.set("view engine", "hbs");

app.engine(
    "hbs",
    handlebars({
        layoutsDir: `${__dirname}/views/layouts`,
        extname: "hbs",
        defaultLayout: "index",
    })
);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("main");
});

app.listen(port, () => {
    console.log(`app is listening to port ${port}`);
});
