const csv = require('csvtojson');
const fs = require('fs');
const csvFile = 'bible_clock_verses.csv';

function stripLeadingZero(citation) {
    if (citation[0] === "0") {
        return citation[1];
    }
    return citation;
}
function formatVerse(citation) {
    // originally appears as ##-## (e.g. 08-12, 10-24)
    var chVerse = citation.split('-');
    var chapter = stripLeadingZero(chVerse[0]);
    var verse = stripLeadingZero(chVerse[1]);
    return {
       chapter: parseInt(chapter),
       verse: parseInt(verse)
    };
}
function getPercentage(part, total) {
   return (part / (total / 100)).toFixed(2) + '%';
}
function initFormatted() {
   var formatted = {
       0: [],  1: [],  2: [],  3: [],  4: [],  5: [],
       6: [],  7: [],  8: [],  9: [], 10: [], 11: [],
      12: [], 13: [], 14: [], 15: [], 16: [], 17: [],
      18: [], 19: [], 20: [], 21: [], 22: [], 23: [],
   };
   return formatted;
}

csv({delimiter: '|'})
   .fromFile(csvFile)
   .then((data) => {
      const formatted = initFormatted();
      data.forEach(passage => {
         var citation = formatVerse(passage.verse);
         if (!formatted.hasOwnProperty(citation.chapter)) {
            formatted[citation.chapter] = [];
         }
         if (formatted[citation.chapter].indexOf(citation.verse) === -1) {
            formatted[citation.chapter].push(citation.verse);
         }
      });
      data = []; // clearing the object to help with memory
      var totalVerses = 0;
      Object.keys(formatted).forEach(chapter => {
         totalVerses += formatted[chapter].length;
         console.log(chapter + ': ' + formatted[chapter].length + '/60 - ' + getPercentage(formatted[chapter].length, 60));
      });
      console.log("Total Progress: " + totalVerses + '/1440 - ' + getPercentage(totalVerses, 1440));
   });