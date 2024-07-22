const config = require('../config/config');

(function() {
    let pool;

    module.exports.setPool = function(dbPool) {
        pool = dbPool
    }

    module.exports.addFileInfo = async function(filePath, fileUrl) {

        if (!pool) {
            console.error("Pool not initialized in db-files.")
            return null
        }

        let file_id = 0;

        let query =  {
            name: 'add-file',
            text: `INSERT INTO 
                    ${config.pgschema}.files
                    (file_path, file_url)
                    VALUES
                    ($1, $2)
                    RETURNING file_id;`,
            values: [ filePath, fileUrl ]
        }

        try {
            let res = await pool.query(query);
            file_id = res.rows[0].file_id;
        }
        catch (err) {
            return err.code;
        }

        return file_id;
    }

}());