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

document.onkeydown = function(evt){
	evt = evt || window.event;
	var charCode = evt.keyCode || evt.which;
	
	if (charCode == space && timerRunning) // stop timer
	{
		timerRunning = false;
		ignorePress = true;
		scrambleText.textContent = scramblers["333"].getRandomScramble().scramble_string; 
		times.push(new Time(timerText.textContent, scrambleText.textContent, new Date()));
		updateTables();
		drawGraph();
	}
	return !(evt.keyCode == 32 && evt.target == document.body); // don't scroll down when pressing space
};

document.onkeyup = function(evt){
	evt = evt || window.event;
	var charCode = evt.keyCode || evt.which;
	
	if (charCode == space && !timerRunning && !ignorePress)
	{
		startTime = new Date();
		timerRunning = true;
	}
	else if (charCode == space)
	{
		ignorePress = false;
	}
};

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

function calcAverage(t, size) // works backwards from start
{
	var remove = Math.ceil(size * 0.05);
	if (size == 3 || size == 1){ 
		remove = 0;
	}
	var temp = [];
	var avg = 0;
	if (t.length >= size){
		for (var i = t.length - size; i < t.length; i++){
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
		var avg = parseFloat(calcAverage(temp, size));
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

function updateTables(){ // loop this garbage boi, might be messy but still better than this shit
	var row = table.insertRow(0);
	var cell = row.insertCell(0);
	var cell1 = row.insertCell(1);
	var cell2 = row.insertCell(2);
	var cell3 = row.insertCell(3);
	var cell4 = row.insertCell(4);
	var cell5 = row.insertCell(5);
	var cell6 = row.insertCell(6);
	var cell7 = row.insertCell(7);
	cell.innerHTML = times.length;
	cell1.innerHTML = timerText.textContent;
	cell1.className = "CellWithComment";
	var s1 = document.createElement('span'); // for tooltip thingers
	s1.innerHTML = times[times.length - 1].time + "<br/>" + times[times.length - 1].scramble + "<br/>" + times[times.length - 1].date.toDateString();
	s1.className = "CellComment";
	cell1.appendChild(s1);
	cell2.innerHTML = calcAverage(times, 3);
	cell3.innerHTML = calcAverage(times, 5);
	cell4.innerHTML = calcAverage(times, 12);
	cell5.innerHTML = calcAverage(times, 25);
	cell6.innerHTML = calcAverage(times, 50);
	cell7.innerHTML = calcAverage(times, 100);
	var bestsRow = bests.rows[0];
	bestsRow.cells[1].innerHTML = calcBestAverage(times, 1);
	var s2 = document.createElement('span'); // absolutely no idea why i have to create a new one of these for every solve but it doesn't seem to work any other way
	s2.className = "CellComment";
	var bestSingleLoc = getIndexOfBestSingle();
	s2.innerHTML = times[bestSingleLoc].time + "<br/>" + times[bestSingleLoc].scramble + "<br/>" + times[bestSingleLoc].date.toDateString(); // TODO: dd/mm/yyyy format
	bestsRow.cells[1].appendChild(s2);
	bestsRow.cells[2].innerHTML = calcBestAverage(times, 3);
	bestsRow.cells[3].innerHTML = calcBestAverage(times, 5);
	bestsRow.cells[4].innerHTML = calcBestAverage(times, 12);
	bestsRow.cells[5].innerHTML = calcBestAverage(times, 25);
	bestsRow.cells[6].innerHTML = calcBestAverage(times, 50);
	bestsRow.cells[7].innerHTML = calcBestAverage(times, 100);
	var currRow = current.rows[0];
	currRow.cells[1].innerHTML = cell1.innerHTML;
	currRow.cells[2].innerHTML = cell2.innerHTML;
	currRow.cells[3].innerHTML = cell3.innerHTML;
	currRow.cells[4].innerHTML = cell4.innerHTML;
	currRow.cells[5].innerHTML = cell5.innerHTML;
	currRow.cells[6].innerHTML = cell6.innerHTML;
	currRow.cells[7].innerHTML = cell7.innerHTML;
}

function getMaxTime(){
	var max = 0;
	for (var i = 0; i < times.length; i++){
		if (parseFloat(times[i].time) > max){
			max = parseFloat(times[i].time);
		}
	}
	return max;
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
	var yScale = (height/2) / (getMaxTime() + 1);
	ctx.fillStyle = "blue";
	for (var i = 0; i < times.length; i++){
		var x = i * xScale;
		if (i == times.length - 1){
			x -= 6;
		}
		var y = (parseFloat(times[i].time) * yScale) * - 1 + height / 2 - 2;
		ctx.fillRect(x, y, 3, 3);
	}
}

//drawGraph();





