/**************************************
 * 
 * utils.js
 * 
 * Contains convenience methods for parsing
 * dates (from incoming querystring params)
 * and a Node middleware for logging request
 * info to the console.
 * 
 **************************************/
const parseDate = (dateString) => {
    if (dateString == null) return null;

    var str = dateString;
    var parts = str.match(/^(\d{1,4})-(\d{1,2})-(\d{1,2})$/);
    if (parts) {
        var dt = new Date(parseInt(parts[1], 10),
                      parseInt(parts[2], 10) - 1,
                      parseInt(parts[3], 10));
        var dtUTC = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000 ));
        return dtUTC;
    }
    return null;
};

const defaultStartDate = () => {
    var dt = new Date(Date.now());
    dt.setFullYear(dt.getFullYear() - 1);
    var dtUTC = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000 ));
    return dtUTC;
};

const defaultEndDate = () => {
    var dt = new Date(Date.now());
    var dtUTC = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000 ));
    return dtUTC;
};

module.exports = {
    parseDate: parseDate,

    defaultStartDate: defaultStartDate,

    defaultEndDate: defaultEndDate,

    logRequest: function(req, res, next){
        const startdate = parseDate(req.query.start) ?? defaultStartDate();
        const enddate = parseDate(req.query.end) ?? defaultEndDate();
        console.log(req.method + ': ' + req.path + ' ? start: ' + startdate.toISOString().split('T')[0] + ', end: ' + enddate.toISOString().split('T')[0]);
        next();
    }
};