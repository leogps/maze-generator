/**
 * @author: leogps
 */
/**
 *
 * @type {{generate: Function, _generate: Function, _stepGenerate: Function}}
 */
var Mazegenerator = {

    getRandom: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    },
    generate : function(x, y, callback) {
    	var onMarkVisited = (callback && callback.onMarkVisited) 
    			? callback.onMarkVisited : undefined;    	

		var grid = new Grid(x, y, onMarkVisited);
        var randomX = Mazegenerator.getRandom(0, x - 1);
        var randomY = Mazegenerator.getRandom(0, y - 1);
		var randomNode = grid.getNodeAt(randomX, randomY); // start point
		randomNode.markVisited();
		var stack = [randomNode];
		var path = new Path(randomNode);

		Mazegenerator._generate(randomNode, stack, path, callback);

	},

	_generate : function(currentNode, stack, path, callback) {
		window.setTimeout(function() {
			Mazegenerator._stepGenerate(currentNode, stack, path, callback);
		}, (window.step || 20));
	},

	_stepGenerate : function(currentNode, stack, path, callback) {
		if(!currentNode) {
            Mazegenerator.onComplete(callback);
			return;
		}
		printNode(currentNode);
		var neighbors = currentNode.getAvailableNeighborsNotVisited();

		var filteredNeighbors = filterStackedNodes(neighbors, stack);
		
		//console.log("filteredNeighbors: ");
		//printNodes(filteredNeighbors);

		if(filteredNeighbors.length == 0) {
			var poppedNode = stack.pop();
			poppedNode.markVisited();
			var lastNode = stack[stack.length - 1];			
			Mazegenerator._generate(lastNode, stack, path, callback);
		} else {
			var randomNeighbor = filteredNeighbors[Math.floor(Math.random() * filteredNeighbors.length)];
			//console.log("Random neighbor: ");
			//printNode(randomNeighbor);

			stack.push(randomNeighbor);
			var direction = getDirection(currentNode, randomNeighbor);
			
			//console.log("Going: " + direction.get() + " from" + currentNode.toString() + " to " + randomNeighbor.toString());
			path.setDirection(direction, randomNeighbor);
			simulate(currentNode, direction, randomNeighbor);
			Mazegenerator._generate(randomNeighbor, stack, path, callback);
		}
	},

	onComplete : function(callback) {
		if(callback && callback.onComplete /* && isFunction(callback.onComplete) */) {
			callback.onComplete();
		}
	},

	onTraversal : function(node) {
		if(callback && callback.onTraversal /* && isFunction(callback.onTraversal) */) {
			callback.onTraversal(node);
		}	
	},

	onMarkVisited : function(row, column, onMarkVisited) {
		if(onMarkVisited /* && isFunction(onMarkVisited) */) {
			onMarkVisited(row, column);
		}		
	}

};

var simulate = function(from, direction, to) {
	// window.setTimeout(function() {
		
	// }, 1000);
    var fromId = 'x' + from.getX() + "_" + 'y' + from.getY();
    var $from = jQuery("td" + "[id='" + fromId + "']");

    var toId = 'x' + to.getX() + "_" + 'y' +  to.getY();
	var $to = jQuery("td" + "[id='" + toId + "']");
	$from.html('X').addClass('color-yellow');
	$to.html('X').addClass('color-yellow');

	if(direction.get() === "up") {
		$from.css('border-top', 'none');
		$to.css('border-bottom', 'none');
	}
	else if(direction.get() === "down") {
		$from.css('border-bottom', 'none');
		$to.css('border-top', 'none');
	}
	else if(direction.get() === "left") {
		$from.css('border-left', 'none');
		$to.css('border-right', 'none');
	}
	else if(direction.get() === "right") {
		$from.css('border-right', 'none');
		$to.css('border-left', 'none');
	}

	

}
// TODO: Implement custom stack to lookup nodes faster with just O(n).
var filterStackedNodes = function(nodes, stack) {
	var filteredNodes = [];
	for(var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		var nodeInStack = false;
		for(var j = 0; j < stack.length; j++) {
			var stackNode = stack[j];
			if(node == stackNode) {
				nodeInStack = true;
				break;
			}
		}
		if(!nodeInStack) {
			filteredNodes.push(node);
		}
	}
	return filteredNodes;
}

var getDirection = function(fromNode, toNode) {
	if(fromNode.up() == toNode) {
		return new Direction("up");
	}
	if(fromNode.left() == toNode) {
		return new Direction("left");
	}
	if(fromNode.down() == toNode) {
		return new Direction("down");
	}
	if(fromNode.right() == toNode) {
		return new Direction("right");
	}
	throw new Error("The direction could not be determined.");
}

