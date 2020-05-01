const simplex = new SimplexNoise();

// settings
let blocks = [
	{
		id: "air",
		r: 0,
		g: 0,
		b: 0,
		a: 1
	},
	{
		id: "grass",
		r: 0,
		g: 255,
		b: 0,
		a: 1
	},
	{
		id: "dirt",
		r: 255,
		g: 125,
		b: 0,
		a: 1
	},
	{
		id: "limestone",
		r: 200,
		g: 125,
		b: 125,
		a: 1
	},
	{
		id: "stone",
		r: 125,
		g: 125,
		b: 125,
		a: 1
	},
	{
		id: "water",
		r: 0,
		g: 0,
		b: 255,
		a: 0.25
	},
	{
		id: "wood",
		r: 109,
		g: 60,
		b: 20,
		a: 1
	},
	{
		id: "leaves",
		r: 72,
		g: 127,
		b: 26,
		a: 1
	}
];

var structures = [
	{
		id: "tree",
		seed: 1,
		upper: 0,
		variants: [
			[
				[0, 7, 7, 7, 0],
				[7, 7, 7, 7, 7],
				[7, 7, 7, 7, 7],
				[0, 7, 7, 7, 0],
				[0, 0, 6, 0, 0],
				[0, 0, 6, 0, 0],
			],
			[
				[0, 7, 7, 7, 0],
				[7, 7, 7, 7, 7],
				[7, 7, 7, 7, 7],
				[0, 7, 7, 7, 0],
				[0, 0, 6, 0, 0],
				[0, 0, 6, 0, 0],
				[0, 0, 6, 0, 0],
			],
			[
				[0, 7, 7, 7, 0],
				[7, 7, 7, 7, 7],
				[7, 7, 7, 7, 7],
				[7, 7, 7, 7, 7],
				[0, 7, 7, 7, 0],
				[0, 0, 6, 0, 0],
				[0, 0, 6, 0, 0],
			],
			[
				[0, 7, 7, 7, 0],
				[7, 7, 7, 7, 7],
				[0, 7, 7, 7, 0],
				[0, 0, 6, 0, 0],
				[0, 0, 6, 0, 0],
				[0, 0, 6, 0, 0],
				[0, 0, 6, 0, 0],
			]
		]
	}
];

let speed = 5;

// temp
let xoffset = 0;
let yoffset = 0;
let xdirection = 0; // -1 left, 1 right
let ydirection = 0; // -1 up, 1 down
let zdirection = 0; // -1 up, 1 down

// dimensions
var scale = 8;
const w_width = grid(document.body.clientWidth, 1);
const w_height = grid(document.body.clientHeight, 1);

const map_width = 8192;
const map_height = 1024;

let buffer = Array(w_height).fill(0).map(x => Array(w_width).fill(-1));
let buffer_fond = Array(w_height).fill(0).map(x => Array(w_width).fill(-1));

// initialize display
let c = document.createElement("canvas");
document.body.appendChild(c);
c.width = w_width;
c.height = w_height;

let ctx = c.getContext("2d", { alpha: true });
ctx.lineWidth = 2;
ctx.font = "1em Arial";

// "controls"
xoffset = map_width / 2;
yoffset = map_height / 2;

document.addEventListener("keydown", (e) => {
	switch (e.code) {
		case "KeyW": ydirection = -1; break;
		case "KeyA": xdirection = -1; break;
		case "KeyS": ydirection = 1; break;
		case "KeyD": xdirection = 1; break;
		case "KeyQ": zdirection = 1; break;
		case "KeyE": zdirection = -1; break;
	}
});

// generate terrain
var terrain;
var terrain_fond;
[terrain, terrain_fond] = generate(map_width, map_height);

document.addEventListener("keyup", (e) => {
	switch (e.code) {
		case "KeyW": case "KeyS": ydirection = 0; break;
		case "KeyA": case "KeyD": xdirection = 0; break;
		case "KeyQ": case "KeyE": zdirection = 0; break;
	}
});

function clamp(num, min, max) {
	return num <= min ? min : num >= max ? max : num;
}

(function render() {
	window.requestAnimationFrame(render);

	var w_h_scale = Math.floor(w_height / scale);
	var w_w_scale = Math.floor(w_width / scale);

	xoffset = clamp(Math.floor(xoffset + xdirection * speed * 16/scale), 0, map_width - w_w_scale);
	yoffset = clamp(Math.floor(yoffset + ydirection * speed * 16/scale), 0, map_height - w_h_scale);
	new_scale = clamp(scale + zdirection, 5, 16);
	if (new_scale != scale) {
		scale = new_scale;
		w_h_scale = Math.floor(w_height / scale);
		w_w_scale = Math.floor(w_width / scale);
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, w_width, w_height);
		buffer = Array(w_h_scale).fill(0).map(x => Array(w_w_scale).fill(-1));
		buffer_fond = Array(w_h_scale).fill(0).map(x => Array(w_w_scale).fill(-1));
	}

	//ctx.fillStyle = "#161621";
	//ctx.fillRect(0, 0, w_width, w_height);

	for (var i = 0; i < w_w_scale; i++) {
		for (var j = 0; j < w_h_scale; j++) {
			var coord_y = map_height - (j + yoffset);
			var coord_x = i + xoffset;
			if (coord_y >= 0 && coord_y < map_height && coord_x >= 0 && coord_x < map_width) {
				let point = terrain[coord_y][coord_x];
				let point_fond = terrain_fond[coord_y][coord_x];
				let x = Math.round(i * scale);
				let y = Math.round(j * scale);

				if (buffer_fond[j][i] != point_fond || buffer[j][i] != point) {
					if (point.a > 0) {
						ctx.fillStyle = `rgb(0, 0, 0)`;
						ctx.fillRect(x, y, scale, scale);
					}
					if (point_fond > 0) {
						var block = blocks[point_fond];
						ctx.fillStyle = `rgb(${block.r / 3}, ${block.g / 3}, ${block.b / 3})`;
						ctx.fillRect(x, y, scale, scale);
					} else {
						ctx.fillStyle = `rgb(0, 0, 0)`;
						ctx.fillRect(x, y, scale, scale);
					}
					if (point > 0) {
						var block = blocks[point];
						ctx.fillStyle = `rgba(${block.r}, ${block.g}, ${block.b}, ${block.a})`;
						ctx.fillRect(x, y, scale, scale);
					}
					buffer_fond[j][i] = point_fond;
					buffer[j][i] = point;
				}
			}
		}
	}
})();

