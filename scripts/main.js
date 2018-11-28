var timerText = document.getElementById("mainTime");
var space = 32;
var startTime;
var timerRunning = false;
var ignorePress = false;
var table = document.getElementById("timeList");
var scrambleText = document.querySelector("h1");
var times = []; 
var bests = document.getElementById("bests");
var current = document.getElementById("curr");
scrambleText.textContent = scramblers["333"].getRandomScramble().scramble_string;
var canvas = document.getElementById("myCanvas");
var width = window.innerWidth * 0.33333-10;
var height = window.innerHeight;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");


readFromLocalFile();

document.onkeydown = function(evt){
	evt = evt || window.event;
	var charCode = evt.keyCode || evt.which;
	
	if (charCode == space && timerRunning){ // stop timer
		timerRunning = false;
		ignorePress = true;
		scrambleText.textContent = scramblers["333"].getRandomScramble().scramble_string; 
		times.push(new Time(timerText.textContent, scrambleText.textContent, formatDate(new Date())));
		updateTables(times.length - 1);
		drawGraph();
		saveToLocalFile();
	}
	return !(evt.keyCode == 32 && evt.target == document.body); // don't scroll down when pressing space
};

document.onkeyup = function(evt){
	evt = evt || window.event;
	var charCode = evt.keyCode || evt.which;
	
	if (charCode == space && !timerRunning && !ignorePress){
		startTime = new Date();
		timerRunning = true;
	}
	else if (charCode == space){
		ignorePress = false;
	}
};

/*document.onresize = function(){
	width = window.innerWidth * 0.33333-10;
	height = window.innerHeight;
	canvas.width = width;
	canvas.height = height;
	if (times.length > 0){
		drawGraph();
	}
};*/

function update()
{
	if (timerRunning)
	{
		endTime = new Date();
		var timeDiff = endTime - startTime; 
		timeDiff /= 1000;
		var seconds = timeDiff.toFixed(2);
		timerText.textContent = seconds;
	}
	requestAnimationFrame(update);
}

requestAnimationFrame(update); // start update loop

function calcAverage(t, size, startLoc) // works backwards from start
{
	var remove = Math.ceil(size * 0.05);
	if (size == 3 || size == 1){ 
		remove = 0;
	}
	var temp = [];
	var avg = 0;
	if (startLoc >= size){
		for (var i = startLoc - size; i < startLoc; i++){
			temp.push(parseFloat(t[i].time));
		}
		temp.sort();
		for (var j = remove; j < size - remove; j++){
			avg += temp[j];
		}
		avg /= (size - (2 * remove));
		return avg.toFixed(2);
	}
	else return "";
}

function calcBestAverage(t, size)
{
	var loc = 0;
	var best = 99999999;
	var temp = [];
	while (t.length >= size + loc){
		for (var i = loc; i < loc + size; i++){
			temp.push(t[i]);
		}
		var avg = parseFloat(calcAverage(temp, size, temp.length));
		if (avg < best){
			best = avg;
		}
		temp = [];
		loc++;
	}
	return best > 999999 ? " " : best;
}

function getIndexOfBestSingle(){
	var b = 9999999999;
	var bI = 0;
	for (var i = 0; i < times.length; i++){
		if (parseFloat(times[i].time) < b){
			b = parseFloat(times[i].time);
			bI = i;
		}
	}
	return bI;
}

