function setup() {
	createCanvas(400, 400).parent("sketch");
}

function draw() {
	background(0);
	translate(width / 2, height / 2);
	rotate(-HALF_PI);

	fill(255);
	noStroke();
	ellipse(0, 0, 300, 300);

	let hourHandLen = 70;
	let hourTheta = TWO_PI * ((hour() % 12) + (minute() + second() / 60) / 60) / 12;
	stroke(150);
	strokeWeight(8);
	line(0, 0, hourHandLen * cos(hourTheta), hourHandLen * sin(hourTheta));

	let minuteHandLen = 125;
	let minuteTheta = TWO_PI * minute() / 60;
	stroke(50);
	strokeWeight(5);
	line(0, 0, minuteHandLen * cos(minuteTheta), minuteHandLen * sin(minuteTheta));

	let secondHandLen = 125;
	let secondHandTheta = TWO_PI * second() / 60;
	stroke(255, 0, 0);
	strokeWeight(3);
	line(0, 0, secondHandLen * cos(secondHandTheta), secondHandLen * sin(secondHandTheta));

	stroke(0);
	strokeWeight(10);
	point(0, 0);
}
