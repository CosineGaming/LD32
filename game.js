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
			"- - - - - - - g - - g - - - - - - -",
			"g - - - - - - - - - - - - - - - - -",
			"- - - - - - - - - i - - - - - - - -",
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
	world["bg"] = new Entity("assets/themes/grass/bg.png", 0, 0, levelWidth, levelHeight)

	world["g"] = new Entity("assets/themes/grass/grass.png");

	world["b"] = new Entity("assets/themes/grass/wall/base.png");
	world["m"] = new Entity("assets/themes/grass/wall/middle.png");
	world["t"] = new Entity("assets/themes/grass/wall/top.png");

	world["l"] = new Entity("assets/themes/grass/horizontal/left.png");
	world["h"] = new Entity("assets/themes/grass/horizontal/middle.png");
	world["r"] = new Entity("assets/themes/grass/horizontal/right.png");

	world["gm"] = new Entity(undefined, 0, 13, 1, 1, "tile", "grass", 0.05);
	world["gm"].loadAnimation("assets/themes/grass/moving/", 5, 3);

	world["gm2"] = new Entity(undefined, 9, 13, 1, 1, "tile", "grass", 0, 0.1);
	world["gm2"].animation = world["gm"].animation;
	/*world["gm2"] = world["gm"];
	world["gm2"].x = 15;
	world["gm2"].y = 9;
	world["gm2"].xVelocity = 0;
	world["gm2"].yVelocity = 0.25;*/

	world["bear"] = new Entity(undefined, 4, 7, 1, 2);
	world["bear"].loadAnimation("assets/enemies/bear/", 3, 3);

	var player = new Entity(undefined, levelData[0][1], levelData[0][2], 0.844, 1.688, "player");
	world["player"] = player;
	player.animations = new Object();
	player.loadAnimation("assets/player/right/", 3, 4);
	player.animations["right"] = player.animation;
	player.loadAnimation("assets/player/left/", 3, 4);
	player.animations["left"] = player.animation;
	player.loadAnimation("assets/player/whack/", 4, 5, undefined, false);
	player.animations["whack"] = player.animation;
	player.loadAnimation("assets/player/rest/", 3, 15, [0,1,2,1,0]);
	player.animations["rest"] = player.animation;

	resetQuadrantSpeeds();

}

function render(updateTime)
{

	if ("game" in window)
	{
		game.clearRect(0, 0, container.width, container.height);
	}
	else
	{
		// We can't render if we don't have a game.
		return;
	}

	everyEntity(function(entity){entity.render();});

	for (var y=0; y<levelWidth; y++)
	{
		for (var x=0; x<levelHeight; x++)
		{
			renderTile(x, y);
		}
	}

	renderQuadrants();

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

	everyEntity(function(entity)
	{

		if (entity.name != "player")
		{

			if (entity.xVelocity)
			{
				entity.x += entity.xVelocity * quadrantSpeed(entity.getQuadrant());
			}
			if (entity.yVelocity)
			{
				entity.y += entity.yVelocity * quadrantSpeed(entity.getQuadrant());
			}

		}

		if (entity.name == "tile")
		{

			if (entity.collides())
			{
				entity.keepInScreen();
				entity.xVelocity *= -1;
				entity.yVelocity *= -1;
			}

		}

	});

	var player = world["player"];

	var speedMod = quadrantSpeed(player.getQuadrant());

	if (speedMod != 0)
	{

		var speed = 0.15 * speedMod;

		var oldX = player.x;
		var oldY = player.y;

		var hangLeft = player.collidesTile(player.x + 0.01, player.y - 0.001);
		var hangRight = player.collidesTile(player.x - 0.01, player.y - 0.001);

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
		if ((key(" W") || keys[0] ) && player.collidesTile() && !lastSpace)
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
		player.x += player.xVelocity * speedMod;

		var goingRight = oldX < player.x;
		var goingLeft = oldX > player.x;
		var byX = player.collidesTile(player.x, oldY - 0.001);
		var byY = player.collidesTile(oldX, player.y);
		var goingDown = oldY < player.y;

		if (player.collidesTile())
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

		player.keepInScreen();

	}

	pulse += 0.02 * pulseDir;
	if (pulse >= 1 || pulse <= 0)
	{
		pulseDir *= -1;
	}

	render(delta);

	lastTime = totalTime;

}

function renderQuadrants()
{

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

}

function renderTile(x, y)
{

	var tileType = levels[currentLevel][y][x];
	var tile = world[tileType];

	if (tile)
	{

		var placeX = Math.round(x * tileWidth);
		var placeY = Math.round(y * tileHeight);
		var draw = null;

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
			if (draw.complete)
			{
				game.drawImage(draw, placeX, placeY, tileWidth, tileHeight);
			}
		}

	}

}

