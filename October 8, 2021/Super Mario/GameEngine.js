/**
 * this is the base game engine, all other games should be an extension of this one
 */


export class GameEngine{

	constructor(canvas, camera){
		this._canvas = canvas;
		this._camera = camera;
		this._pixelSize;
		this._ids = 1;
		this._entities = {};

	}

	_addEntity(name, entity){
		this._entities[name] = entity;
		this._entities[name]._id = addId();
		
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
	 * public engine funcitons
	 */

	newDomElement(width, height){
		let elem = document.createElement('DIV');
		elem.style.width = width + 'px';
		elem.style.height = height + 'px';
		elem.style.backgroundColor = 'transparent';
		elem.style.position = 'absolute';
		elem.style.top = '0';
		elem.style.left = '0';
		
		this._canvas.appendChild(elem);
		return elem;
	}

}

export class Entity{
	constructor(){
		this._components = {};
	}

	_addComponent(name, component){
		this._components[name] = component;
		this._components[name]._id= addId();
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

export class Vector2{

	static UP = new Vector2(0,1);
	static DOWN = new Vector2(0,-1);
	static RIGHT = new Vector2(1,0);
	static LEFT = new Vector2(-1,0);

	constructor(x, y){
		this.x = x;
		this.y = y
	}

	/**
	 * this function adds a new vector to the current Vector2 and returns new Vector2
	 * @param {*} vector = the vector to add to this vector
	 */
	add(vector){
		return new Vector2(this.x + vector.x, this.y+vector.y);
	}

	/**
	 * this function subtracts a Vector2 from the current Vector2 and returns a new Vector2
	 * @param {*} vector = the Vector2 to subtract from the current Vector2
	 */
	subtract(vector){
		return new Vector2(this.x-vector.x, this.y-vector.y);
	}

	/**
	 * this functions subtracts the current Vector2 from the parameter Vector2 and returns a new Vector2
	 * note: subtracting the current vector from the parameter Vector2 results in a vector pointing from the current Vector2 to the parameter Vector2
	 * @param {*} vector = the Vector2 to be subtracted from
	 */
	subtractDir(vector){
		return new Vector2(vector.x-this.x, vector.y-this.y);
	}

	/**
	 * this function returns the length of the current Vector2
	 */
	magnitude(){
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	}

	/**
	 * This function returns the magnitude of the current vector sqauared.
	 * when comparing magnitudes of vectors, this is faster and cheaper computationally
	 */
	magnitudeSquared(){
		return (this.x * this.x) + (this.y * this.y);
	}

	/**
	 * this funciton returns the direction of the current vector in radians
	 */
	dir(){
		return Math.atan(this.y/this.x);
	}

	/**
	 * this function scales the current vector by the parameter s and returns a new Vector2
	 * @param {*} s the scalar factor to mulitply by
	 */
	scalar(scalar){
		return new Vector2(this.x*scalar, this.y*scalar);
	}

	/**
	 * This method returns new  unit Vector2 of the current vector2
	 * a unit vector is a vector with the same direction but a magnitude of 1
	 */
	normalized(){
		const mag = this.magnitude();
		return new Vector2(this.x/mag, this.y/mag);
	}

	/**
	 * this returns a float that is the n product of the current Vector2 and the passed in Vector2
	 * @param {*} vector = the vector2 to be dot producted with.
	 */
	dot(vector){
		return (this.x * vector.x) + (this.y*vector.y);

	}

	
	/**
	 * this function returns the linear interpolation between this current Vector2 and the parameter Vector2
	 * this returns a new Vector2;
	 * @param {*} vector = the goal Vector2
	 * @param {*} delta = the pecent change between the two vectors.  a number between 0 and 1
	 */
	lerp(vector, delta){
		let v = this.subtractDir(vector);
		return v.scalar(delta);
	}

	/**
	 * This function returns a unit vector with a dirction facing the parameter vector
	 * @param {*} vector = the vector to point towards
	 */
	pointTowards(vector){
		const v = this.subtractDir(vector);
		return v.normalized();
	}

	projectOnto(vector){
		let v1 = vector.dot(this);
		let v2 = vector.dot(vector);
		console.log(this, vector, v1, v2);
		return vector.scalar(v1/v2);
		
	}

	/**
	 * PUBLIC STATIC METHODS
	 */

	static vectorFromAngle(){}
}

/**
 * ===============================================================
 * 	Public Functions
 * ===============================================================
 */

let ids = 0;
export function addId(){
	ids ++;
	return ids;
	
}

export function getEntitiesByComponent(engine, component){
	//returns an array entities that have the component passed in
	let temp = [];
	for(const [key, val] of Object.entries(engine['_entities'])){
		if(engine['_entities'][key]._getComponent(component) != undefined){
			temp.push(val);
		}
	}

	return temp;
}

