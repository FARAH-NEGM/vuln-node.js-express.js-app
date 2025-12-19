'use strict';
var fs = require('fs');
const path = require('path');

module.exports = (app, db) => {

    /**
     * GET /v1/order
     * @summary Use to list all available beer(Excessive Data Exposure)(PII Exposure/Oversharing)
     * @tags beer
     * @return {array<Beer>} 200 - success response - application/json
     */
    app.get('/v1/order', (req, res) => {
        db.beer.findAll({ include: "users" })
            .then(beer => {
                res.json(beer);
            });
    });

    /**
     * GET /v1/beer-pic/
     * @summary Get a picture of a beer (Path Traversal)
     * @note http://localhost:5000/v1/beer-pic/?picture=../.env
     * @param {string} picture.query.required picture identifier
     * @tags beer
     */
    app.get('/v1/beer-pic/', (req, res) => {
        var filename = req.query.picture;

        // 🔒 Fix Path Traversal
        if (!filename || filename.includes('..')) {
            return res.status(400).send("Invalid file name");
        }

        const uploadDir = path.join(__dirname, '../../../uploads');
        const filePath = path.join(uploadDir, filename);

       fs.readFile(filePath, function (err, data) {
    if (err) {
        return res.status(500).json({ error: "File could not be read" });
    }

    // Always return JSON (Semgrep-friendly)
    const encoded = Buffer.from(data).toString('base64');

    return res.json({
        filename: filename,
        content: encoded
    });
});

    });

    /**
     * GET /v1/search/{filter}/{query}
     * @summary Search for a specific beer (SQL Injection)
     * @description sqlmap -u 'http://localhost:5000/search/id/2*'
     * @tags beer
     * @param {string} query.path - the query to search for
     * @param {string} filter.path - the column
     * @return {array<Beer>} 200 - success response - application/json
     */
   app.get('/v1/search/:filter/:query', async (req, res) => {
    try {
        const query = parseInt(req.params.query, 10);

        if (isNaN(query)) {
            return res.status(400).json({ error: "Invalid query parameter" });
        }

        const beers = await Beer.findAll({
            where: { id: query }
        });

        res.status(200).json(beers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

};
