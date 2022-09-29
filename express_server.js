const express = require("express");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const { getIDByEmail, generateRandomString, generateRandomUserID,
        userExists, authenticateUser, urlsForUser, userOwnsURL } = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    name: 'session',
    keys: ["testKey"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride("_method"));

/*
{ "shortURL": {
    longURL: string,
    userID: string
} }
*/
const urlDatabase = {
    
};

/*
{
    id : string,
    email: string,
    password: string
}
*/
const users = {

};

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
    const templateVars = {
        urls: {},
        user: users[req.session.user_id],
        message: ""};
    if (!userExists(templateVars.user, users)) {
        templateVars.user = undefined;
        templateVars.message = "Register or Login to create and view tiny URLs"
    } else {
        templateVars.urls = urlsForUser(templateVars.user.id, urlDatabase);
    }
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    const templateVars = { user: users[req.session.user_id] }
    
    if (!userExists(templateVars.user, users)) {
        templateVars.user = undefined;
        res.redirect("/login");
        return;
    }

    res.render("urls_new.ejs", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user: users[req.session.user_id]
    };
    if (!userExists(templateVars.user, users) ||
        !userOwnsURL(templateVars.user, templateVars.shortURL, urlDatabase)) {
        templateVars.user = undefined;
        res.redirect("/urls");
        return;
    }
    res.render("urls_show.ejs", templateVars);
});

app.get("/login", (req, res) => {
    req.session = null;
    res.render("login.ejs", { user: undefined });
});

app.get("/register", (req, res) => {
    req.session = null;
    res.render("register.ejs", { user: undefined });
});

app.get("/u/:shortURL", (req, res) => {
    if (!urlDatabase[req.params.shortURL]) {
        res.send("URL does not exist");
        return;
    }
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});

app.put("/urls", (req, res) => {
    if (!userExists(users[req.session.user_id], users)) {
        console.log("user not logged in");
        res.redirect("/login");
        return;
    }
    urlDatabase[generateRandomString(urlDatabase)] = { 
        longURL: req.body.longURL,
        userID: req.session.user_id
    };
    console.log(req.session.user_id);
    res.redirect("/urls");
});

app.delete("/urls/:shortURL", (req, res) => {
    if (!userOwnsURL(users[req.session.user_id], req.params.shortURL, urlDatabase)) {
        res.redirect("/urls");
        return;
    }
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

app.put("/urls/:shortURL", (req, res) => {
    if (!userOwnsURL(users[req.session.user_id], req.params.shortURL, urlDatabase)) {
        res.redirect("/urls");
        return;
    }
    const longURL = req.body.longURL;
    if (urlDatabase[req.params.shortURL])
        urlDatabase[req.params.shortURL].longURL = longURL;
    res.redirect("/urls");
});

app.post("/login", (req, res) => {
    if (authenticateUser(req.body.email, req.body.password, users, bcrypt)) {
        const id = getIDByEmail(req.body.email, users);
        console.log("logged in as: " + users[id].email);
        req.session.user_id = id;
        res.redirect("/urls");
        return;
    }
    console.log("Wrong Email or Password");
    res.redirect(403, "/login");
});

app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
});

app.put("/register", (req, res) => {
    if (!(req.body.email && req.body.password)) {
        console.log("could not register. Wrong input");
        res.sendStatus(400);
        return;
    } else if (getIDByEmail(req.body.email, users) !== undefined) {
        console.log(`Email ${req.body.email} is already taken`);
        res.sendStatus(400);
        return;
    }

    const userID = generateRandomUserID(users);

    users[userID] = {
        id: userID,
        email: req.body.email.trim().toLowerCase(),
        password: bcrypt.hashSync(req.body.password, 10)
    };
    console.log(`registered user: ${userID} ${users[userID]["email"]} password:${users[userID].password}`);

    req.session.user_id = userID;

    res.redirect("/urls");
});