var Path = function(startNode) {
	this.getStartNode = function() {
		return startNode;
	}
	var directionArray = [];
	var toNode = startNode;

	this.getDirectionArray = function() {
		return directionArray;
	}

	this.setDirection = function(direction, toNodeVal) {
		directionArray.push(direction);
		toNode = toNodeVal;
	}

	this.getToNode = function() {
		return toNode;
	}

	this.traverse = function(callback) {
		console.log("Traversing from " + startNode.toString() + " to " + this.getToNode().toString());
        Mazegenerator.onTraversal(startNode);
        var currentNode = startNode;
		for(var index = 0; index < directionArray.length; index++) {
			var direction = directionArray[index];
			console.log("Going " + direction.get());
            var nextNode = currentNode[direction.get()];
            Mazegenerator.onTraversal(nextNode());
            currentNode = nextNode();
		}
	}
}

var Direction = function(direction) {
	var validDirections = ["up", "down", "left", "right"];
	var _direction;
	if(validDirections.includes(direction)) {
		_direction = direction;
	}
	this.get = function() {
		return _direction;
	}
	return this;
}

var Grid = function(rows, columns, onMarkVisited){
	this.createGrid(rows, columns, onMarkVisited);
	return this;
};

var printNode = function(node) {
	console.log(node.toString());
}

var printNodes = function(nodes) {
	for(var i = 0; i < nodes.length; i++) {
		printNode(nodes[i]);
	}
}

var Node = function(xcord, ycord) {

	this.getX = function() {
		return xcord;
	}

	this.getY = function() {
		return ycord;
	}

	this.getAvailableNeighborsNotVisited = function() {
		var neighbors = new Array();
		var up = this.up();
		var left = this.left();
		var right = this.right();
		var down = this.down();		
		if(up && !up.isVisited()) {
			neighbors.push(up);
		}
		if(left && !left.isVisited()) {
			neighbors.push(left);
		}
		if(right && !right.isVisited()) {
			neighbors.push(right);
		}
		if(down && !down.isVisited()) {
			neighbors.push(down);
		}

		return neighbors;
	}

	var onMarkVisited;
	this.setOnMarkVisited = function(onMarkVisited) {
		this.onMarkVisited = onMarkVisited;
	}

	this.getOnMarkVisited = function() {
		return this.onMarkVisited;
	}

	var up_node, down_node, left_node, right_node;
	this.up = function() {
		return up_node;
	}
	this.setUp = function(node) {
		up_node = node;
	}
	this.down = function() {
		return down_node;
	}
	this.setDown = function(node) {
		down_node = node;
	}
	this.left = function() {
		return left_node;
	}
	this.setLeft = function(node) {
		left_node = node;
	}
	this.right = function() {
		return right_node;
	}
	this.setRight = function(node) {
		right_node = node;
	}

	var visited = false;
	this.isVisited = function() {
		return visited;
	}

	var __context = this;
	this.markVisited = function() {		
		Mazegenerator.onMarkVisited(__context.getX(), __context.getY(), __context.getOnMarkVisited());
		visited = true;
	}

	this.toString = function() {
		return "(" + __context.getX() + ", " + __context.getY() + ")";
	}

	return this;
};

Grid.prototype.createGrid = function(rows, columns, onMarkVisited) {
	if(isNaN(rows) || isNaN(columns)) {
		throw new Error("The rows and columns should be int values.");
	}


	this.getRows = function() {
		return rows;
	}

	this.getColumns = function() {
		return columns;
	}

	var matrix = new Array();

	function init() {
		for(var i = 0; i < rows; i++) {
			matrix[i] = new Array();
			for(var j = 0; j < columns; j++) {			
				var node = new Node(i, j);	
				node.setOnMarkVisited(onMarkVisited);
				matrix[i][j] = node;			
			}
		}
	}

	init();

	this.getMatrix = function() {
		return matrix;
	}

	this.getNodeAt = function(x, y) {
		return matrix[x][y];
	}

	function updateAdjacentNodeInfo() {
		for(var i = 0; i < rows; i++) {
			for(var j = 0; j < columns; j++) {							
				var node = matrix[i][j];

				//obj.upLeft = matrix[i - 1] ? matrix[i - 1][j - 1] : undefined;
				var up = matrix[i - 1] ? matrix[i - 1][j] : undefined;
				//obj.upRight = matrix[i - 1] ? matrix[i - 1][j + 1] : undefined;

				var left = matrix[i][j - 1];
				var right = matrix[i][j + 1];

				//obj.downLeft = matrix[i + 1] ? matrix[i + 1][j - 1] : undefined;
				var down = matrix[i + 1] ? matrix[i + 1][j] : undefined;
				//obj.downRight = matrix[i + 1] ? matrix[i + 1][j + 1] : undefined;

				//node.upLeft = adjacentNodes.upLeft;
				node.setUp(up);
				//node.upRight = adjacentNodes.upRight;
				node.setLeft(left);
				node.setRight(right);
				//node.downLeft = adjacentNodes.downLeft;
				node.setDown(down);
				//node.downRight = adjacentNodes.downRight;
			}
		}
	}
	updateAdjacentNodeInfo();
	
};