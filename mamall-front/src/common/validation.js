(function (){
    module.exports.validateUsername = function (username) {
        const regex = /^[a-zA-Z0-9_]+$/;
        return regex.test(username);
    }

    module.exports.validatePassword = function (password) {
        const regex = /^\S+$/;
        return regex.test(password) && password.length >= 8;
    }

    module.exports.validateRoomName = function (username) {
        const regex = /^[a-zA-Z0-9_\ ]+$/;
        return regex.test(username);
    }
}())