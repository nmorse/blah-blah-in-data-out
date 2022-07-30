// convert tide data from noaa
// https://tidesandcurrents.noaa.gov/noaatideannual.html?id=8442645

fs = require("fs");
const data = fs.readFileSync("./tide_salem_2022_annual.txt").toString();
// console.log(data);

const stream = fs.createWriteStream("tide_2022.json");

lines = data.split('\r\n');
console.log(lines.length);

// input data shape
const firstDataRow = 14;
const dataColumns = 9;

const dayFraction = (thisParticularDay, firstOfTheYear) => {
    const elapsed = (thisParticularDay - firstOfTheYear) + ((firstOfTheYear.getTimezoneOffset() - thisParticularDay.getTimezoneOffset()) * 60 * 1000);
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    return elapsed / millisecondsInDay;
};

const rowSample = lines[firstDataRow].split('\t');
const theDate0 = new Date(Date.parse(`${rowSample[0]}-${rowSample[2]}`));
const firstOfTheYear = new Date(theDate0.getFullYear(), 0, 0);

stream.write("[");
let rowSep = "\r\n";
for (let r = firstDataRow; r < lines.length; r++) {
    const row = lines[r].split('\t');
    if (row && row.length == dataColumns) {
        const theDate = Date.parse(`${row[0]}-${row[2]}`);
        const thisParticularDay = new Date(theDate);
        stream.write(rowSep + "[" + 
        dayFraction(thisParticularDay, firstOfTheYear) + ", " + 
        '"' + row[0] + '", ' + 
        '"' + row[1] + '", ' + 
        '"' + row[2] + '", ' + 
        row[3] + ', ' + 
        row[5] + ', ' + 
        '"' + row[8] + '"' + 
        "]");
        rowSep = ",\r\n";
    }
}
stream.write("]\r\n");
stream.end();


