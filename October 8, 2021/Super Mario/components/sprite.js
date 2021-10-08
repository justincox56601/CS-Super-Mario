/**
 * sprite component for entitites
 */

import { Component} from "../GameEngine.js";

export default class Sprite extends Component{
	constructor(dom, sprite, transform, width, height){
		super();
		this._dom = dom;
		this._sprite = sprite;
		this._transform = transform;
		this._centerx = width/2;
		this._centery = height/2;

		this._dom.style.background = `url(${this._sprite})`;
		
		
	}

	update(delta){
		this._dom.style.transform = `translate3d(${this._transform._x}px, ${this._transform._y}px, 0)`;
	}
}