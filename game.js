// Inserts game into <canvas id="game"></canvas>
// @license magnet:?xt=urn:btih:0effb8f70b3b6f5f70ff270deftileHeight27c3f7705f85&dn=lgpl-3.0.txt Lesser GNU Public License 3.0

// Global Variables

var container;
var game;

var world = {};
var sounds = {};

var camera = [0, 0];

var keys = new Array(256);

var lastTime = 0;

// Entry point

window.onload = initialize;

// Fundamental Functions

function initialize()
{

	container = document.getElementById("game");
	if (!container.getContext || !container.getContext("2d"))
	{
		unsupported();
		return;
	}
	game = container.getContext("2d");

	fillBrowser();
	window.onresize = fillBrowser;

	container.setAttribute("tabindex", "0");
	container.focus();
	container.addEventListener("mousedown", mouseDown);
	container.addEventListener("mouseup", mouseUp);
	container.addEventListener("mousemove", mouseMove);
	container.addEventListener("keydown", keyDown);
	container.addEventListener("keyup", keyUp);

	initializeWorld();

	return true;

}

function initializeWorld()
{

	window.requestAnimationFrame(update);

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

	var entitiesByLayer = [];

	// Order the entities by layer so we draw them correctly
	everyEntity(
		function(entity)
		{
			// Only render entities with images and positions (aka they're set to be rendered)
			if (entity.image && entity.position)
			{
				if (!entity.layer)
				{
					entity.layer = 0;
				}
				if (entity.z)
				{
					entity.layer = entity.z;
				}
				for (var i=0; i<entitiesByLayer.length; ++i)
				{
					if (entitiesByLayer[i].layer >= entity.layer)
					{
						entitiesByLayer.splice(i, 0, entity);
						debugLog(entity.x);
						// Return from function(entity), not render
						return;
					}
				}
				entitiesByLayer.push(entity);
			}
		}
	);

	// Render entities that weren't behind anything and can be simply drawn last
	for (var i=0; i<entitiesByLayer.length; ++i)
	{
		var entity = entitiesByLayer[i];
		if (entity.image && entity.position)
		{
			if (!entity.screenRelative)
			{
				x -= camera[0];
				y -= camera[1];
			}
			game.drawImage(entity.image, x, y);
		}
	}

	var display_fps = true;

	if (display_fps)
	{
		game.font = "20px white Candara";
		game.strokeStyle = "#FFF";
		game.fillStyle = "#000"
		game.fillText(String(Math.round(updateTime)), 30, 30);
		game.strokeText(String(Math.round(updateTime)), 30, 30);
	}

}

function update(totalTime)
{

	window.requestAnimationFrame(update);

	delta = totalTime - lastTime;

	// Code

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

function fillBrowser(event)
{
	container.width = window.innerWidth;
	container.height = window.innerHeight;
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
	return keys[which.charCodeAt(0)]
}

// Input Handling

function mouseDown(event)
{
	var x = event.clientX + camera[0];
	var y = event.clientY + camera[1];
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
