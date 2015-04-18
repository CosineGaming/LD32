// Inserts game into <canvas id="game"></canvas>
// @license magnet:?xt=urn:btih:0effb8f70b3b6f5f70ff270deftileHeight27c3f7705f85&dn=lgpl-3.0.txt Lesser GNU Public License 3.0

// Global Variables

var container;
var game;

var world = {};
var sounds = {};

var keys = new Array(256);

var lastTime = 0;

var quadrantSpeeds = [];

var levels;
var currentLevel = 1;

var tileWidth = 64;
var tileHeight = 32;

var gravity = 0.3;
var velocity = 0;
var xVelocity = 0;

var pulse = 0;
var pulseDir = 1;

var lastSpace = false;

var bufferingAnimations = [];

// Entry point

window.onload = initialize;

// Fundamental Functions

function initialize()
{

	container = document.getElementById("game");
	if (!container.getContext || !container.getContext("2d"))
	{
		unsupported();
		return false;
	}
	game = container.getContext("2d");

	container.setAttribute("tabindex", "0");
	container.focus();
	container.addEventListener("mousedown", mouseDown);
	container.addEventListener("mouseup", mouseUp);
	container.addEventListener("mousemove", mouseMove);
	container.addEventListener("keydown", keyDown);
	container.addEventListener("keyup", keyUp);

	initializeWorld();

	resizeWindow();

	game.lineWidth = 4;
	game.font = "20px white Candara";
	game.fillStyle = "#000"

	window.requestAnimationFrame(update);

	return true;

}

function initializeWorld()
{

	levels = [

		[
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -"
		],

		[
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - 1 1 1 1 - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - t - - - - 1 - - -",
			"- 1 1 1 - - - 1 - m - - - - 1 - - -",
			"- - - - - - - 1 - m - - - - 1 - - -",
			"- - - - - - - 1 - m - - - - - - - -",
			"- - - - - - - 1 - m - 1 - - - - - -",
			"- - - - - - - 1 - m - - - - - - - -",
			"- - - - - - - 1 - m - - - - - - - -",
			"- - - - - - - - - m - - - - - - - -",
			"- - - - 1 - - - - b - - 1 - - - - -",
			"- - - - 1 - - - - - - - - - - 1 - -",
			"- - - - - - - - - - - 1 1 - - - - -",
			"- 1 - - - - - - - - - 1 1 - - - - -",
			"- - - - - - - - - - - - - - - 1 - -",
			"- - - - - - - - - - - - - - - 1 - -",
			"- - 1 1 1 - - 1 1 - 1 - 1 - - 1 - -"
		]

	];

	for (var level=0; level<levels.length; level++)
	{
		for (var y=0; y<levels[level].length; y++)
		{
			levels[level][y] = (levels[level][y]).split("");
			for (var x=0; x<levels[level][y].length; x++)
			{
				if (levels[level][y][x] == " ")
				{
					levels[level][y].splice(x, 1);
				}
			}
		}
	}

	world["u"] = new Object();
	loadImage(world["u"], "assets/themes/grass/grass.png");
	world["b"] = new Object();
	loadImage(world["b"], "assets/themes/grass/wall/base.png");
	world["m"] = new Object();
	loadImage(world["m"], "assets/themes/grass/wall/middle.png");
	world["t"] = new Object();
	loadImage(world["t"], "assets/themes/grass/wall/top.png");

	world[""]

	backgrounds = ["assets/themes/grass/bg.png", "", "assets/themes/desert/bg.png", ""];

	/*world["v"] = new Object();
	world["v"].x = 100;
	world["v"].y = 100;
	loadAnimation(world["v"], "assets/charactertest/", 3, 2, [0, 1, 2, 1, 0]);*/

	world["player"] = new Object();
	world["player"].x = 50;
	world["player"].y = 30;
	world["player"].speed = 6;
	world["player"].quadrant = [0, 0];
	loadImage(world["player"], "assets/player.png");

	/* Code better */
	world["back"] = new Object();
	loadImage(world["back"], "assets/backgrounds/0.png");

	resetQuadrantSpeeds();

}

