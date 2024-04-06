module.exports.isRegExpValid = (pattern, str) => {
    if (str.match(pattern)) {
        return true;
    } else {
        return false;
    }
};