function updateTables(locInArray){ 
	var row = table.insertRow(0);
	var cell = row.insertCell(0);
	var bestsRow = bests.rows[0];
	var currRow = current.rows[0];
	
	for (var i = 1; i < 8; i++){
		var avgSize;
		switch (i){
			case 1:
				avgSize = 1;
				break;
			case 2:
				avgSize = 3;
				break;
			case 3:
				avgSize = 5;
				break;
			case 4:
				avgSize = 12;
				break;
			case 5:
				avgSize = 25;
				break;
			case 6:
				avgSize = 50;
				break;
			case 7:
				avgSize = 100;
				break;
		}
		var c = row.insertCell(i);
		c.innerHTML = calcAverage(times, avgSize, locInArray + 1);
		bestsRow.cells[i].innerHTML = calcBestAverage(times, avgSize);
		currRow.cells[i].innerHTML = c.innerHTML;
	}
	cell.innerHTML = locInArray + 1;
	row.cells[1].innerHTML = times[locInArray].time;
	row.cells[1].className = "CellWithComment";
	var s1 = document.createElement('span'); // for tooltip thingers
	var deleteButton = document.createElement('button');
	deleteButton.innerHTML = "X";
	deleteButton.onclick = function(){onDeleteButtonClick();};
	s1.innerHTML = times[locInArray].time + "<br/>" + times[locInArray].scramble + "<br/>" + times[locInArray].date + "<br/>";
	s1.className = "CellComment";
	s1.appendChild(deleteButton);
	row.cells[1].appendChild(s1);
	var s1number2thisisstupid = s1.cloneNode(true);
	currRow.cells[1].appendChild(s1number2thisisstupid);
	var s2 = document.createElement('span'); // absolutely no idea why i have to create a new one of these for every solve but it doesn't seem to work any other way
	s2.className = "CellComment";
	var bestSingleLoc = getIndexOfBestSingle();
	s2.innerHTML = times[bestSingleLoc].time + "<br/>" + times[bestSingleLoc].scramble + "<br/>" + times[bestSingleLoc].date; // TODO: dd/mm/yyyy format
	bestsRow.cells[1].appendChild(s2);
}

function onDeleteButtonClick(){
	scrambleText.textContent = "Test";
}

function getMinOrMaxTime(minmax){ // 1 for min, 2 for max
	var goal = 0;
	for (var i = 0; i < times.length; i++){
		if (minmax == 2){
			if (parseFloat(times[i].time) > goal){
				goal = parseFloat(times[i].time);
			}
		}
		else if (minmax == 1){
			if (parseFloat(times[i].time) < goal){
				goal = parseFloat(times[i].time);
			}
		}
	}
	return goal;
}

function drawGraph(){
	ctx.clearRect(0, 0, width + 5, height / 2 + 5);
	ctx.fillStyle = "#dddddd";
	ctx.fillRect(0, 0, width, height / 2);
	ctx.fillStyle = "#aaaaaa"
	ctx.strokeRect(0, 0, width - 1, height / 2);
	var xScale = width;
	if (times.count != 0 && times.count != 1) {
		xScale = width / (times.length - 1);
	}
	var yScale = (height/2) / (getMinOrMaxTime(2) + 1);
	ctx.fillStyle = "red";
	for (var i = 0; i < times.length; i++){
		var x = i * xScale;
		if (i == times.length - 1){
			x -= 6;
		}
		var y = (parseFloat(times[i].time) * yScale) * - 1 + height / 2 - 2;
		ctx.fillRect(x, y, 3, 3);
	}
	ctx.fillStyle = "blue";
	for (var j = 0; j <= 5; j++){
		var y = ((getMinOrMaxTime(2)/5) * yScale * j) * - 1 + height / 2 - 2;
		ctx.fillRect(0, y, width, 1);
		ctx.strokeText(((-y-2+(height/2))/yScale).toFixed(2), 0, y);
	}
}

function formatDate(d){
	return (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
}

function saveToLocalFile(){
	var t = [];
	var s = [];
	var d = [];
	for (var i = 0; i < times.length; i++){
		t.push(times[i].time);
		s.push(times[i].scramble);
		d.push(times[i].date);
	}
	localStorage.setItem('times', t.join("|"));
	localStorage.setItem('scrambles', s.join("|"));
	localStorage.setItem('dates', d.join("|"));
}

function readFromLocalFile(){
	if (localStorage.getItem('times') != null){
		var t = localStorage.getItem('times').split("|");
		var s = localStorage.getItem('scrambles').split("|");
		var d = localStorage.getItem('dates').split("|");
		for (var i = 0; i < t.length; i++){
			times.push(new Time(t[i], s[i], formatDate(new Date(d[i]))));
			updateTables(times.length - 1);
		}
		drawGraph();
	}
}





