/**
 * this component defines the collision box, detects collsions, and fires off the on collision event
 */

import { Component, getEntitiesByComponent } from "../GameEngine.js";

export default class BoxCollider extends Component{
	constructor(engine, transform, width, height){
		super();
		this._engine = engine;
		this._transform = transform;
		this._width = width;
		this._height = height;
		this._box = {
			x : {
				min: this._transform._x,
				max: this._transform._x + this._width,
			},
			y: {
				min: this._transform._y,
				max: this._transform._y + this._height,
			}

		}

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
			if(entObj[key]._getComponent('collider') != undefined){
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

	collision(a){
		//need overlap in all directions to trigger a collision
		a = {
			x:{
				min: a.x,
				max: a.x + this._width,
			},
			y: {
				min : a.y,
				max: a.y + this._height,
			}
		}
		if(this._engine != undefined){
			//const colliders = this._engine._getEntitiesByComponent('collider');
			
		}

		const colliders = getEntitiesByComponent(this._engine, 'collider');
		for(let i=0; i<colliders.length; i++){
			if(colliders[i]._getComponent('collider')._id == this._id){colliders.splice(i,1)}
		}
		let col = [];
		colliders.forEach(c=>{
			const box = c._getComponent('collider');
			//console.log(this._checkBox(a, box._box));
			if(this._checkBox(a, box._box)){
				col.push([a,box._box]);
			}
		});

		return col;
		
	}

	_checkBox(a, b){
		if(a.x.max < b.x.min || a.x.min > b.x.max){return false} //check x axis overlap
		if(a.y.max < b.y.min || a.y.min > b.y.max){return false} //check y axis overlap
		
		return true;
	}


}