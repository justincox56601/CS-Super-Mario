/**
 * class for an animated sprite
 */

import { Component } from "../GameEngine.js";

export default class AnimatedSprite extends Component{
	constructor(dom, sprite, transform, width, height, dir, steps){
		super();
		this._dom = dom;
		this._sprite = sprite;
		this._transform = transform;
		this._centerx = width/2;
		this._centery = height/2;

		this._dom.style.overflow = 'hidden';

		const img = document.createElement('IMG');
		img.src = this._sprite;
		img.classList.add('pixel-art');
		
		//add in animation
		img.style.animation = `chr_animate_${dir} 1s steps(${steps}) infinite`;
		
		//append the img element
		this._dom.appendChild(img);

		

		
		
	}

	update(delta){
		this._dom.style.transform = `translate3d(${this._transform._x}px, ${this._transform._y}px, 0)`;
	}
}