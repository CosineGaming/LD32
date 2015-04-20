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
var currentLevel = 0;
var levelData;

var tileWidth = 64;
var tileHeight = 32;

var levelWidth = 18;
var levelHeight = 18;

var gravity = 0.02;

var pulse = 0;
var pulseDir = 1;

var lastSpace = false;
var resizeTimer = false;

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
	window.onresize = resizeWindowCallback;

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
			"- - - g - - g - - - - g - - g - - -",
			"- - g - - - g - g g - g - - - g - -",
			"- - - - - - - g - - g g - - - - - -",
			"g - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"g - - - - - - - - - - - - - - - - -",
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

	// Splits, spawnX, spawnY
	levelData = [
		[2, 0.001, 0.001],
		[2, 0.001, 0.001]
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

	// Level 1 tiles and moving tile placement
	entity("g", "assets/themes/grass/grass.png");

	entity("b", "assets/themes/grass/wall/base.png");
	entity("m", "assets/themes/grass/wall/middle.png");
	entity("t", "assets/themes/grass/wall/top.png");

	entity("l", "assets/themes/grass/horizontal/left.png");
	entity("h", "assets/themes/grass/horizontal/middle.png");
	entity("r", "assets/themes/grass/horizontal/right.png");

	entity("gm", undefined, 10, 4, 1, 1, -0.05);
	loadAnimation(world["gm"], "assets/themes/grass/moving/", 5, 3)

	entity("bear", undefined, 4, 7, 1, 2);
	loadAnimation(world["bear"], "assets/enemies/bear/", 3, 3);

	backgrounds = ["assets/themes/grass/bg.png", "", "assets/themes/desert/bg.png", ""];

	entity("player", undefined, levelData[0][1], levelData[0][2], 0.844, 1.688);
	var player = world["player"];
	player.animations = new Object();
	loadAnimation(player, "assets/player/right/", 3, 4);
	player.animations["right"] = player.animation;
	loadAnimation(player, "assets/player/left/", 3, 4);
	player.animations["left"] = player.animation;
	loadAnimation(player, "assets/player/whack/", 4, 4);
	player.animations["whack"] = player.animation;
	loadAnimation(player, "assets/player/rest/", 3, 15, [0,1,2,1,0]);
	player.animations["rest"] = player.animation;

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

	/*if (world["back"].image)
	{
		game.drawImage(world["back"].image, 0, 0, container.width, container.height);
	}*/

	for (var y=0; y<levelWidth; y++)
	{
		for (var x=0; x<levelHeight; x++)
		{
			var tileType = levels[currentLevel][y][x];
			var tile = world[tileType];
			if (tile)
			{
				var placeX = Math.round(x * tileWidth);
				var placeY = Math.round(y * tileHeight);
				var draw = false;
				if (tile.animation)
				{
					var frame = getAnimationFrame(tile.animation,
						quadrantSpeed(getQuadrant(x, y)));
					if (frame)
					{
						draw = frame;
					}
				}
				else if (tile.image)
				{
					if (tile.image.complete)
					{
						draw = tile.image
					}
				}
				if (draw)
				{
					game.drawImage(draw, placeX, placeY, tileWidth, tileHeight);
				}
			}
		}
	}

	everyEntity(function(entity){
		if (typeof entity.x !== "undefined")
		{
			var draw = false;
			if (entity.animation)
			{
				var frame = getAnimationFrame(entity.animation,
					quadrantSpeed(getEntityQuadrant(entity, entity.x, entity.y)));
				if (frame)
				{
					draw = frame;
				}
			}
			else if (entity.image)
			{
				if (entity.image.complete)
				{
					draw = entity.image;
				}
			}
			if (draw)
			{
				var width = entity.width;
				var height = entity.height;
				if (!entity.width)
				{
					width = entity.image.width;
					height = entity.image.height;
				}
				game.drawImage(draw, Math.round(entity.x * tileWidth),
					Math.round(entity.y * tileHeight),
					Math.round(width * tileWidth),
					Math.round(height * tileHeight));
			}
		}
	});

	for (var x=0; x<quadrantSpeeds.length; x++)
	{
		for (var y=0; y<quadrantSpeeds[x].length; y++)
		{
			game.beginPath();
			game.fillStyle = "rgba(0,0,0," + String(quadrantSpeed([x, y]) / 4) + ")";
			var sectWidth = container.width / levelData[currentLevel][0];
			var sectHeight = container.height / levelData[currentLevel][0];
			game.rect(x * sectWidth, y * sectHeight, sectWidth, sectHeight);
			game.fill();
		}
	}

	game.strokeStyle = "rgba(0,0,0," + String(pulse) + ")";
	var xDistance = container.width / levelData[currentLevel][0];
	for (var x=1; x<levelData[currentLevel][0]; x++)
	{
		game.beginPath();
		game.moveTo(x * xDistance, 0);
		game.lineTo(x * xDistance, container.height);
		game.stroke();
	}
	var yDistance = container.height / levelData[currentLevel][0];
	for (var y=1; y<levelData[currentLevel][0]; y++)
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

	everyEntity(function(entity){
		if (typeof entity.x != "undefined")
		{
			if (entity.name != "player")
			{
				if (entity.xVelocity)
				{
					entity.x += entity.xVelocity;
				}
				if (entity.yVelocity)
				{
				//	entity.y += entity.yVelocity;
				}
			}
		}
	});

	var player = world["player"];

	var speedMod = quadrantSpeed(getEntityQuadrant(player));

	if (speedMod != 0)
	{

		var speed = 0.15 * speedMod;

		var oldX = player.x;
		var oldY = player.y;

		var hangLeft = collidesTile(player, player.x + 0.01, player.y - 0.001);
		var hangRight = collidesTile(player, player.x - 0.01, player.y - 0.001);

		if (key("A") && !hangLeft)
		{
			player.x -= speed;
			player.animation = player.animations["left"];
		}
		else if (key("D") && !hangRight)
		{
			player.x += speed;
			player.animation = player.animations["right"];
		}
		else
		{
			player.animation = player.animations["rest"];
		}
		var jumpSpeed = -0.3;
		if ((key(" W") || keys[0]) && collidesTile(player, player.x, player.y) && !lastSpace)
		{
			player.yVelocity = jumpSpeed;
		}
		if (key("E"))
		{
			player.animation = player.animations["whack"];
		}

		if (hangLeft || hangRight)
		{
			player.yVelocity = 0.01;
			if (key(" W") && !lastSpace)
			{
				player.yVelocity = jumpSpeed * 1.2;
				player.xVelocity = 0.08 * (hangRight * 2 - 1);
				player.x += speed * (hangRight * 2 - 1);
			}
		}
		lastSpace = key(" W");

		player.yVelocity += gravity * speedMod;
		player.y += player.yVelocity * speedMod;
		player.xVelocity *= Math.pow(0.85, speedMod);
		player.xVelocity += player.xVelocity;

		var goingRight = oldX < player.x;
		var goingLeft = oldX > player.x;
		var byX = collidesTile(player, player.x, oldY - 0.001);
		var byY = collidesTile(player, oldX, player.y);
		var goingDown = oldY < player.y;

		if (collidesTile(player, player.x, player.y))
		{

			if (byY)
			{
				player.yVelocity = 0;
				player.y = Math.floor(player.y + player.height * goingDown)
					- player.height * goingDown + !goingDown;
			}
			if (byX)
			{
				player.x = Math.floor(player.x + player.width * goingRight)
					- player.width * goingRight + goingLeft;
			}

		}

		if (player.x < 0)
		{
			player.x = 0;
		}
		if (player.x > levelWidth - player.width)
		{
			player.x = levelWidth - player.width;
		}
		if (player.y < 0)
		{
			player.y = 0;
		}
		if (player.y > levelHeight - player.height)
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

function entity(name, image, x, y, width, height, xVelocity, yVelocity)
{
	world[name] = new Object();
	world[name].name = name;
	if (typeof image != "undefined")
	{
		loadImage(world[name], image);
	}
	if (typeof x != "undefined")
	{
		world[name].x = x;
		world[name].y = y;
	}
	if (typeof width != "undefined")
	{
		world[name].width = width;
		world[name].height = height;
	}
	world[name].xVelocity = backUp(xVelocity, 0);
	world[name].yVelocity = backUp(yVelocity, 0);
}

function loadImage(addTo, url)
{

	var image = new Image();
	//image.addEventListener("load", function(){
		addTo.image = image;
	//});
	image.src = url;

}

function loadAnimation(addTo, url, count, frameMultiplier, frames, repeat, whenDone, suffix)
{

	frameMultiplier = backUp(frameMultiplier, 1);
	repeat = backUp(repeat, true);
	suffix = backUp(suffix, ".png");

	addTo.animation = new Object();
	addTo.animation.images = [];
	for (var frame=0; frame<count; frame++)
	{
		var image = new Image();
		if (frame == 0)
		{
			image.addEventListener("load", function() {
				addTo.image = new Object();
				addTo.image.width = image.width / tileWidth;
				addTo.image.height = image.height / tileHeight;
			});
		}
		image.src = url + String(frame) + suffix;
		addTo.animation.images.push(image);
	}

	addTo.animation.frameMultiplier = frameMultiplier;

	if (typeof frames != "undefined")
	{
		addTo.animation.frames = frames;
	}
	else
	{
		addTo.animation.frames = [];
		for (var frame=0; frame<count; frame++)
		{
			addTo.animation.frames.push(frame);
		}
	}

	addTo.animation.repeat = repeat;
	if (typeof whenDone != "undefined")
	{
		addTo.animation.whenDone = whenDone;
	}

	addTo.animation.countdown = addTo.animation.frameMultiplier;
	addTo.animation.frame = addTo.animation.frames[0];

}

function getAnimationFrame(anime, speed)
{
	anime.countdown -= speed;
	if (anime.countdown <= 0)
	{
		anime.countdown = anime.frameMultiplier;
		anime.frame += 1;
	}
	if (anime.frame >= anime.frames.length)
	{
		anime.frame = 0;
	}
	var frame = anime.images[anime.frames[anime.frame]];
	if (frame.complete)
	{
		return frame;
	}
	return false;
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
	tileWidth = Math.floor(container.width / levelWidth) + 1;
	tileHeight = Math.floor(container.height / levelHeight) + 1;

	game.imageSmoothingEnabled = false;
	game.mozImageSmoothingEnabled = false;
	game.webkitImageSmoothingEnabled = false;

	game.lineWidth = 4;

}

function resizeWindowCallback()
{
	if (resizeTimer)
	{
		clearTimeout(resizeTimer);
	}
	resizeTimer = setTimeout(resizeWindow, 100);
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
	return [Math.floor(x), Math.floor(y)];
}

function getTile(tile)
{
	if (tile[0] >= 0 && tile[0] < levelWidth &&
		tile[1] >= 0 && tile[1] < levelHeight)
	{
		return levels[currentLevel][tile[1]][tile[0]];
	}
	else
	{
		return "-";
	}
}

function getQuadrant(x, y)
{
	return [Math.floor(x * levelData[currentLevel][0] / levelWidth),
		Math.floor(y * levelData[currentLevel][0] / levelHeight)];
}

function getEntityQuadrant(entity, x=-1, y=-1)
{

	var eX = x;
	var eY = y;
	if (x == -1)
	{
		if (typeof entity.x == "undefined")
		{
			return false;
		}
		eX = entity.x;
		eY = entity.y;
	}
	if (typeof entity.oldQuadrant == "undefined")
	{
		entity.oldQuadrant = [-1, -1];
	}
	var newQuadrant = false;
	var oldQuadrant = false;
	var width = 0;
	var height = 0;
	if (entity.image)
	{
		width = entity.width;
		height = entity.height - 0.05;
	}
	for (var bottomRight=0; bottomRight<2; bottomRight++)
	{
		var cornerQuadrant = getQuadrant(eX + width * bottomRight,
			eY + height * bottomRight);
		if (cornerQuadrant[0] == entity.oldQuadrant[0]
			&& cornerQuadrant[1] == entity.oldQuadrant[1])
		{
			oldQuadrant = true;
		}
		else
		{
			newQuadrant = cornerQuadrant;
		}
	}
	if (oldQuadrant && newQuadrant)
	{
		return newQuadrant;
	}
	else if (newQuadrant)
	{
		entity.oldQuadrant = newQuadrant;
		return newQuadrant;
	}
	else
	{
		return entity.oldQuadrant;
	}

}

function quadrantSpeed(quadrant)
{
	if (quadrant[0] >= 0 && quadrant[0] < levelData[currentLevel][0]
		&& quadrant[0] >= 0 && quadrant[0] < levelData[currentLevel][0])
	{
		return quadrantSpeeds[quadrant[0]][quadrant[1]];
	}
	else
	{
		return false;
	}
}

function resetQuadrantSpeeds()
{
	quadrantSpeeds = [];
	for (var x=0; x<levelData[currentLevel][0]; ++x)
	{
		quadrantSpeeds.push([]);
		for (var y=0; y<levelData[currentLevel][0]; ++y)
		{
			quadrantSpeeds[x].push(1);
		}
	}
}

function collidesTile(entity, x=-1, y=-1)
{
	var eX = x;
	var eY = y;
	if (x == -1)
	{
		eX = entity.x;
		eY = entity.y;
	}
	var topLeft = tilePos(x, y);
	var bottomRight = tilePos(x + entity.width - 0.001, y + entity.height);
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

function collidesEntity(entity, x=-1, y=-1)
{
	return false;
}

function collides(entity, x=-1, y=-1)
{
	var e = collidesEntity(entity, x, y);
	if (e)
	{
		return e;
	}
	var t = collidesTile(entity, x, y);
	if (t)
	{
		return t;
	}
	return false;
}

// General Javascript help

function backUp(check, value)
{
	if (typeof check == "undefined")
	{
		return value;
	}
	return check;
}

// Input Handling

function mouseDown(event)
{

	var x = event.clientX / tileWidth;
	var y = event.clientY / tileHeight;
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
