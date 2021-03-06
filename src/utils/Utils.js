exports.copy = (o) => {
    return JSON.parse(JSON.stringify(o));
};

exports.getDate = (fromDate, {day = 0, hours = 0, min = 0, sec = 0, ms = 0}) => {
    let target = new Date(fromDate);

    target.setDate(fromDate.getDate() + day);
    target.setHours(hours, min, sec, ms);

    return target;
};