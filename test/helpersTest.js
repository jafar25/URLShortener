const { assert } = require('chai');
const getIDByEmail = require('../helpers.js').getIDByEmail;
const testUsers = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
};

describe('getUserByEmail', function() {
    it('should return a user with valid email', function() {
        const user = getIDByEmail("user@example.com", testUsers)
        const expectedUserID = "userRandomID";

        assert(user === expectedUserID, "getting valid user");
    });

    it('should return undefined if user is not found', function() {
        const user = getIDByEmail("doesntexist@example.com", testUsers)
        const expectedUserID = undefined;

        assert(user === expectedUserID, "getting valid user");
    });
});
