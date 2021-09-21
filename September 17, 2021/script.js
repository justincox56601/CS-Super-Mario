/**
 * Super Mario Game
 * Object Oriented
 * ECS System
 */

class Game{
	constructor(camera, map, player){
		this._camera = camera;
		this._map = map;
		this._player = {
			sprite : player,
			x: 0,
			y: 0,
			speed: 5,
		};
		this._pixelSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pixel-size'));
		this._gridCell =  this._pixelSize * 48;
		this._prevTime;
		this._keyInputs = [];

		this._addEventListeners();
		this._gameLoop();
	}

	_addEventListeners(){
		window.addEventListener('keydown', (e)=>{
			this._keyInputs.unshift(e.code);
		});

		window.addEventListener('keyup', (e)=>{
			this._keyInputs.splice(0,1);
		});
	}

	_keyInput(btn){
		switch(btn){
			case 'ArrowUp':
				this._keyInputs.unshift('ArrowUp');
				break;
			case 'ArrowDown':
				tthis._keyInputs.unshift('ArrowDown');
				break;
			case 'ArrowLeft':
				this._keyInputs.unshift('ArrowUp');
				break;
			case 'ArrowRight':
				this._keyInputs.unshift('ArrowUp');
				break;
			default:
				break;
		}
		
	}

	_movePlayer(delta){
		
		let dir = this._keyInputs[0];
		console.log(dir);
		switch(dir){
			case 'ArrowUp':
				this._player.y -= this._player.speed;
				break;
			case 'ArrowDown':
				this._player.y += this._player.speed;
				break;
			case 'ArrowLeft':
				this._player.x -= this._player.speed;
				break;
			case 'ArrowRight':
				this._player.x += this._player.speed;
				break;
			default:
				break;
		}

		this._player.sprite.style.transform = `translate3d(${this._player.x*this._pixelSize}px, ${this._player.y*this._pixelSize}px, 0)`;

		
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


