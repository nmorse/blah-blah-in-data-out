// convert tide data from noaa
// https://tidesandcurrents.noaa.gov/noaatideannual.html?id=8442645

fs = require("fs");
const data = fs.readFileSync("./sun_2022_annual.txt").toString();
// console.log(data);

const stream = fs.createWriteStream("sun_2022.json");

lines = data.split('\r\n');
console.log(lines.length);

// input data shape
const firstDataSunRise = 19;
const firstDataSunSet = 55;
const dataColumns = 13;

const dayFraction = (thisParticularDay, firstOfTheYear) => {
    const elapsed = (thisParticularDay - firstOfTheYear) + ((firstOfTheYear.getTimezoneOffset() - thisParticularDay.getTimezoneOffset()) * 60 * 1000);
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    return elapsed / millisecondsInDay;
};

const yearRow = lines[14].split(' ');
const theYear = yearRow[3]; 
const firstOfTheYear = new Date(theYear, 0, 0);
console.log(firstOfTheYear.toISOString());
let sortedRise = [];
let si = 0;
for (let r = firstDataSunRise; r < firstDataSunRise+31; r++) {
    const row = lines[r].split('\t');
    if (row) {
        for (let m = 1; m <= 12; m++) {
            if(row[m]) {
                const theDate = Date.parse(`${theYear}/${m}/${row[0]}-${row[m]} AM`);
                thisParticularDay = new Date(theDate);
                df = dayFraction(thisParticularDay, firstOfTheYear);
                // (m*100)+parseInt(row[0], 10)
                sortedRise[si++] = [df, `${theYear}/${m}/${row[0]}`, row[m], "R", `${thisParticularDay.toString()}`];
            }
        }
    }
}
for (let r = firstDataSunSet; r < firstDataSunSet+31; r++) {
    const row = lines[r].split('\t');
    if (row) {
        for (let m = 1; m <= 12; m++) {
            if(row[m]) {
                const theDate = Date.parse(`${theYear}/${m}/${row[0]}-${row[m]}`);
                thisParticularDay = new Date(theDate);
                df = dayFraction(thisParticularDay, firstOfTheYear);
                console.log(df);
                // (m*100)+parseInt(row[0], 10)
                sortedRise[si++] = [df, `${theYear}/${m}/${row[0]}`, row[m], "S", `${thisParticularDay.toString()}`];
            }
        }
    }
}
sortedRise.sort((a, b)=>a[0]>b[0]?1:-1);

stream.write("[");
let rowSep = "\r\n";
for (let r = 0; r < sortedRise.length; r++) {
    const row = sortedRise[r];
    if (row) {
        const theDate = Date.parse(`${row[0]}-${row[2]}`);
        const thisParticularDay = new Date(theDate);
        stream.write(rowSep + "[" + 
        row[0] + ', ' +  
        '"' + row[1] + '", ' + 
        '"' + row[2] + '", ' + 
        '"' + row[3] + '", ' + 
        '"' + row[4].split(' ').slice(0, 3).join(' ') + '"' + 
        "]");
        rowSep = ",\r\n";
    }
}
stream.write("]\r\n");
stream.end();


