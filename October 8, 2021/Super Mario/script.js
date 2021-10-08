/**
 * Super Mario Game
 * Object Oriented
 * ECS System
 */

class Queue{
	constructor(ary =[]){
		this._queue = ary;
	}

	enqueue(item){
		this._queue.unshift(item);
	}

	pop(){
		const item = this._queue[0];
		this._queue.splice(0,1);
		return item;
	}

	peek(){
		return this._queue[0];
	}

	isEmpty(){
		return this._queue.length <= 0;
	}
}

class Game{
	constructor(camera, map, player){
		this._camera = camera;
		this._map = map;
		this._player = {
			sprite : player,
			x: 1,
			y:1,
			vx: 0,
			vy: 0,
			speed: 1,
			centerx: 24,
			centery:24,
			radius: 24,
		};
		this._player.sprite.style.border = '1px solid red';
		this._pixelSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pixel-size'));
		this._gridCell =  this._pixelSize * 48;
		this._prevTime;
		this._keyInputs = new Queue();

		this._block = {
			x: 100, 
			y: 50,
			
			size:48,
			centerx : 24,
			centery : 24,
			radius : 24,
		}
		this._placeBlock();

		this._addEventListeners();
		this._gameLoop();
	}

	_addEventListeners(){
		window.addEventListener('keydown', (e)=>{
			this._keyInput(e.code);
			
		});

		window.addEventListener('keyup', (e)=>{
			if(e.code == 'ArrowUp' || e.code == 'ArrowDown'){this._player.vy = 0;}
			if(e.code == 'ArrowLeft' || e.code == 'ArrowRight'){this._player.vx = 0;}
		});
	}

	_keyInput(btn){
		switch(btn){
			case 'ArrowUp':
				this._player.vy = -this._player.speed;
				break;
			case 'ArrowDown':
				this._player.vy = this._player.speed;
				break;
			case 'ArrowLeft':
				this._player.vx = -this._player.speed;
				break;
			case 'ArrowRight':
				this._player.vx = this._player.speed;
				break;
			default:
				break;
		}
		
	}

	_movePlayer(delta){
		
		let xpos = this._player.x +(this._player.vx*this._pixelSize);
		let ypos = this._player.y + (this._player.vy*this._pixelSize);
		
		if (this._collision({x:xpos, y:ypos, radius: this._player.radius}, this._block) == false){
			this._player.x += this._player.vx*this._pixelSize;
			this._player.y += this._player.vy*this._pixelSize;
			this._player.sprite.style.transform = `translate3d(${this._player.x - (this._player.centerx* this._pixelSize)}px, ${this._player.y - (this._player.centery * this._pixelSize)}px, 0)`;
		}
		
			
			
		
	}

	_collision(obj1, obj2){
		let x, y, dist, radius;
		x = (obj1.x - obj2.x) * (obj1.x - obj2.x);
		y = (obj1.y - obj2.y) * (obj1.y - obj2.y);
		dist = Math.sqrt(x+y);
		radius = (obj1.radius + obj2.radius) * this._pixelSize;
		
		return (dist < radius);
	}

	
	_placeBlock(){
		const block = document.createElement('DIV');
		block.id = 'block1';
		block.style.position = 'absolute';
		block.style.left = (this._block.x - this._block.centerx )* this._pixelSize +'px';
		block.style.top = (this._block.y - this._block.centerx) * this._pixelSize+'px';
		block.style.width = this._block.size * this._pixelSize+'px';
		block.style.height = this._block.size * this._pixelSize+'px';
		block.style.backgroundColor = 'black';
		this._map.appendChild(block);

		//update block position 
		this._block.x *= this._pixelSize;
		this._block.y *= this._pixelSize;

		
	}


	_gameLoop(timestamp){
		//set up delta
		if(this._prevTime === undefined){this._prevTime = timestamp}
		let delta = timestamp - this._prevTime;
		this._prevTime = timestamp;

		//do maths
		this._movePlayer(delta);

		//loop
		window.requestAnimationFrame(this._gameLoop.bind(this));
		

		
	}


}

class Player{}

//start the game
const camera = document.querySelector('.camera');
const map = document.querySelector('.map');
const player = document.querySelector('.character');

const game = new Game(camera, map, player);
//game._gameLoop();


