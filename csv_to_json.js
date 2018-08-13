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
   var placeholder = [{"verse":"","book":"","quote":"The New World Translation of the Holy Scriptures&#42;"}];
   hours.forEach(hour => {
      minutes.forEach(minute => {
         file = hour + "-" + minute + ".json";
         placeholder[0]['verse'] = hour + "-" + minute;
         fs.writeFileSync('docs/times/' + file, JSON.stringify(placeholder));
      });
   });
}

function combineBookNames(aBooks) {
   if (aBooks.length === 1) {
      return aBooks[0];
   } else if (aBooks.length === 2) {
      return aBooks[0] + ' and ' + aBooks[1];
   }
   var lastBook = aBooks[aBooks.length - 1];
   aBooks.pop();
   return aBooks.join(', ') + " and " + lastBook;
}

function generateVerseData() {
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
         var hours = {};
         Object.keys(formatted).forEach(time => {
            var passages = formatted[time];
            fs.writeFileSync('docs/times/' + time + '.json', JSON.stringify(passages));

            var aTime = time.split('-');
            var hour = aTime[0];
            if (!hours.hasOwnProperty(hour)) {
               hours[hour] = [];
            }
            books = passages.map(passage => passage.book);
            books.forEach(book => {
               if (hours[hour].indexOf(book) === -1) {
                  hours[hour].push(book);
               }
            });
         });
         Object.keys(hours).forEach(hour => {
            var time = hour + '-00';
            books = combineBookNames(hours[hour]);
            var text = (hours[hour].length > 1) ? 's of ' : ' of ';
            fs.writeFileSync('docs/times/' + time + '.json', JSON.stringify([{
               verse: time,
               quote: 'During the next hour, you will see quotes from the Bible Book' + text + books,
               book: ''
            }]));
         });
      });
}

generatePlaceholders();
generateVerseData();