/**
 * sprite component for entitites
 */

import { Component } from "../GameEngine.js";

export default class Sprite extends Component{
	constructor(sprite, transform, width, height){
		super();
		this._sprite = sprite;
		this._transform = transform;
		this._centerx = width/2;
		this._centery = height/2;
		
		this._sprite.style.left = this._transform._x + 'px';
		this._sprite.style.top = this._transform._y + 'px';
	}

	update(delta){
		this._sprite.style.transform = `translate3d(${this._transform._x - this._centerx}px, ${this._transform._y - this._centery }px, 0)`;
	}
}