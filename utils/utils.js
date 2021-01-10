const { table } = require('table');

/**
 * 
 * @param {Object} objectValue Conversts json value to a table format
 * @param {Array} headers Array of strings (2) to be used as headers
 */
module.exports.displayObjectAsTable = (objectValue, headers) => {
    let formattedData = [headers];
    for (let key in objectValue) {
        formattedData.push([key, objectValue[key].join("\n")]);
    }

    return table(formattedData, ["ext"]);
}

/**
 * loading animation
 */
module.exports.loadingAnimation = () => {
    let P = ["\\", "|", "/", "-"];
    let x = 0;

    return setInterval(function () {
        process.stdout.write("\r" + P[x++]);
        x &= 3;
    }, 100);
};

module.exports.statsTable = (totalFilesMoved, errorObjStore) => {
    let formattedData = [["Total Files Moved", "Total Errors"]]
    formattedData.push([totalFilesMoved, errorObjStore.length])
    return table(formattedData);
}
