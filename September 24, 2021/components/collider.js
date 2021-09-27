/**
 * this component defines the collision box, detects collsions, and fires off the on collision event
 */

import { Component } from "../GameEngine.js";

export default class BoxCollider extends Component{
	constructor(transform, entObj, width, height){
		super();
		this._transform = transform;
		this._width = width;
		this._height = height;
		this._colliders = this._getColliders(entObj);

	}

	_distToObj(obj){
		//distance between two transforms connected to two colliders
		let x, y;
		x = (this._transform._x - obj._transform._x) * (this._transform._x - obj._transform._x);
		y = (this._transform._y - obj._transform._y) * (this._transform._y - obj._transform._y);

		return Math.sqrt(x+y);

	}

	_getColliders(entObj){
		let temp = [];
		for(const [key, val] of Object.entries(entObj)){
			if(key.toLowerCase() == 'collider'){
				temp.push(val);
			}
		}

		return temp;
	}

	_detectCollisions(){
		let collide = [];
		let dist, radius;
		this._colliders.forEach(c=>{
			dist = this._distToObj(c);
			radius = (this._width/2) + (c._width/2);
			if(dist < radius){collide.push(c);}

		});

		return collide;
	}

	update(delta){
		const collide = this._detectCollisions();
		if(collide.length >0){
			this._onCollision();
			collide.forEach(c=>{
				c._onCollision();
			});
		}
	}
}