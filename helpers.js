function getIDByEmail(email, userDB) {
    const em = email.trim().toLowerCase();
    for (id in userDB) {
        if (userDB[id].email === em) {
            return userDB[id].id;
        }
    }
    return undefined;
}

// generates a 6 character string
function generateRandomString(urlDB) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let newString = "";
    do {
        for (i = 0; i < 6; i++) {
            newString = newString.concat(characters.charAt(
                Math.floor(Math.random() * characters.length)));
        }
    } while(Object.keys(urlDB).includes(newString))

    return newString;
}

function generateRandomUserID(userDB) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let newString = "";
    do {
        for (i = 0; i < 6; i++) {
            newString = newString.concat(characters.charAt(
                Math.floor(Math.random() * characters.length)));
        }
    } while(Object.keys(userDB).includes(newString))

    return newString;
}

function userExists(user, userDB) {
    if (user !== undefined) {
        const sourceUser = userDB[user.id];

        if (sourceUser &&
            sourceUser.id === user.id) {
            
            return true;
        }
    }
    return false;
}

function authenticateUser(email, password, userDB, bcrypt) {
    if (email && password) {
        const sourceUser = userDB[getIDByEmail(email, userDB)];
        console.log(bcrypt.compareSync(password, sourceUser.password));
        if (sourceUser &&
            sourceUser.email === email &&
            bcrypt.compareSync(password, sourceUser.password)) {
            
            return true;
        }
    }
    return false;
}

function urlsForUser(id, urlDB) {
    if (!id) {
        return {};
    }
    let urls = {};
    for (url in urlDB) {
        if (urlDB[url].userID === id) {
            urls[url] = urlDB[url];
        }
    }
    return urls;
}

function userOwnsURL(user, shortURL, urlDB) {
    try {
        if (user && user.id && shortURL) {
            if (urlDB[shortURL].userID === user.id) {
                return true;
            }
        }
    } catch (error) {
        console.log("userOwnsURL Function Error: URL Database issue");
    }
    return false;
}

module.exports = { getIDByEmail, generateRandomString, generateRandomUserID,
                   userExists, authenticateUser, urlsForUser, userOwnsURL };