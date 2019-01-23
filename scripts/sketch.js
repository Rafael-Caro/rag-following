var extraSpaceH = 0;
var extraSpaceW = 0;
var mainSpace = 600;
var margin = 10;
var easing = 0.5;
var backColor;
var frontColor;

var recordingsInfo;
var recordingsList;
var pitchSpace;
var svaraList = [];
var soundList = {};
var svaraRadius1 = 20;
var svaraRadius2 = 17;
var svaraLine = 50;
var minHz;
var maxHz;
var pitchTrack;
var trackFile;
var track;
var trackDuration;
var title;
var artist;
var link;

var select;
var buttonPlay;

var cursorTop;
var cursorBottom;
var cursorY = 0;
var navBoxH = 50;
var navCursor;
var navBox;
var navCursorW = 4;
var clock;

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
  strokeCap(ROUND);

  backColor = color(240, 128, 128);
  frontColor = color(120, 0, 0);

  recordingsList = recordingsInfo["recordingsList"];

  infoLink = select("#info-link");
  infoLink.position(width-60, extraSpaceH + margin*3.5 + 30);
  select = createSelect()
    .size(120, 25)
    .position(margin, margin)
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
    .position(width - 120 - margin, height - margin * 2 - navBoxH - 25)
    .mouseClicked(player)
    .attribute("disabled", "true")
    .parent("sketch-holder");

  navBox = new createNavigationBox();
  navCursor = new CreateNavCursor();

  cursorTop = extraSpaceH + margin*7 + 50;
  cursorBottom = buttonPlay.y-margin*2;
}

function draw () {
  background(backColor);

  textAlign(CENTER, TOP);
  textStyle(NORMAL);
  textSize(30);
  strokeWeight(5);
  stroke(frontColor);
  fill(backColor);
  text(title, extraSpaceW + mainSpace/2, extraSpaceH + margin*3);

  stroke(0, 50);
  strokeWeight(1);
  line(extraSpaceW + margin*2, extraSpaceH + margin*3 + 30, width - margin*2, extraSpaceH + margin*3 + 30);

  textAlign(CENTER, TOP);
  stroke(0, 150);
  strokeWeight(1);
  textSize(20);
  fill(0, 150);
  text(artist, extraSpaceW + mainSpace/2, extraSpaceW + margin*4 + 30);

  // line(0, cursorTop, width, cursorTop);
  // line(0, cursorBottom, width, cursorBottom);

  for (var i = 0; i < svaraList.length; i++) {
    svaraList[i].displayLines();
  }
  for (var i = 0; i < svaraList.length; i++) {
    svaraList[i].displaySvara();
  }

  navBox.displayBack();

  if (loaded) {
    navCursor.update();
    navCursor.display();
    clock.display();
  }

  if (loaded) {
    if (!paused) {
      currentTime = track.currentTime();
    }

    var x = str(currentTime.toFixed(2));
    var p = pitchTrack[x];
    if (p != "silence" && p >= minHz && p <= maxHz) {
      var targetY = map(p, minHz, maxHz, cursorBottom, cursorTop);
      cursorY += (targetY - cursorY) * easing;
      fill("red");
      stroke(frontColor);
      strokeWeight(1);
      ellipse(extraSpaceW+mainSpace/2, cursorY, 5, 5);
    }
  }

  navBox.displayFront();
}

function createNavigationBox () {
  this.x1 = extraSpaceW + margin;
  this.x2 = width - margin;
  this.y1 = height - margin - navBoxH;
  this.y2 = height - margin;
  this.w = this.x2 - this.x1;

  this.displayBack = function () {
    fill(0, 50);
    noStroke();
    rect(this.x1, this.y1, this.w, navBoxH);
  }

  this.displayFront = function () {
    stroke(0, 150);
    strokeWeight(2);
    line(this.x1+1, this.y1, this.x2, this.y1);
    line(this.x2, this.y1, this.x2, this.y2);
    strokeWeight(1);
    line(this.x1, this.y1, this.x1, this.y2);
    line(this.x1, this.y2, this.x2, this.y2);
  }

  this.clicked = function () {
    if (mouseX > this.x1 && mouseX < this.x2 && mouseY > this.y1 && mouseY < this.y2) {
      jump = map(mouseX, this.x1, this.x2, 0, trackDuration);
      if (paused) {
        currentTime = jump;
      } else {
        track.jump(jump);
        jump = undefined;
      }
    }
  }
}

function CreateNavCursor () {
  this.x = navBox.x1 + navCursorW/2;

  this.update = function () {
    this.x = map(currentTime, 0, trackDuration, navBox.x1+navCursorW/2, navBox.x2-navCursorW/2);
    if (navBox.x2 - navCursorW/2 - this.x < 0.005) {
      buttonPlay.html("¡Comienza!");
      track.stop();
      paused = true;
      currentTime = 0;
    }
  }

  this.display = function () {
    stroke(frontColor);
    strokeWeight(navCursorW);
    line(this.x, navBox.y1+navCursorW/2, this.x, navBox.y2-navCursorW/2);
  }
}

