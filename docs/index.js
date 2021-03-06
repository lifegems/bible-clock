var current_date;
var running_seconds;
var current_seconds = "00.0";
var static;

function loadFile(timeStamp) {
   var text = {};
   $.ajaxSetup({
         async: false
   });
   $.getJSON("times/" + timeStamp + ".json", function (json) {
         text = json;
   });
   $.ajaxSetup({
         async: true
   });
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
function updateScreen(objVerse) {
   var quote_len = (objVerse.quote).length;
   try {
      if (objVerse.book === "") {
         var chapter = parseInt(objVerse.verse.substr(0, 2));
         var verse = objVerse.verse.substr(3, 2);
         $('#quote').html(objVerse.quote);
         $('#noVerse').html("* There is no bible book with chapter and verse <b>" + formatVerse(objVerse.verse) + "</b>");
         $('#citation').hide();
         return;
      }
      $('#noVerse').html("");
      $('#citation').show();
      $('#quote').html(objVerse.quote);
      $('#link').attr('href', getWOLLink(objVerse.book + " " + formatVerse(objVerse.verse)));
      $('#book').html(objVerse.book);
      $('#verse').html(formatVerse(objVerse.verse));
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
function setScreen(timeCode) {
   timeCode = validateTimeCode(timeCode);
   var lit_json = loadFile(timeCode);
   var lit_json_single = lit_json[Math.floor(Math.random() * lit_json.length)];

   var $verses = $('#otherVerses');
   $verses.empty();
   lit_json.forEach(verse => {
         var $verse = $("<li></li>");
         $verse.addClass('list--verse');
         $verse.attr('data--click', JSON.stringify(verse));
         $verse.click(clickVerse);
         if (verse.book === lit_json_single.book) {
            $verse.addClass('list--verse-selected');
         }
         $verse.html(verse.book);
         $verses.append($verse);
   });

   updateScreen(lit_json_single);
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