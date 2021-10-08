/**
 * player controller class
 */

import { Component} from "../GameEngine.js";

export default class PlayerController extends Component{
	constructor(transform, collider){
		super();
		this._transform = transform;
		this._collider = collider;
		this._movespeed = 2;
		this._vx = 0;
		this._vy = 0;
		this._gravity = 1;
		this._inAir = false;

		
		//add event listeners
		this._keyDown();
		this._keyUp();

	}

	update(delta){
		let x = this._transform._x + this._vx;
		let y = this._transform._y + this._vy;
		
		let col = this._collider.collision({x:x, y:y})
		
		if(! col.length > 0){
			
			this._transform._x += this._vx;
			this._transform._y += this._vy;
			
		}

		
	}

	_keyDown(){
		window.addEventListener('keydown', (e)=>{
			switch(e.code){
				case 'ArrowUp':
					this._vy = -this._movespeed;
					break;
				case 'ArrowDown':
					this._vy = this._movespeed;
					break;
				case 'ArrowLeft':
					this._vx = -this._movespeed;
					break;
				case 'ArrowRight':
					this._vx = this._movespeed;
					break;
				default:
					break;
			}
			
		});
	}

	_keyUp(){
		window.addEventListener('keyup', (e)=>{
			switch(e.code){
				case 'ArrowUp':
					this._vy = 0;
					break;
				case 'ArrowDown':
					this._vy = 0;
					break;
				case 'ArrowLeft':
					this._vx = 0;
					break;
				case 'ArrowRight':
					this._vx = 0;
					break;
				default:
					break;
			}
			
		});
	}

	


}