var Entity = (function()
{

	function Entity(image, x, y, width, height, name, type, xVelocity, yVelocity)
	{

		if (typeof image != "undefined")
		{
			this.loadImage(image);
		}
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.name = backUp(name, "none");
		this.type = backUp(type, "none");
		this.xVelocity = backUp(xVelocity, 0);
		this.yVelocity = backUp(yVelocity, 0);

	}

	Entity.prototype.render = function()
	{

		if (typeof this.x != "undefined")
		{

			var draw = false;

			if (this.animation)
			{
				var frame = this.getAnimationFrame();
				if (frame)
				{
					draw = frame;
				}
			}
			else if (this.image)
			{
				if (this.image.complete)
				{
					draw = this.image;
				}
			}

			if (draw)
			{

				var width = this.width;
				var height = this.height;
				if (!this.width)
				{
					width = this.image.width;
					height = this.image.height;
				}
				game.drawImage(draw, Math.round(this.x * tileWidth),
					Math.round(this.y * tileHeight),
					Math.round(width * tileWidth),
					Math.round(height * tileHeight));
			}

		}

	};

	Entity.prototype.loadImage = function(url)
	{
		var image = new Image();
		image.src = url;
		this.image = image;
	};

	Entity.prototype.loadAnimation = function(url, count, frameMultiplier, frames, repeat, whenDone, suffix)
	{

		frameMultiplier = backUp(frameMultiplier, 1);
		repeat = backUp(repeat, true);
		suffix = backUp(suffix, ".png");

		this.animation = new Object();
		this.animation.images = [];
		for (var frame=0; frame<count; frame++)
		{
			var image = new Image();
			if (frame == 0)
			{
				image.addEventListener("load", function() {
					this.image = new Object();
					this.image.width = image.width / tileWidth;
					this.image.height = image.height / tileHeight;
				});
			}
			image.src = url + String(frame) + suffix;
			this.animation.images.push(image);
		}

		this.animation.frameMultiplier = frameMultiplier;

		if (typeof frames != "undefined")
		{
			this.animation.frames = frames;
		}
		else
		{
			this.animation.frames = [];
			for (var frame=0; frame<count; frame++)
			{
				this.animation.frames.push(frame);
			}
		}

		this.animation.repeat = repeat;
		this.animation.whenDone = whenDone;

		this.animation.countdown = this.animation.frameMultiplier;
		this.animation.frame = this.animation.frames[0];

	};

	Entity.prototype.getAnimationFrame = function()
	{

		var anime = this.animation;

		anime.countdown -= quadrantSpeed(this.getQuadrant());
		if (anime.countdown <= 0)
		{
			anime.countdown = anime.frameMultiplier;
			anime.frame += 1;
		}

		if (anime.frame >= anime.frames.length)
		{
			if (typeof "whenDone" == "function")
			{
				anime.whenDone(anime);
			}
			anime.frame = anime.frames.length - 1;
			if (typeof anime.repeat != "undefined")
			{
				if (anime.repeat)
				{
					anime.frame = 0;
				}
			}
		}

		var frame = anime.images[anime.frames[anime.frame]];
		if (typeof frame != "undefined")
		{
			if (frame.complete)
			{
				return frame;
			}
		}

		return false;

	};

	Entity.prototype.getQuadrant = function(x, y)
	{

		var eX = x;
		var eY = y;
		if (typeof x == "undefined")
		{
			if (typeof this.x == "undefined")
			{
				return false;
			}
			eX = this.x;
			eY = this.y;
		}
		if (typeof this.oldQuadrant == "undefined")
		{
			this.oldQuadrant = [-1, -1];
		}
		var newQuadrant = false;
		var oldQuadrant = false;
		var width = 0;
		var height = 0;
		if (this.width)
		{
			width = this.width;
			height = this.height - 0.00001;
		}
		else if (this.image)
		{
			if (this.image.width)
			{
				width = this.image.width;
				height = this.image.height;
			}
		}
		for (var bottomRight=0; bottomRight<2; bottomRight++)
		{
			var cornerQuadrant = getQuadrant(eX + width * bottomRight,
				eY + height * bottomRight);
			if (cornerQuadrant[0] == this.oldQuadrant[0]
				&& cornerQuadrant[1] == this.oldQuadrant[1])
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
			this.oldQuadrant = newQuadrant;
			return newQuadrant;
		}
		else
		{
			return this.oldQuadrant;
		}

	};

	Entity.prototype.collidesTile = function(x, y)
	{

		var eX = backUp(x, this.x);
		var eY = backUp(y, this.y);

		var topLeft = tilePos(eX, eY);
		var bottomRight = tilePos(eX + this.width - 0.001, eY + this.height);
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

	};

	Entity.prototype.collidesBorder = function(x, y)
	{

		var eX = backUp(x, this.x);
		var eY = backUp(y, this.y);

		if (eX < 0)
			return [-1, 0];
		if (eX > levelWidth - this.width)
			return [1, 0];
		if (eY < 0)
			return [0, -1];
		if (eY > levelHeight - this.height)
			return [0, 1];

	}

	Entity.prototype.collidesWorld = function(x, y)
	{
		for (var key in world)
		{
			if (world.hasOwnProperty(key))
			{
				other = world[key];
				if (other != this)
				{
					if (this.collidesOther(other, x, y))
					{
						if (other.name != "none")
						{
							return true;
						}
					}
				}
			}
		}
		return false;
	};

	Entity.prototype.collidesOther = function(other, x, y)
	{

		var eX = backUp(x, this.x);
		var eY = backUp(y, this.y);

		return (eX < other.x + other.width
			&& other.x < eX + this.width
			&& eY < other.y + other.height
			&& other.y < eY + this.height);

	};

	Entity.prototype.collides = function(x, y)
	{
		return this.collidesWorld(x, y)
			|| this.collidesTile(x, y)
			|| this.collidesBorder(x, y);
	};

	Entity.prototype.keepInScreen = function()
	{

		if (this.x <= 0)
		{
			this.x = 0;
		}
		if (this.x >= levelWidth - this.width)
		{
			this.x = levelWidth - this.width;
		}
		if (this.y <= 0)
		{
			this.y = 0;
		}
		if (this.y >= levelHeight - this.height)
		{
			this.y = levelHeight - this.height;
		}

	}

	return Entity;

})();

// Other functinos (Gonna leave that typo)

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

function quadrantSpeed(quadrant)
{
	if (quadrant[0] >= 0 && quadrant[0] < levelData[currentLevel][0]
		&& quadrant[1] >= 0 && quadrant[1] < levelData[currentLevel][0])
	{
		return quadrantSpeeds[quadrant[0]][quadrant[1]];
	}
	else
	{
		return 1;
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
