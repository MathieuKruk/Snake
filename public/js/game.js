window.onload = () => {
	// Creating the canva
	const canvasWidth = 900;
	const canvasHeight = 600;
	// Block size is the size of one square, the snake is composed of them.
	const blockSize = 30;
	// Creating a new canva into canvas
	const canvas = document.createElement('canvas');
	// Ctx allow to create the context of the canvas
	const ctx = canvas.getContext('2d');
	// Canva dimensions in block size
	const widthInBlocks = canvasWidth/blockSize;
	const heightInBlocks = canvasHeight/blockSize;
	const centreX = canvasWidth / 2;
	const centreY = canvasHeight / 2;
	let delay;
	let snakee;
	let applee;
	let score;
	let timeOut;

	// Canva initialisation function
	const init = () => {
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.border = "10px solid blue";
		canvas.style.margin = "50px auto";
		canvas.style.display = "block";
		canvas.style.backgroundColor = "#000000";
		// Adding the canva to the html
		document.body.appendChild(canvas);
		launch();
	}

	// Launch a new game function
	const launch = () => {
		snakee = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]],"right");
		applee = new Apple([10,10]);
		score = 0;
		clearTimeout(timeOut);
		delay = 100;
		refreshCanvas();
	}

	// Canva refreshing function
	const refreshCanvas = () => {
		// Make the snake advance by one blocksize
		snakee.advance();
		// Check if the snake made a collision?
		if (snakee.checkCollision()){
			gameOver();
		} else {
			// Check if snake ate an apple?
			if (snakee.isEatingApple(applee)){
				score++;
				snakee.ateApple = true;

				// Check a new position for the new apple
				do {
					applee.setNewPosition();
				// If the apple spawn on the snake, check again
				} while(applee.isOnSnake(snakee));

				// If the increase the score by 5, speed up the snake by 2
				if(score % 5 == 0){
					speedUp();
				}
			}
			// Clear the canva, putting it to 0
			ctx.clearRect(0,0,canvasWidth,canvasHeight);
			// Display the score
			drawScore();
			// Display the snake
			snakee.draw();
			// Display the apple
			applee.draw();
			// after the delay (100ms), launch again the refreshCanvas Function
			timeOut = setTimeout(refreshCanvas,delay);
		}
	}

	// Speed increasing function
	const speedUp = () => {
		delay /= 2;
	}

	// Function displaying the score each time the player scores
	const drawScore = () => {
		ctx.save();
		ctx.font = "bold 200px sans-serif";
		ctx.fillStyle = "gray";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(score.toString(), centreX, centreY);
		ctx.restore();
	}

	// Function adding a new block to the snake
	const drawBlock = (ctx, position) => {
		const x = position[0]*blockSize;
		const y = position[1]*blockSize;
		ctx.fillRect(x,y,blockSize,blockSize);
	}

	// Function displaying a message if the player lose the game
	const gameOver = () => {
		ctx.save();
		ctx.font = "bold 70px sans-serif";
		ctx.fillStyle = "#000";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		ctx.strokeText("Game Over", centreX, centreY - 180);
		ctx.fillText("Game Over", centreX, centreY - 180);
		ctx.font = "bold 30px sans-serif";
		ctx.strokeText("YOU LOOSE! Try Again?", centreX, centreY + 150);
		ctx.fillText("YOU LOOSE! Try Again?", centreX, centreY + 150);
		ctx.restore();
	}

	// [CLASS] SNAKE
	class Snake {
		// Constructor
		constructor(body, direction) {
			this.body = body;
			this.direction = direction;
			this.ateApple = false;
		}

		// METHODS
		// Drawing METHOD allowing it to draw itself on the canva
		draw (){
			ctx.save();
			ctx.fillStyle="#096126";
			for (let i=0 ; i < this.body.length ; i++){
				drawBlock(ctx,this.body[i]);
			}
			ctx.restore();
		};
		
		// Advancing METHOD allowing the snake to move
		advance (){
			const nextPosition = this.body[0].slice();
			switch(this.direction){
				case "left":
					nextPosition[0] -= 1;
					break;
				case "right":
					nextPosition[0] += 1;
					break;
				case "down":
					nextPosition[1] += 1;
					break;
				case "up":
					nextPosition[1] -= 1;
					break;
				default:
					throw("invalid direction");
			}
			this.body.unshift(nextPosition);
			if (!this.ateApple)
				this.body.pop();
			else
				this.ateApple = false;
		};
		
		// Setting direction METHOD, check the movements conditions
		setDirection (newDirection){
			let allowedDirections;
			switch(this.direction){
				case "left":
				case "right":
					allowedDirections=["up","down"];
					break;
				case "down":
				case "up":
					allowedDirections=["left","right"];
					break;  
				default:
					throw("invalid direction");
			}
			if (allowedDirections.indexOf(newDirection) > -1){
				this.direction = newDirection;
			}
		};
		
		// Collision METHOD, cheking if player has touched the borders or itself
		checkCollision (){
			const head = this.body[0];
			const rest = this.body.slice(1);
			const snakeX = head[0];
			const snakeY = head[1];
			const minX = 0;
			const minY = 0;
			const maxX = widthInBlocks - 1;
			const maxY = heightInBlocks - 1;
			const isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
			const isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
			let wallCollision = false;
			let snakeCollision = false;

			if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
				wallCollision = true;
			
			for (let i=0 ; i<rest.length ; i++){
				if (snakeX === rest[i][0] && snakeY === rest[i][1])
					snakeCollision = true;
			}
			
			return wallCollision || snakeCollision;		
		};
		
		// Eating apple METHOD, check if the head of the snake eats an apple
		isEatingApple (appleToEat){
			const head = this.body[0];
			if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
				return true;
			else
				return false;
		};
	}
	
	// [CLASS] APPLE
	class Apple {
		// Constructor
		constructor(position) {
			this.position = position;
		}
		// Drawing METHOD allowing it to draw itself on the canva
		draw (){
			const radius = blockSize/2;
			const x = this.position[0]*blockSize + radius;
			const y = this.position[1]*blockSize + radius;
			ctx.save();
			ctx.fillStyle = "#94101d";
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI*2, true);
			ctx.fill();
			ctx.restore();
		};
		
		// Setting new position METHOD allowing it to find a new position
		setNewPosition (){
			const newX = Math.round(Math.random()*(widthInBlocks-1));
			const newY = Math.round(Math.random()*(heightInBlocks-1));
			this.position = [newX,newY];
		}; 
		
		// METHOD checking if the new position is on the snake
		isOnSnake (snakeToCheck){
			let isOnSnake = false;
			for (let i=0 ; i < snakeToCheck.body.length ; i++){
				if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
					isOnSnake = true;	 
				}
			}
			return isOnSnake;
		};
	}
	
	// KEYS BINDING
	document.onkeydown = (e) => {
		const key = e.keyCode;
		let newDirection;
		switch(key){
			case 37:
				newDirection = "left";
				break;
			case 38:
				newDirection = "up";
				break;
			case 39:
				newDirection = "right";
				break;
			case 40:
				newDirection = "down";
				break;
			case 32:
				launch();
				return;
			default:
				return;
		}
		snakee.setDirection(newDirection);
	}

	init();
}