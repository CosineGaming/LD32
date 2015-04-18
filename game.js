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

var tileWidth = 32;
var tileHeight = 16;

var gravity = 0.3;
var velocity = 0;
var xVelocity = 0;

var lastSpace = false;

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

	container.width = tileWidth * levels[0][0].length;
	container.height = tileHeight * levels[0].length;

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
			"- - - - - - - 1 - - - - - - - - - -",
			"- - - - - - - 1 - - - - - - - - - -",
			"- - - - - - - 1 - - - - - - - - - -",
			"- - - - - - - 1 - - - - - - - - - -",
			"- - - - - - - 1 - - - - - - - - - -",
			"- - - - - - - 1 - - - - - - - - - -",
			"- - - - - - - - - - - - - - - - - -",
			"- - - - 1 - - - - - - - 1 - - - - -",
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

	world["1"] = new Object();
	loadImage(world["1"], "assets/test.png");

	world["player"] = new Object();
	world["player"].x = 50;
	world["player"].y = 50;
	world["player"].speed = 6;
	world["player"].quadrant = [0, 0];
	loadImage(world["player"], "assets/bob.png");

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
					game.drawImage(tile.image, Math.round(x * tileWidth), Math.round(y * tileHeight));
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
	});

	var displayFps = true;

	if (displayFps)
	{
		game.font = "20px white Candara";
		game.strokeStyle = "#FFF";
		game.fillStyle = "#000"
		game.fillText(String(Math.round(updateTime)), 20, 20);
		game.strokeText(String(Math.round(updateTime)), 20, 20);
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
			velocity = 0.75;
		}
		player.y += velocity * speedMod;

		xVelocity *= 0.65;
		player.x += xVelocity

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
			velocity = jumpSpeed;
			xVelocity = 10 * (hangRight * 2 - 1);
			debugLog(xVelocity);
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
	return levels[currentLevel][tile[1]][tile[0]]
}

function getQuadrant(x, y)
{
	return [Math.floor(x * quadrantSpeeds.length / container.width),
		Math.floor(y * quadrantSpeeds.length / container.height)];
}

function fourCorners(object, x, y, testFunction)
{
	for (var plusWidth=0; plusWidth<2; plusWidth++)
	{
		for (var plusHeight=0; plusHeight<2; plusHeight++)
		{
			var testValue = testFunction(object, x + (object.image.width) * plusWidth,
				y + (object.image.height) * plusHeight);
			if (testValue)
			{
				return testValue;
			}
		}
	}
	return false;
}

function changedQuadrant(object, x, y)
{
	return fourCorners(object, x, y, function(test, x, y){
		var quadrant = getQuadrant(x, y);
		if (quadrant == test.quadrant)
		{
			return false;
		}
		else
		{
			return quadrant;
		}
	});
	/*for (var plusWidth=0; plusWidth<2; plusWidth++)
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
	return false;*/
}

function quadrantSpeed(quadrant)
{
	return quadrantSpeeds[quadrant[0]][quadrant[1]];
}

function resetQuadrantSpeeds()
{
	quadrantSpeeds = [];
	for (var x=0; x<currentLevel+2; ++x)
	{
		quadrantSpeeds.push([]);
		for (var y=0; y<currentLevel+2; ++y)
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

	var x = container.width / window.innerWidth * event.clientX;
	var y = container.height / window.innerHeight * event.clientY;
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
