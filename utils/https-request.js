const axios = require("axios");

exports.httpsReq = (options) =>
    new Promise((resolve, reject) => {
        (reqFunc = () => {
            axios({
                method: options.method,
                url: `https://${options.host}${options.path}`,
                data: options.data,
                headers: options.headers,
            })
                .then((resp) => {
                    if (resp.status === 202 && resp.data === "") reqFunc();
                    else return resolve(resp.data);
                })
                .catch((error) => reject(error));
        })();
    });