function render(updateTime)
{

	if (game)
	{
		game.clearRect(0, 0, container.width, container.height);
	}
	else
	{
		// We can't render if we don't have a game.
		return;
	}

	if (world["back"].image)
	{
		game.drawImage(world["back"].image, 0, 0, container.width, container.height);
	}

	for (var y=0; y<levels[currentLevel].length; y++)
	{
		for (var x=0; x<levels[currentLevel][y].length; x++)
		{
			var tileType = levels[currentLevel][y][x];
			var tile = world[tileType];
			if (tile)
			{
				if (tile.image)
				{
					game.drawImage(tile.image, Math.round(x * tileWidth), Math.round(y * tileHeight),
						tileWidth,
						tileHeight);
				}
			}
		}
	}

	everyEntity(function(entity){
		// Code
		if (entity.image)
		{
			game.drawImage(entity.image, Math.round(entity.x), Math.round(entity.y));
		}
		if (entity.animation)
		{
			var anime = entity.animation;
			anime.countdown -= 1;
			if (anime.countdown <= 0)
			{
				anime.countdown = anime.frameMultiplier;
				anime.frame += 1;
			}
			if (anime.frame >= anime.frames.length)
			{
				anime.frame = 0;
			}
			//debugLog(anime.frames[anime.frame]);
			//var frame = anime.images[anime.frames[anime.frame]];
			//debugLog(frame.src);
			//game.drawImage(frame, Math.round(entity.x), Math.round(entity.y));
		}
	});

	game.strokeStyle = "rgba(0,0,0," + String(pulse) + ")";
	var xDistance = container.width / (currentLevel + 1);
	for (var x=1; x<currentLevel+1; x++)
	{
		game.beginPath();
		game.moveTo(x * xDistance, 0);
		game.lineTo(x * xDistance, container.height);
		game.stroke();
	}
	var yDistance = container.height / (currentLevel + 1);
	for (var y=1; y<currentLevel+1; y++)
	{
		game.beginPath();
		game.moveTo(0, y * yDistance);
		game.lineTo(container.width, y * yDistance);
		game.stroke();
	}

	var displayFps = true;

	if (displayFps)
	{
		game.fillText(String(Math.round(updateTime)), 20, 20);
	}

}

function update(totalTime)
{

	window.requestAnimationFrame(update);

	delta = totalTime - lastTime;

	// Code
	var player = world["player"];

	if (player.image)
	{

		var speedMod = quadrantSpeed(getQuadrant(player.x, player.y));
		var speed = player.speed * speedMod;

		var oldX = player.x;
		var oldY = player.y;

		var hangLeft = collidesTile(player, player.x + 1, player.y - 1);
		var hangRight = collidesTile(player, player.x - 1, player.y - 1);

		if (key("A") && !hangLeft)
		{
			player.x -= speed;
		}
		if (key("DE") && !hangRight)
		{
			player.x += speed;
		}
		var jumpSpeed = -5;
		if (key(" W") && collidesTile(player, player.x, player.y) && !lastSpace)
		{
			velocity = jumpSpeed;
		}

		velocity += gravity * speedMod;
		if (hangLeft || hangRight)
		{
			velocity = 0.75 * speedMod;
		}
		player.y += velocity * speedMod;

		xVelocity *= 0.65 * speedMod;
		player.x += xVelocity * speedMod;

		var goingRight = oldX < player.x;
		var goingLeft = oldX > player.x;
		var byX = collidesTile(player, player.x, oldY - 1);
		var byY = collidesTile(player, oldX, player.y);
		var goingDown = oldY < player.y;

		if (collidesTile(player, player.x, player.y))
		{

			if (byY)
			{
				velocity = 0;
				player.y = Math.floor((player.y + player.image.height * goingDown) / tileHeight)
					* tileHeight - player.image.height * goingDown + tileHeight * !goingDown;
			}
			if (byX)
			{
				player.x = Math.floor((player.x + player.image.width * goingRight) / tileWidth)
					* tileWidth - player.image.width * goingRight + tileWidth * goingLeft;
			}

		}

		if ((hangLeft || hangRight) && key(" ") && !lastSpace)
		{
			velocity = jumpSpeed * 1.5;
			xVelocity = 4 * (hangRight * 2 - 1);
			player.x += speed * (hangRight * 2 - 1);
		}

		lastSpace = key(" W");

		if (player.x < 0)
		{
			player.x = 0;
		}
		if (player.x > container.width - player.image.width)
		{
			player.x = container.width - player.image.width;
		}
		if (player.y < 0)
		{
			player.y = 0;
		}
		if (player.y > container.height - player.image.height)
		{
			// Die.
		}
	}

	pulse += 0.02 * pulseDir;
	if (pulse >= 1 || pulse <= 0)
	{
		pulseDir *= -1;
	}

	render(delta);

	lastTime = totalTime;

}

// Other functinos (Gonna leave that typo)

function loadImage(addTo, url)
{

	var image = new Image();
	image.src = url;

	image.addEventListener("load", function() {
		addTo.image = image;
	});

}

function loadAnimation(addTo, url, count, frameMultiplier=1, frames=false, suffix=".png")
{
	addTo.animation = new Object();
	addTo.animation.images = [];
	bufferingAnimations = [];
	for (var frame=0; frame<count; frame++)
	{
		bufferingAnimations[frame] = new Image();
		bufferingAnimations[frame].src = url + String(frame) + suffix;
		//debugLog(bufferingAnimations[frame].src);
		bufferingAnimations[frame].addEventListener("load", function() {
			addTo.animation.images.push(bufferingAnimations[frame]);
			//debugLog(bufferingAnimations[frame]);
		});
	}
	addTo.animation.frameMultiplier = frameMultiplier;
	if (frames)
	{
		addTo.animation.frames = frames;
	}
	else
	{
		addTo.animation.frames = []
		for (var frame=0; frame<count; frame++)
		{
			addTo.animation.frames.push(frame);
		}
	}
	addTo.animation.countdown = addTo.animation.frameMultiplier;
	addTo.animation.frame = frames[0];
}

