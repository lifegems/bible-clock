const csv = require('csvtojson');
const fs = require('fs');
const csvFile = 'bible_clock_verses.csv';

function generatePlaceholders() {
   var hours = [];
   var minutes = [];
   for (var i = 0; i < 60; i++) {
      var count = 100 + i;
      minutes.push(count.toString().substring(1));
      if (i < 24) {
         hours.push(count.toString().substring(1));
      }
   }
   var placeholder = [{"verse":"00-00","book":"","quote":"The New World Translation of the Holy Scriptures"}];
   hours.forEach(hour => {
      minutes.forEach(minute => {
         file = hour + "-" + minute + ".json";
         fs.writeFileSync('docs/times/' + file, JSON.stringify(placeholder));
      });
   });
}

generatePlaceholders();

csv({delimiter: '|'})
   .fromFile(csvFile)
   .then((data) => {
      const formatted = {};
      data.forEach(passage => {
         if (!formatted.hasOwnProperty(passage.verse)) {
            formatted[passage.verse] = [];
         }
         formatted[passage.verse].push(passage);
      });
      data = []; // clearing the object to help with memory
      Object.keys(formatted).forEach(time => {
         var passages = formatted[time];
         fs.writeFileSync('docs/times/' + time + '.json', JSON.stringify(passages));
      });
   });