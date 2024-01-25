const clientValidation = process.env.REACT_APP_CLIENT_VALIDATION;

export const lineColors = ["#8884d8", "#f0d490", "#9e2866", "#1140e8", "#97d29e", "#4f011e", "#295fb1", "#48cb71", "#6ce146", "#ebb118", "#b015ea", "#e4604e", "#86368d", "#7ea178", "#718992", "#dd2cbd", "#8349c2", "#8a2574"];
    
export const tickFormater = (number) => {
    if (number > 1000000000) {
        return (number / 1000000000).toString() + 'B';
    } else if (number > 1000000) {
        return (number / 1000000).toString() + 'M';
    } else if (number > 1000) {
        return (number / 1000).toString() + 'K';
    } else {
        return number.toString();
    }
}
// eslint-disable-next-line
export const labelFormatter = (number) => {
    if (number > 1000000000) {
        return '$' + (Math.round((number / 1000000000) * 100) / 100).toString() + 'B';
    } else if (number > 1000000) {
        return '$' + (Math.round((number / 1000000) * 100) / 100).toString() + 'M';
    } else if (number > 1000) {
        return '$' + (Math.round((number / 1000) * 100) / 100).toString() + 'K';
    } else {
        return number.toString();
    }
}

export function dayofWeek(dow) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return daysOfWeek[Math.max(0, Math.min(6, dow))];
}

export function getStartDate(date, minStartDate, maxStartDate) {

    let coercedDate = new Date(date);
    if (coercedDate > new Date(maxStartDate)) {
        coercedDate = new Date(maxStartDate)
    }
    if (coercedDate < new Date(minStartDate)) {
        coercedDate = new Date(minStartDate)
    } 
    return coercedDate;
}

export function getDateInRange(date, minStartDate, maxStartDate) {

    let coercedDate = new Date(date);
    if (coercedDate > new Date(maxStartDate)) {
        coercedDate = new Date(maxStartDate)
    }
    if (coercedDate < new Date(minStartDate)) {
        coercedDate = new Date(minStartDate)
    } 
    return coercedDate;
}

export function getFilterDates(date, minStartDate, maxStartDate) {

    let endDate = getDateInRange(date, minStartDate, maxStartDate);
    let startDate = getDateInRange((new Date(endDate)).setFullYear(endDate.getFullYear()-1));

    return [formatDate(startDate), formatDate(endDate)]
}

export function formatDate(date){

    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    const year = date.getFullYear();
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

export function getRequestOptions(state) {
    if (clientValidation === 'JWT') {
        return {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + state.accessToken },
        };
    } else if (clientValidation === 'Snowflake') {
        return {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
    } else if (clientValidation === 'Dev') {
        return {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Sf-Context-Current-User': 'user1' },
        };
    }
    return {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    };
}

export function enableLogin() {
    // console.log(`Checking client validation = ${clientValidation}`);
    if (clientValidation === 'JWT') {
        // console.log(` - Login enabled`);
        return true;
    } else if (clientValidation === 'Snowflake') {
        // console.log(` - Login disabled`);
        return false;
    }
    console.log(` - Login disabled`);
    return false;
}

export function isLoggedIn(state) {
    if (clientValidation === 'JWT') {
        if (state){
            return (state.accessToken != null);
        }
    } else if (clientValidation === 'Snowflake') {
        if (state){
            return (state.accessToken != null);
        }
    } else if (clientValidation === 'Dev') {
        if (state){
            return (state.franchise != null);
        }
    }
    return false;
}