function everyEntity(what)
{
	for (var key in world)
	{
		if (world.hasOwnProperty(key))
		{
			what(world[key]);
		}
	}
}

function resizeWindow()
{
	container.width = window.innerWidth;
	container.height = window.innerHeight;
	tileWidth = Math.floor(container.width / levels[currentLevel][0].length) + 1;
	tileHeight = Math.floor(container.height / levels[currentLevel].length) + 1;

	game.imageSmoothingEnabled = false;
	game.mozImageSmoothingEnabled = false;
	game.webkitImageSmoothingEnabled = false;
}

function unsupported()
{
	document.getElementById("error-text").innerHTML = "Sorry, but you're using an unsupported browser and can't play this game.";
	container = null;
	game = null;
}

function fatalError(info)
{
	document.getElementById("error-text").innerHTML = "A fatal error has occured: " + info + " Sorry. Try playing on a different browser.";
	container = null;
	game = null;
}

function debugLog(log)
{
	document.getElementById("error-text").innerHTML += log;
}

function key(which)
{
	for (var char=0; char<which.length; char++)
	{
		if (keys[which.charCodeAt(char)])
		{
			return true;
		}
	}
	return false;
}

function tilePos(x, y)
{
	return [Math.floor(x / tileWidth), Math.floor(y / tileHeight)];
}

function getTile(tile)
{
	if (tile[0] >= 0 && tile[0] < levels[currentLevel][0].length &&
		tile[1] >= 0 && tile[1] < levels[currentLevel].length)
	{
		return levels[currentLevel][tile[1]][tile[0]];
	}
	else
	{
		return false;
	}
}

function getQuadrant(x, y)
{
	return [Math.floor(x * (currentLevel + 1) / container.width),
		Math.floor(y * (currentLevel + 1) / container.height)];
}

function changedQuadrant(object, x, y)
{
	for (var plusWidth=0; plusWidth<2; plusWidth++)
	{
		for (var plusHeight=0; plusHeight<2; plusHeight++)
		{
			var cornerQuadrant = getQuadrant(object.x + object.image.width * plusWidth,
				object.y + object.image.height * plusHeight);
			if (cornerQuadrant != object.quadrant)
			{
				return cornerQuadrant;
			}
		}
	}
	return false;
}

function quadrantSpeed(quadrant)
{
	return quadrantSpeeds[quadrant[0]][quadrant[1]];
}

function resetQuadrantSpeeds()
{
	quadrantSpeeds = [];
	for (var x=0; x<currentLevel+1; ++x)
	{
		quadrantSpeeds.push([]);
		for (var y=0; y<currentLevel+1; ++y)
		{
			quadrantSpeeds[x].push(1);
		}
	}
}

function updateQuadrant(object)
{
	newQuadrant = changedQuadrant(object);
	if (newQuadrant)
	{
		object.quadrant = newQuadrant;
	}
}

function collidesTile(object, x, y)
{
	var topLeft = tilePos(x, y);
	var bottomRight = tilePos(x + object.image.width - 1, y + object.image.height);
	for (var x=topLeft[0]; x<bottomRight[0] + 1; x++)
	{
		for (var y=topLeft[1]; y<bottomRight[1] + 1; y++)
		{
			if (getTile([x, y]) != "-")
			{
				return true;
			}
		}
	}
	return false;
}

// Input Handling

function mouseDown(event)
{

	var x = event.clientX;
	var y = event.clientY;
	var quadrant = getQuadrant(x, y);

	var speed = quadrantSpeed(quadrant);

	if (speed != 0)
	{
		quadrantSpeeds[quadrant[0]][quadrant[1]] *= 2;
	}
	else
	{
		quadrantSpeeds[quadrant[0]][quadrant[1]] = 0.5;
	}
	if (speed == 2)
	{
		quadrantSpeeds[quadrant[0]][quadrant[1]] = 0;
	}

	debugLog(quadrant[0]);
	debugLog(", ");
	debugLog(quadrant[1]);
	debugLog(": ");
	debugLog(quadrantSpeed(quadrant));
	debugLog("<br />");

}

function mouseUp(event)
{

}

function mouseMove(event)
{

}

function keyDown(event)
{
	if (!keys[event.keyCode])
	{
		// Don't act on repeats:
	}
	// Do act on repeats:
	keys[event.keyCode] = true;
}

function keyUp(event)
{
	keys[event.keyCode] = false;
}

// @license-end