function generate(w, h) {

	// generate surface + fill height

	let surface = [];
	let terrain_map = Array(h).fill(0).map(x => Array(w).fill(0));
	let terrain_fond = Array(h).fill(0).map(x => Array(w).fill(0));
	let terrain = Array(h).fill(0).map(x => Array(w).fill(0));

	var surface_offset = 128;

	for (var i = 0; i < w; i++) {
		var point0 = ((simplex.noise2D(i / 500, map_height) + 1) / 2) * 5;
		var point1 = ((simplex.noise2D(i / 100, map_height * 2) + 1) / 2);
		var point2 = ((simplex.noise2D(i / 10, map_height * 3) + 1) / 2) * 0.1;
		var point3 = ((simplex.noise2D(i * 2, map_height * 4) + 1) / 2) * 0.01;
		var height = ((point0 + point1 + point2 + point3) / 6.11) * surface_offset + (map_height - surface_offset * 2);
		for (var j = 0; j < height; j++) {
			terrain_map[j][i] = 1;
			terrain_fond[j][i] = 1;
		}
	}

	for (var i = 0; i < w; i++) {
		for (var j = 0; j < h; j++) {
			var point1 = ((simplex.noise2D(i / 100 + map_width, j / 50) + 1) / 2);
			var point2 = ((simplex.noise2D(i / 10 + map_width, j / 5) + 1) / 2) * 0.1;
			var point3 = ((simplex.noise2D(i + map_width, j / 0.5) + 1) / 2) * 0.01;
			var height = ((point1 + point2 + point3) / 1.11);
			if (height < 0.4 && j > 0)
				terrain_map[j][i] = 0;
		}
	}

	for (var i = 0; i < w; i++) {
		var j = map_height - 1;
		while (terrain_map[j][i] == 0) {
			terrain_fond[j][i] = 0;
			j--;
		}
	}

	function propogate(y, x) {
		if (y < 0 || x < 0 || y >= h || x >= w)
			return;
		if (terrain_map[y][x] == 0 && terrain[y][x] == 0) {
			terrain[y][x] = 5;
			propogate(y - 1, x);
			propogate(y, x + 1);
			propogate(y, x - 1);
		}
	};

	var water_table = Math.floor(map_height - surface_offset * 1.6);

	for (var i = 0; i < w; i += 8) {
		var point1 = ((simplex.noise2D(i / 100, map_height * 5) + 1) / 2);
		var point2 = ((simplex.noise2D(i / 10, map_height * 6) + 1) / 2) * 0.1;
		var point3 = ((simplex.noise2D(i, map_height * 7) + 1) / 2) * 0.01;
		var height = ((point1 + point2 + point3) / 1.11) * water_table;

		var flag = true;
		var y = water_table;
		while (y < map_height) {
			if (terrain_map[y++][i] > 0) {
				flag = false;
				break;
			}
		}
		if (flag)
			propogate(water_table, i);
		var j = Math.floor(clamp(height, 0, map_height - 1));
		if (terrain_map[j][i] == 0) {
			propogate(j, i);
		}
	}

	for (var i = 0; i < w; i++) {
		var depth = 0;
		for (var j = h - 1; j >= 0; j--) {
			if (terrain_map[j][i] > 0 && terrain[j][i] == 0) {
				depth++;
				if (depth < 2)
					terrain[j][i] = 1;
				else if (depth < 10)
					terrain[j][i] = 2;
				else if (depth < 30)
					terrain[j][i] = 3;
				else
					terrain[j][i] = 4;
			} else if (terrain[j][i] == 5) {
				depth = 5;
			} else if (depth > 30 && terrain_map[j][i] == 0) {
				depth = 20;
			}
		}
	}

	for (var i = 0; i < w; i++) {
		var depth = 0;
		for (var j = h - 1; j >= 0; j--) {
			if (terrain_fond[j][i] > 0) {
				depth++;
				if (depth < 2)
					terrain_fond[j][i] = 1;
				else if (depth < 10)
					terrain_fond[j][i] = 2;
				else if (depth < 30)
					terrain_fond[j][i] = 3;
				else
					terrain_fond[j][i] = 4;
			}
		}
	}

	var tree = structures[0];
	for (var i = 10; i < w - 10; i++) {
		for (var j = 0; j < h - 1; j++) {
			if (terrain[j + 1][i] == tree.upper && terrain[j][i] == tree.seed && Math.random() > 0.9) {
				var variant = tree.variants[Math.floor(Math.random() * tree.variants.length)];
				var center_offset = (variant[0].length + 1) / 2 - 1;
				for (var si = 0; si < variant.length; si++) {
					for (var sj = 0; sj < variant[0].length; sj++) {
						if (variant[si][sj] > 0)
							terrain[(j - si) + variant.length][i - center_offset + sj] = variant[si][sj];
					}
				}
			}
		}
	}

	return [terrain, terrain_fond];
}

function grid(x, size) {
	return size * Math.floor(x / size);
}
