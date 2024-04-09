
module.exports = (req, res, next) => {
    //get the token from the header if present
    const token = req.headers["x-access-token"];

    //if no token found, return response (without going to the next middelware)
    if (!token) return res.status(401).send("Access denied. No token provided.");

    try {
        // if can verify the token got to next()
        // if (valid(token)) {
        //     next();
        // } else {
        //     res.status(400).send("Invalid API Key");
        // }
    } catch (ex) {
        res.status(400).send("Invalid API Key");
    }
};
