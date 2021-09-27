/**
 * this is the base game engine, all other games should be an extension of this one
 */

export class GameEngine{

	constructor(canvas, camera){
		this._canvas = canvas;
		this._camera = camera;
		this._entities = {};

	}

	_addEntity(name, entity){
		this._entities[name] = entity;
	}

	_removeEntity(name){
		delete this._entities[name];
	}

	_getEntity(name){
		return this._entities[name];
	}

	_gameLoop(timestamp){
		//set up delta
		if(this._prevTime === undefined){this._prevTime = timestamp}
		let delta = timestamp - this._prevTime;
		this._prevTime = timestamp;

		for(const [key, val] of Object.entries(this._entities)){
			val.update(delta);
		}
		
		//loop
		window.requestAnimationFrame(this._gameLoop.bind(this));	
	}

	/**
	 * public functions
	*/

	distToObject(obj1, obj2){
	let x, y;
	x = (obj1._getComponent('transform')._x - obj2._getComponent('transform')._x) * (obj1._getComponent('transform')._x - obj2._getComponent('transform')._x);
	y = (obj1._getComponent('transform')._x - obj2._getComponent('transform')._x) * (obj1._getComponent('transform')._x - obj2._getComponent('transform')._x);
	return Math.sqrt(x+y);
	}

}

export class Entity{
	constructor(){
		this._components = {};
	}

	_addComponent(name, component){
		this._components[name] = component;
	}

	_removeComponent(name){
		delete this._components[name];
	}

	_getComponent(name){
		return this._components[name];
	}

	update(delta){
		for(const [key, val] of Object.entries(this._components)){
			val.update(delta);
		}
	}
}

export class Component{
	constructor(){}

	update(delta){
		return;
	}
}

