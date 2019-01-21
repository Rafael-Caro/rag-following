var extraSpaceH = 0;
var extraSpaceW = 0;
var mainSpace = 600;

var recordingsInfo;
var recordingsList;
var pitchTrack;
var trackFile;
var track;

var select;
var buttonPlay;

var loaded = false;
var paused = true;
var currentTime = 0;
var jump;

function preload() {
  recordingsInfo = loadJSON("files/recordingsInfo.json");
}

function setup () {
  var canvas = createCanvas(extraSpaceW+mainSpace, extraSpaceH+mainSpace);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; margin: 10px auto; position: relative;");
  canvas.parent("sketch-holder");

  ellipseMode(RADIUS);
  angleMode(DEGREES);
  imageMode(CENTER);
  textFont("Laila");
  strokeJoin(ROUND);

  recordingsList = recordingsInfo["recordingsList"];

  select = createSelect()
    .size(120, 25)
    .position(15, 15)
    .changed(start)
    .parent("sketch-holder");
  select.option("Elige");
  var noRec = select.child();
  noRec[0].setAttribute("selected", "true");
  noRec[0].setAttribute("disabled", "true");
  noRec[0].setAttribute("hidden", "true");
  noRec[0].setAttribute("style", "display: none");
  for (var i = 0; i < recordingsList.length; i++) {
    select.option(recordingsInfo[recordingsList[i]].info.option, i);
  }
  buttonPlay = createButton("Carga el audio")
    .size(120, 25)
    .position(extraSpaceW + 15, extraSpaceH + 55)
    .mouseClicked(player)
    .attribute("disabled", "true")
    .parent("sketch-holder");

  background(205, 92, 92);
}

function draw () {}

function start () {
  if (loaded) {
    track.stop();
  }
  loaded = false;
  currentTime = 0;
  var currentRecording = recordingsInfo[recordingsList[select.value()]];
  trackFile = currentRecording.info.trackFile;
  pitchTrack = currentRecording.melody.pitchTrack;
  buttonPlay.html("Carga el audio");
  buttonPlay.removeAttribute("disabled");
}

function player () {
  if (loaded) {
    if (paused) {
      paused = false;
      if (jump == undefined) {
        track.play();
      } else {
        track.play();
        track.jump(jump);
        jump = undefined;
      }
      buttonPlay.html("Pausa");
    } else {
      paused = true;
      currentTime = track.currentTime();
      track.pause();
      buttonPlay.html("Sigue");
    }
  } else {
    initLoading = millis();
    buttonPlay.html("Cargando...");
    buttonPlay.attribute("disabled", "true");
    select.attribute("disabled", "true");
    track = loadSound("tracks/" + trackFile, soundLoaded, failedLoad);
  }
}

function soundLoaded () {
  buttonPlay.html("¡Comienza!");
  buttonPlay.removeAttribute("disabled");
  select.removeAttribute("disabled");
  loaded = true;
  var endLoading = millis();
  print("Track loaded in " + (endLoading-initLoading)/1000 + " seconds");
}

function failedLoad () {
  print("Loading failed");
}
