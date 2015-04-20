// Inserts game into <canvas id="game"></canvas>
// @license magnet:?xt=urn:btih:0effb8f70b3b6f5f70ff270deftileHeight27c3f7705f85&dn=lgpl-3.0.txt Lesser GNU Public License 3.0

// Global Variables

var container;
var game;

var sounds = {};

var keys = new Array(256);

var lastTime = 0;

var quadrantSpeeds = [];

var levels;
var level = 0;
var levelWorlds = [];

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
	container.addEventListener("contextmenu", function(event){event.preventDefault();});
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

		{
			tiles : [
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - g - - g - - - - g - - g - - -",
				"- - g - - i g - g g - g - - - g - -",
				"- - - - - - - g - - g - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - i - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - g - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -"
			],
			entities : new Object(),
			splits : 2
		},

		{
			tiles : [
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - g - - g - - - - g - - g - - -",
				"- - g - - i g - g g - g - - - g - -",
				"- - - - - - - g - - g - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - i - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - g - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -"
			],
			entities : new Object(),
			splits : 2
		}

	];

	for (var i=0; i<levels.length; i++)
	{
		for (var y=0; y<levels[i].tiles.length; y++)
		{
			levels[i].tiles[y] = (levels[i].tiles[y]).split("");
			for (var x=0; x<levels[i].tiles[y].length; x++)
			{
				if (levels[i].tiles[y][x] == " ")
				{
					levels[i].tiles[y].splice(x, 1);
					if (Math.floor(Math.random() * 10) == 0)
						levels[i].tiles[y][x] = "g"
					else
						levels[i].tiles[y][x] = "-"
				}
			}
		}
	}

	// Level 1 tiles and moving tile placement

	levels[0].background = new Entity("assets/themes/grass/bg.png", 0, 0, levelWidth, levelHeight);

	var add = levels[0].entities;

	add["g"] = new Entity("assets/themes/grass/grass.png");

	add["b"] = new Entity("assets/themes/grass/wall/base.png");
	add["m"] = new Entity("assets/themes/grass/wall/middle.png");
	add["t"] = new Entity("assets/themes/grass/wall/top.png");

	add["l"] = new Entity("assets/themes/grass/horizontal/left.png");
	add["h"] = new Entity("assets/themes/grass/horizontal/middle.png");
	add["r"] = new Entity("assets/themes/grass/horizontal/right.png");

	add["1"] = new Entity(undefined, 0, 13, 1, 1, "tile", "grass", 0.05);
	add["1"].loadAnimation("assets/themes/grass/moving/", 5, 3);
	add["2"] = new Entity(undefined, 9, 13, 1, 1, "tile", "grass", 0, 0.1);
	add["2"].animation = add["1"].animation;
	add["3"] = new Entity(undefined, 1, 8, 1, 1, "tile", "grass", 0.05);
	add["3"].animation = add["1"].animation;
	add["4"] = new Entity(undefined, 0, 9, 1, 1, "tile", "grass", 0.05);
	add["4"].animation = add["1"].animation;
	/*levels[level].entities["gm2"] = levels[level].entities["gm"];
	levels[level].entities["gm2"].x = 15;
	levels[level].entities["gm2"].y = 9;
	levels[level].entities["gm2"].xVelocity = 0;
	levels[level].entities["gm2"].yVelocity = 0.25;*/
	//
	// levelWorlds[0]["bear"] = new Entity(undefined, 4, 7, 1, 2);
	// levelWorlds[0]["bear"].loadAnimation("assets/enemies/bear/", 3, 3);

	var player = new Entity(undefined, 8, 0, 0.844, 1.688, "player");
	levels[level].entities["player"] = player;
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

	levels[level].background.render()

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

		var speedMod = quadrantSpeed(entity.getQuadrant());

		if (entity.name != "player")
		{

			if (entity.xVelocity)
			{
				entity.x += entity.xVelocity * speedMod;
			}
			if (entity.yVelocity)
			{
				entity.y += entity.yVelocity * speedMod;
			}

		}

		if (entity.name == "tile")
		{

			var hit = entity.collides();
			var direct = false;
			if (hit)
			{
				if ((entity.xVelocity > 0 && hit.x - entity.x >= 1 - entity.xVelocity * speedMod)
					|| (entity.xVelocity < 0 && hit.x - entity.x <= -1 - entity.xVelocity * speedMod)
					|| (entity.yVelocity > 0 && hit.y - entity.y >= 1 - entity.yVelocity * speedMod)
					|| (entity.yVelocity < 0 && hit.y - entity.y <= -1 - entity.yVelocity * speedMod))
				{
					direct = true;
				}
			}
			if ((direct && hit.name != "player") || entity.keepInScreen())
			{
				entity.xVelocity *= -1;
				entity.yVelocity *= -1;
			}

		}

	});

	var player = levels[level].entities["player"];

	var speedMod = quadrantSpeed(player.getQuadrant());

	if (speedMod != 0)
	{

		var speed = 0.15 * speedMod;

		var oldX = player.x;
		var oldY = player.y;

		var hangLeft = player.collidesTile(player.x + 0.001, player.y - 0.001) ? 1 : 0;
		var hangRight = player.collidesTile(player.x - 0.001, player.y - 0.001) ? 1 : 0;

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

		if (key("E"))
		{
			player.animation = player.animations["whack"];
		}
		else
		{
			player.animations["whack"].frame = 0;
		}

		var jumpSpeed = -0.3;
		if (hangLeft || hangRight)
		{
			player.yVelocity = 0.05;
			if (key(" W") && !lastSpace)
			{
				player.yVelocity = jumpSpeed * 1.2;
				player.xVelocity = 0.08 * (hangRight * 2 - 1);
				player.x += speed * (hangRight * 2 - 1);
			}
		}

		if ((key(" W") || keys[0]) && player.collides(player.x, player.y + 0.001) && !lastSpace)
		{
			player.yVelocity = jumpSpeed;
		}
		lastSpace = key(" W");

		player.x += player.xVelocity * speedMod;
		player.y += player.yVelocity * speedMod;
		player.xVelocity *= Math.pow(0.85, speedMod);
		player.yVelocity += gravity * speedMod;

		player.handleCollisions(oldX, oldY);

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
			//game.fillStyle = "rgba(0,0,0," + String(quadrantSpeed([x, y]) / 4) + ")";
			var shade = String(Math.floor(quadrantSpeed([x, y]) * 128));
			game.fillStyle = "rgba(" + shade + "," + shade + "," + shade + ",0.6)";
			var sectWidth = container.width / levels[level].splits;
			var sectHeight = container.height / levels[level].splits;
			game.rect(x * sectWidth, y * sectHeight, sectWidth, sectHeight);
			game.fill();
		}
	}

	game.strokeStyle = "rgba(0,0,0," + String(pulse) + ")";
	var xDistance = container.width / levels[level].splits;
	for (var x=1; x<levels[level].splits; x++)
	{
		game.beginPath();
		game.moveTo(x * xDistance, 0);
		game.lineTo(x * xDistance, container.height);
		game.stroke();
	}
	var yDistance = container.height / levels[level].splits;
	for (var y=1; y<levels[level].splits; y++)
	{
		game.beginPath();
		game.moveTo(0, y * yDistance);
		game.lineTo(container.width, y * yDistance);
		game.stroke();
	}

}

