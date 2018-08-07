const csv = require('csvtojson');
const fs = require('fs');
const csvFile = 'bible_clock_verses.csv';

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