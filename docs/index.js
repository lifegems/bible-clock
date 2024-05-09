var current_date;
var running_seconds;
var current_seconds = "00.0";
var static;
var bibleChapters;

function loadBibleChapters() {
   return loadJson("bible-info/bible-chapters.json");
}
function loadTimeFile(timeStamp) {
   var path = "times/" + timeStamp + ".json";
   return loadJson(path);
}
function loadJson(url) {
   var text = {};
   $.ajaxSetup({ async: false });
   $.getJSON(url, function (json) {
         text = json;
   });
   $.ajaxSetup({ async: true });
   return (text);
}
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
   if (chapter === "0" && verse === "0") {
         return "";
   } else if (chapter === "0") {
         return "verse " + verse;
   }
   return chapter + ":" + verse;
}
function getWOLLink(search) {
   return "https://wol.jw.org/en/wol/l/r1/lp-e?q=" + encodeURIComponent(search);
}
function setSecondsOverlay(s, m) {
   var time = parseFloat(s + "." + m);
   var percent = ((time / 60) * 100).toFixed(1);
   if (percent > current_seconds || (current_seconds - 80) > percent) {
         current_seconds = percent;
         $('#overlay').width(current_seconds + "%");
         console.log(current_seconds);
   }
}
function runSecondsMachine() {
   var now = new Date();
   setSecondsOverlay(now.getSeconds(), now.getMilliseconds());
   requestAnimationFrame(runSecondsMachine);
}
function startTime(load) {
   // if (running_seconds === undefined) {
   //     running_seconds = true;
   //     runSecondsMachine();
   // }

   var today = new Date();
   if(current_date !== undefined
         && current_date.getMinutes() === today.getMinutes() ) {
         var t = setTimeout(startTime, 1000);
         if (!load) return;
   }

   current_date = today;
   var h = today.getHours();
   var m = today.getMinutes();
   h = checkTime(h);
   m = checkTime(m);
   var timeCode = h + "-" + m;

   setScreen(timeCode);
   window.location.hash = timeCode;
   var t = setTimeout(startTime, 1000);
}
function checkTime(i) {
   if (i < 10) { i = "0" + i };
   return i;
}
function validateTimeCode(timeCode) {
   if (!timeCode.match('[0-9]{2}-[0-9]{2}')) {
         return '00-00';
   }
   aTimeCode = timeCode.split('-');
   var hour    = parseInt(aTimeCode[0]);
   var minutes = parseInt(aTimeCode[1]);
   if (hour > 23 || hour < 0 || minutes < 0 || minutes > 59) {
         return '00-00';
   }
   return timeCode;
}
function getChapter(timeCode) {
   var aTimeCode = timeCode.split('-');
   return parseInt(aTimeCode[0]);
}
function getVerse(timeCode) {
   var aTimeCode = timeCode.split('-');
   return parseInt(aTimeCode[1]);
}

function updateScreen(objVerse) {
   let currentChapter = objVerse.chapters[0].chapterNum;
   let currentVerse = objVerse.chapters[0].selectedVerse;
   var VERSE_URL = "https://scrp.vercel.app/api/ref?verse=" + encodeURI(formatBookChapterVerse(objVerse.name, currentChapter, currentVerse));
   objVerse.data = loadJson(VERSE_URL);
   var quote_len = (objVerse.data.text).length;
   try {
      $('#noVerse').html("");
      $('#citation').show();
      $('#quote').html(objVerse.data.text);
      $('#link').attr('href', getWOLLink(objVerse.data.citation));
      $('#verse').html(objVerse.data.citation);
      $('#quote').css("fontSize", ((6.000864 - 0.01211676 * quote_len + 0.00001176814 * quote_len ** 2 - 1.969435e-9 * quote_len ** 3) + "vw"));
   } catch (e) {
      console.log(e);
   }
}
function clickVerse(event) {
   var $verse = $(event.target);
   var verse = JSON.parse($verse.attr('data--click'));
   $('.list--verse').removeClass('list--verse-selected');
   $verse.addClass('list--verse-selected');
   updateScreen(verse);
}

function formatBookChapterVerse(book, chapter, verse) {
   return book + " " + chapter + ":" + verse;
}

function setScreen(timeCode, index = 0) {
   let currentChapter = getChapter(timeCode);
   currentChapter = (currentChapter == 0) ? 119 : currentChapter;
   let currentVerse = getVerse(timeCode);
   currentVerse = (currentVerse == 0) ? 60 : currentVerse;
   let verseOptions = listVerseOptions(currentChapter, currentVerse);
   if (verseOptions.length == 0) {
      currentChapter = 78;
      verseOptions = listVerseOptions(currentChapter, currentVerse);
   }
   // let selectedVerse = verseOptions[0]; //LAST: [verseOptions.length - 1]; // FIRST
   // let selectedVerse = verseOptions[verseOptions.length - 1]; // LAST
   let selectedVerse = verseOptions[Math.floor(Math.random() * verseOptions.length)]; // RANDOM

   var VERSE_URL = "https://scrp.vercel.app/api/ref?verse=" + encodeURI(formatBookChapterVerse(selectedVerse.name, currentChapter, currentVerse));
   var VERSE_INFO = loadJson(VERSE_URL);
   selectedVerse.data = VERSE_INFO;

   var $verses = $('#otherVerses');
   $verses.empty();
   verseOptions.forEach(verse => {
         var $verse = $("<li></li>");
         $verse.addClass('list--verse');
         $verse.attr('data--click', JSON.stringify(verse));
         $verse.click(clickVerse);
         if (verse.name === selectedVerse.name) {
            $verse.addClass('list--verse-selected');
         }
         $verse.html(verse.name);
         $verses.append($verse);
   });

   updateScreen(selectedVerse);
}

function listVerseOptions(currentChapter = 1, currentVerse = 1) {
   bibleChapters = loadBibleChapters();
   let verseOptions = bibleChapters
      .filter(book => book.chapters.length >= currentChapter)
      .map(book => ({
         name: book.name, 
         number: book.number, 
         chapters: book.chapters
            .map((ch,i) => ({chapterNum: i + 1, verses: ch, selectedVerse: currentVerse}))
            .filter(ch => ch.verses >= currentVerse)
            .filter(ch => ch.chapterNum == currentChapter)
      }))
      .filter(book => book.chapters.length > 0);
      return verseOptions;
}
function main() {
   var hash = window.location.hash.substr(1);
   if (hash.match('[0-9]{2}-[0-9]{2}')) {
         var timeCode = hash.substr(0, 5);
         setScreen(timeCode);
         startTime();
   } else {
         startTime(true);
   }
   window.onhashchange = main;
}