function renderTile(x, y)
{

	var tileType = getTile([x, y]);
	var tile = levels[level].entities[tileType];

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
		for (var addWidth=0; addWidth<2; addWidth++)
		{
			for (var addHeight=0; addHeight<2; addHeight++)
			{
				var cornerQuadrant = getQuadrant(eX + width * addWidth,
					eY + height * addHeight);
				if (quadrantSpeed(cornerQuadrant) == quadrantSpeed(this.oldQuadrant))
				{
					oldQuadrant = true;
				}
				else
				{
					newQuadrant = cornerQuadrant;
				}
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
		var bottomRight = tilePos(eX + this.width - 0.001, eY + this.height  - 0.001);
		for (var x=topLeft[0]; x<bottomRight[0] + 1; x++)
		{
			for (var y=topLeft[1]; y<bottomRight[1] + 1; y++)
			{
				var tile = getTile([x, y]);
				if (tile != "-" && (tile != "i" || this.name == "tile"))
				{
					return new Entity(undefined, x, y, 1, 1);
				}
			}
		}
		return false;

	};

	Entity.prototype.collidesWorld = function(x, y)
	{
		for (var key in levels[level].entities)
		{
			if (levels[level].entities.hasOwnProperty(key))
			{
				other = levels[level].entities[key];
				if (other != this)
				{
					if (this.collidesOther(other, x, y))
					{
						if (other.name != "none")
						{
							return other;
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
		var w = this.collidesWorld(x, y);
		if (w)
		{
			return w;
		}
		var t = this.collidesTile(x, y);
		if (t)
		{
			return t;
		}
		return false;
	};

	Entity.prototype.keepInScreen = function()
	{

		if (this.x < 0)
		{
			this.x = 0;
			return true;
		}
		if (this.x >= levelWidth - this.width)
		{
			this.x = levelWidth - this.width;
			return true;
		}
		if (this.y < 0)
		{
			this.y = 0;
			return true;
		}
		if (this.y >= levelHeight - this.height)
		{
			this.y = levelHeight - this.height;
			return true;
		}
		return false;

	};

	Entity.prototype.handleCollisions = function(oldX, oldY)
	{

		var goingRight = oldX < this.x;
		var goingLeft = oldX > this.x;
		var goingUp = oldY > this.y;
		var byX = this.collides(this.x, oldY);
		var byY = this.collides(oldX, this.y + 0.1);

		if (byY)
		{
			this.yVelocity = 0;
			this.xVelocity = byY.xVelocity;
			 this.y = Math.floor(byY.y + byY.height * goingUp)
				- this.height * !goingUp;
		}
		if (byX)
		{
			this.xVelocity = 0;
			this.x = Math.floor(byX.x + byX.width * goingLeft)
				- this.width * goingRight;
		}

	};

	return Entity;

})();

// Other functinos (Gonna leave that typo)

function everyEntity(what)
{
	for (var key in levels[level].entities)
	{
		if (levels[level].entities.hasOwnProperty(key))
		{
			what(levels[level].entities[key]);
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
		return levels[level].tiles[tile[1]][tile[0]];
	}
	else
	{
		return "-";
	}
}

function getQuadrant(x, y)
{
	return [Math.floor(x * levels[level].splits / levelWidth),
		Math.floor(y * levels[level].splits / levelHeight)];
}

function quadrantSpeed(quadrant)
{
	if (quadrant[0] >= 0 && quadrant[0] < levels[level].splits
		&& quadrant[1] >= 0 && quadrant[1] < levels[level].splits)
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
	for (var x=0; x<levels[level].splits; ++x)
	{
		quadrantSpeeds.push([]);
		for (var y=0; y<levels[level].splits; ++y)
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
	var direction = event.button == 0 ? 2 : 0.5;
	var quadrant = getQuadrant(x, y);

	var speed = quadrantSpeed(quadrant);

	quadrantSpeeds[quadrant[0]][quadrant[1]] *= direction;
	if (speed == 2 && direction == 2)
	{
		quadrantSpeeds[quadrant[0]][quadrant[1]] = 0.25;
	}
	if (speed == 0.25 && direction == 0.5)
	{
		quadrantSpeeds[quadrant[0]][quadrant[1]] = 2;
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