function CreateSvara (svara) {
  this.x1 = extraSpaceW + mainSpace/2;
  this.y = map(svara.cent, minHz, maxHz, cursorBottom, cursorTop);
  this.name = svara.svara;
  this.key = svara.key;
  this.function = svara.function;
  if (this.function == "sadja") {
    this.radius = svaraRadius1;
    this.extraX = 20;
    this.col = frontColor;
    this.strokeW = 4;
    this.lineW = 4;
    this.txtCol = backColor;
  } else if (this.function == "vadi") {
    this.radius = svaraRadius1;
    this.extraX = 0;
    this.col = backColor;
    this.strokeW = 4;
    this.lineW = 2;
    this.txtCol = frontColor;
  } else if (this.function == "samvadi") {
    this.radius = svaraRadius2;
    this.extraX = 0;
    this.col = backColor;
    this.strokeW = 2;
    this.lineW = 2;
    this.txtCol = frontColor;
  } else {
    this.radius = svaraRadius2;
    this.extraX = 0;
    this.col = color(0, 0);
    this.strokeW = 0;
    this.lineW = 1;
    this.txtCol = frontColor;
  }
  if (svaraList.length == 0) {
    this.position = 0;
  } else if (svaraList[svaraList.length-1].position == 0) {
    this.position = 1;
  } else {
    this.position = 0;
  }
  this.x2 = this.x1 + svaraLine/2 + (svaraRadius1*2 + margin) * this.position;

  this.displayLines = function () {
    stroke(frontColor);
    strokeWeight(this.lineW);
    line(this.x1-svaraLine/2-this.extraX, this.y, this.x2, this.y)
  }

  this.displaySvara = function () {
    stroke(frontColor);
    strokeWeight(this.strokeW);
    fill(this.col);
    ellipse(this.x2 + svaraRadius1, this.y, svaraRadius1, svaraRadius1);

    textAlign(CENTER, CENTER);
    noStroke();
    textSize(svaraRadius1*0.9);//this.radius*0.9);
    textStyle(BOLD);//this.txtStyle);
    fill(this.txtCol);
    text(this.name, this.x2 + svaraRadius1, this.y+this.radius*0.1);
    stroke(frontColor);
    strokeWeight(3);
    fill(backColor);
    textSize(svaraRadius1*0.7);
    textStyle(NORMAL);
    text(this.key, this.x2 + svaraRadius1 + textWidth(this.name), this.y + (svaraRadius1*0.9)/2)
  }
}

function createSound (svara) {
  this.pitch = svara.pitch;
  this.key = svara.key;
  this.osc = new p5.Oscillator();
  this.osc.setType("sawtooth");
  this.osc.freq(this.pitch);
  soundList[this.key] = this.osc;
}

function start () {
  if (loaded) {
    track.stop();
  }
  paused = true;
  loaded = false;
  currentTime = 0;
  var currentRecording = recordingsInfo[recordingsList[select.value()]];
  trackFile = currentRecording.info.trackFile;
  title = currentRecording.info.title;
  artist = currentRecording.info.artist;
  link = currentRecording.info.link;
  infoLink.attribute("href", link)
    .html("+info");
  trackDuration = currentRecording.info.duration;
  pitchSpace = currentRecording.melody.pitchSpace;
  minHz = pitchSpace[0].cent-100;
  maxHz = pitchSpace[pitchSpace.length-1].cent+100;
  svaraList = [];
  soundList = {};
  for (var i = 0; i < pitchSpace.length; i++) {
    var svara = new CreateSvara(pitchSpace[i]);
    svaraList.push(svara);
    createSound(pitchSpace[i]);
  }
  pitchTrack = currentRecording.melody.pitchTrack;
  clock = new CreateClock;
  buttonPlay.html("Carga el audio");
  buttonPlay.removeAttribute("disabled");
}

function CreateClock () {
  this.clock;
  this.total = niceTime(trackDuration);
  this.now;
  this.display = function () {
    this.now = niceTime(currentTime);
    this.clock = this.now + " / " + this.total;
    textAlign(LEFT, BOTTOM);
    textSize(12);
    textStyle(NORMAL);
    noStroke();
    fill(50);
    text(this.clock, margin, buttonPlay.y+buttonPlay.height);
  }
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

function mouseClicked () {
  if (loaded) {
    navBox.clicked();
  }
}

function keyPressed () {
  soundList[key.toLowerCase()].start();
}

function keyReleased () {
  soundList[key.toLowerCase()].stop();
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
