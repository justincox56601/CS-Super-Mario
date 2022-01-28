/**
 * this is the base game engine, all other games should be an extension of this one
 */


export class GameEngine{

	constructor(canvas){
		this._entities = {};
		this._colliders = [];
		this._canvas = new MyCanvas(canvas);
		this._gameEvents = new Event();
		this._background = [];

		this._camera = new Camera(0,0);
		this._addEntity(this._camera);
		

		window.addEventListener('resize', e=>{
			const res = this._canvas.resize();
			this._camera.updateResolution(res);
		});



	}

	_addEntity(entity){
		entity.id = addId();
		entity.engine = this;
		this._entities[entity.id] = entity;
		

	}

	_removeEntity(name){
		delete this._entities[name];
	}

	_getEntity(name){
		return this._entities[name];
	}

	

	
	_gameLoop(){
		//set up delta
		const timestamp = Date.now();
		if(this._prevTime === undefined){this._prevTime = timestamp}
		let delta = (timestamp - this._prevTime)/100;
		this._prevTime = timestamp;

		//Update
		const cView = this._camera.getCurrentView();
		const lyst = [];
		for(const [key, val] of Object.entries(this._entities)){
			val.update(delta);
			const pos = val.transform.position;
			if(pos.x > cView[0] && pos.x < cView[2] &&
			   pos.y > cView[1] && pos.y < cView[3]){
				   //this item is inside the current view of the camera and needs to be drawn
				   lyst.push(val);
				   
			   }
		}

		//clear the canvas
		this._canvas.ctx.clearRect(0,0, this._canvas.canvas.width, this._canvas.canvas.height);

		//render
		let screenCenter = new Vector2(window.innerWidth/2, window.innerHeight/2);
		
		//draw backgrounds
		this._background.forEach(bg=>{
			this._canvas.ctx.drawImage(
				bg,
				this._camera.transform.position.x - this._camera.baseResolution.x/2,
				this._camera.transform.position.y - this._camera.baseResolution.y/2,
				this._camera.baseResolution.x, 
				this._camera.baseResolution.y,
				screenCenter.x - this._camera.viewPort.x/2,
				screenCenter.y - this._camera.viewPort.y/2,
				this._camera.viewPort.x, 
				this._camera.viewPort.y
			)
		});

		const matrix = this._camera.getTransformMatrix();
		//draw entities
		lyst.forEach(item=>{
			item.draw(this._canvas.ctx, matrix);
		});
		
		
		

		//draw UI layer
		//UI is always drawn last
		//this._ui.render(this._canvas.ctx, matrix);

		//draw view port
		this._canvas.ctx.beginPath();
		this._canvas.ctx.strokeStyle = 'white';
		this._canvas.ctx.rect(0, 0, this._camera.viewPort.x, this._camera.viewPort.y);
		this._canvas.ctx.stroke();

		

		//loop
		window.requestAnimationFrame(()=>{this._gameLoop()});	
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

	loadScene(map){
		//change background files into image resources
		this._background = [];
		map.background.forEach(bg=>{
			let img = new Image();
			img.src = bg;
			this._background.push(img);
		});

		//make a new grid object
		this._grid = new Grid(10, 10, [Math.ceil(map.width/10), Math.ceil(map.height/10)]);

		//load the map.obj list into the grid
		map.obj.forEach(obj=>{
			this._grid.insert(obj.transform.position.x, obj.transform.position.y, obj.id);
			if(obj.name == 'camera'){
				this._camera = obj; //designates the camera for the scene to use
			}
		});

		
		
	}

	/**
	 * Static engine methods
	 */

	static eventSubscribe(item, event, callback){
		this._gameEvents.subscribe(item, event, callback);
	}

	static eventUnsubscribe(item, event){
		this._gameEvents.unsubscribe(item, event);
	}

	static eventNotify(event){
		this._gameEvents.notify(event);
	}

}

/**
 * ========================================
 * 			Entities
 * ========================================
 */

export class Entity{
	constructor(x, y, width, height){
		this.name = 'entity';
		this._components = {};
		this.transform = new Transform(new Vector2(x,y), new Vector2(width,height)) ;
		this.layer = 'playerLayer';
	}

	_addComponent(component){
		component.id = addId();
		component.parent = this;
		this._components[component.id] = component;
		component.transform = this.transform;
		component.onStart();
		
	}

	_removeComponent(id){
		delete this._components[id];
	}

	_getComponentByName(name){
		for(const [key,val] of Object.keys(this._components)){
			if(this._components[key].name == name){
				return this._components[key];
			}
		}

		return false;
		
	}

	_getComponentById(id){
		return this._components[id];
	}

	onCollision(col){
		for(const [key, val] of Object.entries(this._components)){
			val.onCollision(col);
		}
	}


	update(delta){
		for(const [key, val] of Object.entries(this._components)){
			val.update(delta);
		}

	}

	draw(ctx, matrix){
		for(const [key, val] of Object.entries(this._components)){
			val.draw(ctx, matrix);
		}
	}
}


export class Camera extends Entity{
	constructor(x, y){
		super(x,y, 0, 0);
		this.name = 'camera';
		this.layer = 'cameraLayer';
		this.baseResolution = new Vector2(640, 320);
		this.viewPort = new Vector2(this.baseResolution.x, this.baseResolution.y);
		this.scale = new Vector2(1,1);
		
	}

	onStart(){
		this.transform.position = new Vector2(this.baseResolution.x/2, this.baseResolution.y/2);
	}

	updateViewPort(resolution){
		//resolution is a vector2 object
		this.viewPort = resolution;
		this._updateScale();
	}

	updateBaseResolution(resolution){
		//resolution is a vector2 object
		this.baseResolution = resolution;
		this._updateScale();
	}

	_updateScale(){
		this.scale = new Vector2(
			this.viewPort.x / this.baseResolution.x,
			this.viewPort.y / this.baseResolution.y
		);
	}
	

	draw(map, ctx){
		return;	
	}

	getTransformMatrix(){
		const center = new Vector2(this.viewPort.x/2, this.viewPort.y/2)
		const view = new Vector2(this.transform.position.x - this.baseResolution.x/2, this.transform.position.y - this.baseResolution.y/2);
		const screen = new Vector2(center.x-this.viewPort.x/2, center.y-this.viewPort.y/2);
		const tVector = screen.subtract(view);
		let matrix = Matrix.identityMatrix(5,5);
		matrix.setVal(0,4, tVector.x);
		matrix.setVal(1,4, tVector.y);
		matrix.setVal(0,0, this.scale.x);
		matrix.setVal(1,1, this.scale.y);
		matrix.setVal(2,2, this.scale.x);
		matrix.setVal(3,3, this.scale.y);

		return matrix;
	}

	getCurrentView(){
		//returns the current view of the camera in world space
		//array [x1,y1,x2,y2]
		return [
			this.transform.position.x - this.baseResolution.x/2,
			this.transform.position.y - this.baseResolution.y/2,
			this.transform.position.x + this.baseResolution.x/2,
			this.transform.position.y + this.baseResolution.y/2
		];
	}




}

export class UILayer extends Entity{
	constructor(x, y, width, height){
		super(x, y, width, height);
		//this.ctx = ctx;
		//this.screenCenter = new Vector2(window.innerWidth/2, window.innerHeight/2);
		//this.view = view;  //expects a Vector2
		//this.origin = new Vector2(this.screenCenter.x - this.view.x/2, this.screenCenter.y-this.view.y/2)
		//this.text = [];
		//this.addText(100, 100, "hello world" );
		
	}

	addText(x, y, text, color='white', size='16px', font='serif'){
		x += this.origin.x;
		y+= this.origin.y;
		this.text.push({
			x:x,
			y:y,
			text:text, 
			color:color, 
			font: size + ' ' + font,
			callback: this._drawText,
		})
	}

	_drawText(ctx, x, y, text, color, font){
		ctx.beginPath()
		ctx.fillStyle = color;
		ctx.font = font;
		ctx.fillText(text, x, y);
	}

	draw(ctx, matrix){
		return;
		//render is the same as the normal draw function, but since the 
		//UI needs to be drawn last we use render so that we can control
		//when it is called instead of the normal time.
	}

	render(ctx, matrix){
		for(const [key, val] of Object.entries(this._components)){
			val.draw(ctx, matrix);
		}
	}
}


/**
 * ========================================
 * 			Components
 * ========================================
 */

export class Component{
	constructor(){
		this.name = 'component';
		
	}

	onStart(){
		return;
	}

	update(delta){
		return;
	}

	draw(ctx, matrix){return;}

	onCollision(col){return;}
}

export class Transform {
	constructor(position, size, scale=new Vector2(1,1), rotation=0 ){
		this.name = 'transform';
		this.position = position  	//Vector2 object
		this.size = size;			//Vector2 object
		this.scale = scale;     	//Vecvtor2 object
		this.rotation = rotation;
	}

}


export class Sprite extends Component{
	constructor(sprite, frameSize, imgOffset){
		super();
		this.name = 'sprite';
		this.img = new Image();
		this.img.src = sprite; 				// path to the sprite iamge
		this.frameSize = frameSize; 		// array [width, height]
		this.imgOffset = imgOffset; 		// array [x,y] number of images from top left corner
		this.imgageGap = new Vector2(0,0);				//gap in pixels between images
		this.pixOffset = new Vector2(0,0);	//the offset from draw position
		this.debug = false;
		
	}


	onStart(){
		this.pixOffset = this.transform.size.scalar(-0.5);
	}
	

	draw(ctx, matrix){
		
		let pMatrix = new Matrix(5, 1);
		pMatrix.set([
			[this.transform.position.x + (this.pixOffset.x*this.transform.scale.x)],
			[this.transform.position.y + (this.pixOffset.y*this.transform.scale.y)],
			[this.transform.scale.x * this.frameSize[0]],
			[this.transform.scale.y * this.frameSize[1]],
			[1]
		]);
		const m = Matrix.multiply(matrix, pMatrix);
		ctx.drawImage(
			this.img,
			this.offset[0]*this.frameSize[0], this.offset[1]*this.frameSize[1], this.frameSize[0], this.frameSize[1],
			m.data[0], m.data[1], m.data[2], m.data[3],
		)

		//debug drawing bounding box
		if(this.debug){
			ctx.beginPath();
			ctx.strokeStyle = 'black';
			ctx.rect(m.data[0] ,
					mx.data[1],
					m.data[2],
					m.data[3]);
			ctx.stroke();
		}
	}
}

export class AnimatedSprite extends Sprite{
	constructor(sprite, frameSize, offset, frames, speed=1000){
		super(sprite, frameSize, offset);
		
		this.name = 'animatedSprite';
		this.frames = frames;
		this.speed = speed;
		
		this.currentFrame = 0;										//integer
		this.current = [			 								//array [currentX, currentY]	
			this.imgOffset[0] + this.currentFrame * this.frameSize[0],
			this.imgOffset[1] + this.currentFrame * this.frameSize[1]
		]; 		
		this.timer = 0;												//leave this alone, used for updates
		this.frameTime = this.speed/this.frames;					//leave this alone, used for updates
		
		this.currentAnimation = 'idle';								//a new current animation will have to be passed in
		this.animations = {											//default animation is idle.  a new animations object will have to be passed in
			idle : [[0,0]],
		}

		this.debug = false;
	}

	update(delta){
		this.timer += delta;
		if(this.timer >= this.frameTime){
			this.timer -= this.frameTime;
			this.currentFrame += 1;
			if(this.currentFrame >= this.animations[this.currentAnimation].length){this.currentFrame = 0}
		}
	}

	draw(ctx, matrix){
		let pMatrix = new Matrix(5, 1);
		pMatrix.set([
			[this.transform.position.x + (this.pixOffset.x*this.transform.scale.x)],
			[this.transform.position.y + (this.pixOffset.y*this.transform.scale.y)],
			[this.transform.scale.x * this.frameSize[0]],
			[this.transform.scale.y * this.frameSize[1]],
			[1]
		]);
		const m = Matrix.multiply(matrix, pMatrix);
		ctx.drawImage(
			this.img,
			this.animations[this.currentAnimation][this.currentFrame][0]*this.frameSize[0], 
			this.animations[this.currentAnimation][this.currentFrame][1]*this.frameSize[1], 
			this.frameSize[0], this.frameSize[1],
			m.data[0], m.data[1], m.data[2], m.data[3],
		);
			

		//debug drawing bounding box
		if(this.debug){
			ctx.beginPath();
			ctx.strokeStyle = 'black';
			ctx.rect(m.data[0] ,
					m.data[1],
					m.data[2],
					m.data[3]);
			ctx.stroke();
		}
		
	}


}

export class Primitive extends Component{
	constructor(size, color='black', fill=true){
		super();
		this.name = 'primitive';
		this.size = size 					//Vector2(width, height)
		this.pixOffset = new Vector2(0,0); 	//offset from the center point
		this.color = color; 					//string for color
		this.fill = fill;
	}

	onStart(){
		this.pixOffset = this.transform.size.scalar(-0.5);
	}

	draw(ctx, matrix){
		let pMatrix = new Matrix(5, 1);
		pMatrix.set([
			[this.transform.position.x + (this.pixOffset.x*this.transform.scale.x)],
			[this.transform.position.y + (this.pixOffset.y*this.transform.scale.y)],
			[this.transform.scale.x * this.size.x],
			[this.transform.scale.y * this.size.y],
			[1]
		]);
		const m = Matrix.multiply(matrix, pMatrix);
		ctx.beginPath();
		if(this.fill){
			ctx.fillStyle = this.color;
			ctx.fillRect(m.data[0] ,
					m.data[1],
					m.data[2],
					m.data[3]);
			ctx.stroke();
		}else{
			ctx.strokeStyle = this.color;
			ctx.rect(m.data[0] ,
					m.data[1],
					m.data[2],
					m.data[3]);
			ctx.stroke();
		}
		

	}
}

export class BoxCollider extends Component{
	constructor(colliderArray){
		super();
		this.name = 'boxCollider';
		this.colliderArray = colliderArray;
		this.colliderArray.push(this);
		
		this.vertices = new Matrix(3,4); //[UL, UR, LR, LL]
		this.size = new Vector2(0,0);
		this.half = new Vector2(0,0);

		
		
		this.debug = false;
		
		
	}

	onStart(){
		this.size = this.transform.size;
		this.half = this.size.scalar(0.5);
		this.updateVertices();

		//subscribe the collision listener
		this.parent.engine._gameEvents.subscribe(this.parent, 'collision', 'onCollision')
	}

	updateSize(size){
		//expects a Vector2 
		this.size = size;
		this.half = this.size.scalar(0.5);
	}

	updateVertices(){
		const size = this.size;
		const scale = this.transform.scale;
		let pos = this.transform.position.subtract(this.half.scalar(scale));
		this.vertices.set([
			[pos.x, pos.x+(size.x*scale.x), pos.x+(size.x*scale.y), pos.x],
			[pos.y, pos.y, pos.y+(size.y*scale.x), pos.y+(size.y*scale.y)],
			[1,1,1,1]
		]);

	}

	_projection(pos){
		//same as update vertices but for checking positions outside of the object
		const size = this.size;
		const scale = this.transform.scale;
		pos = pos.subtract(this.half.scalar(scale));

		let v = new Matrix(3,4);
		v.set([
			[pos.x, pos.x+(size.x*scale.x), pos.x+(size.x*scale.y), pos.x],
			[pos.y, pos.y, pos.y+(size.y*scale.x), pos.y+(size.y*scale.y)],
			[1,1,1,1]
		]);

		return v;
	}

	checkCollisions(pos = null){
		//creates an array of items collided with
		//pos is a Vector2 of position x,y
		//if pos is null will make a projection and check the projection position

		//grab the current matrix or shadow matrix
		const aMatrix = (pos == null)? this.vertices : this._projection(pos);
		
		let col = [];
		
		this.colliderArray.forEach(item=>{
			if(item != this){
				if(this.aabb(aMatrix.data, item.vertices.data)){
					col.push(item.parent)
				}
			}		
			
		});
		return (col.length >0)? col : false;

	}
	

	aabb(a, b){
		
		if(a[0][0] > b[0][1] || a[0][1] < b[0][0]){return false} //checking x values
		if(a[1][0] > b[1][3] || a[1][3] < b[1][0]){return false} //checking y values
		return true;
	}



	update(delta){
		this.updateVertices();
		let col = this.checkCollisions()
		if(col){
			col.forEach(c => {
				this.parent.engine._gameEvents.notify('collision', this.parent, c)
			});
		}
		
	}

	draw(ctx, matrix){
		//debug drawing
	
		//debug drawing bounding box
		if(this.debug){
			let pMatrix = new Matrix(5, 1);
			pMatrix.set([
				[this.transform.position.x - (this.half.x*this.transform.scale.x)],
				[this.transform.position.y - (this.half.y*this.transform.scale.y)],
				[this.transform.scale.x * this.size.x],
				[this.transform.scale.y * this.size.y],
				[1]
			]);
			const m = Matrix.multiply(matrix, pMatrix);
			ctx.beginPath();
			ctx.strokeStyle = 'red';
			ctx.rect(m.data[0] ,
					m.data[1],
					m.data[2],
					m.data[3]);
			ctx.stroke();
			
		}
		
	}


}

export class UI_textBox extends Component{
	constructor(x, y, width, height, color='transparent', outline=false, outlineColor='white'){
		super();
		this.name = 'ui_textBox';
		this.position = new Vector2(x,y);
		this.size = new Vector2(width, height);
		this.color= color;
		this.outline = outline;
		this.outlineColor = outlineColor;
		
		this.text = {};
	}

	addText(x, y, text, color='white', size=16, font='serif'){
		this.text = {
			x:x, y:y, text:text, color:color, size: size, font: font,
		}
	}

	draw(ctx, matrix){
		
		let bMatrix = new Matrix(5, 1);
		let pos = this.transform.position.add(this.position);
		bMatrix.set([
			[pos.x ],
			[pos.y ],
			[this.transform.scale.x * this.size.x ],
			[this.transform.scale.y * this.size.y],
			[1]
		]);
		const m = Matrix.multiply(matrix, bMatrix);
		
		let tMatrix = new Matrix(5,1);  //matrix for the text of the text box
		tMatrix.set([
			[pos.x + this.text.x ],
			[pos.y + this.text.y ],
			[this.transform.scale.x * this.text.size ],
			[this.transform.scale.y * this.text.size],
			[1]
		]);
		const t = Matrix.multiply(matrix, tMatrix);
		
		
		//draw the text box
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.fillRect(m.data[0], m.data[1], m.data[2], m.data[3]);
		
		//draw text box outline
		if(this.outline){
			ctx.beginPath();
			ctx.strokeStyle = this.outlineColor;
			ctx.strokeRect(m.data[0], m.data[1], m.data[2], m.data[3]);
		}
		
		//draw text
		if(Object.keys(this.text).length != 0){
			ctx.beginPath()
			ctx.fillStyle = this.text.color;
			//ctx.font = this.text.font;
			ctx.font = t.data[2] + 'px ' + this.text.font;
			ctx.textBaseline = 'top';
			ctx.fillText(this.text.text, t.data[0], t.data[1]);
			ctx.stroke();
		}
		
	}
}

export class AudioSource extends Component{
	constructor(src){
		super();
		this.name = 'audioSource'
		this.element = new Audio(src);
	}

	play(){
		this.element.play();
	}

	pause(){
		this.element.pause();
	}

	volume(number){
		this.element.volume = number; //expected to be between 0 adn 1
	}

	loop(bool){
		this.element.loop = bool;
	}
}



/**
 * ========================================
 * 			Data Structures
 * ========================================
 */
export class Grid {
	constructor(width, height, cellSize){
		this.width = width; 			//number of cells wide
		this.height = height; 			//number of cells high
		this.cellSize = cellSize;  		//array [width, height] 
		this.data = [];

		for(let i = 0; i<this.height; i++){
			this.data[i] = [];
			for(let j=0; j<this.width; j++){
				this.data[i][j] = []; // each grid cell is an array
				
			}
		}
	}


	/**
	 * inserts an item into the specified place in the this.grid array
	 * @param {*} x x coordinate to place item
	 * @param {*} y y coordinate to place item
	 * @param {*} item the item to place
	 */
	insert(item){
		const x = Math.floor(item.transform.position.x / this.cellSize[0]);
		const y = Math.floor(item.transform.position.y / this.cellSize[1]);
		
		this.data[y][x].push(item)
		
	}

	/**
	 * resets the specified location in the this.grid array to its original contents
	 * @param {*} x x coordinate to remove
	 * @param {*} y y coordinate to remove
	 */
	delete(item){
		const x = Math.floor(item.transform.position.x / this.cellSize[0]);
		const y = Math.floor(item.transform.position.y / this.cellSize[1]);
		let index = this.data[y][x].indexOf(item);
		this.data[y][x].splice(index, 1);

	}

	/**
	 * returns an array of all items found within the radius of the x,y coordinates
	 * @param {*} x x coordinate
	 * @param {*} y y coordinate
	 * @param {*} radius number of pixels around the x,y coordinate to search
	 * @returns array 
	 */
	findNearby(x, y , radius){
		//radius is in pixels, convert it to grid squares
		radius = [
			Math.ceil(radius / this.cellSize[0]),
			Math.ceil(radius / this.cellSize[1])
		];
		x = Math.floor(x / this.cellSize[0]);
		y = Math.floor(y / this.cellSize[1]);
		
		let results, row, col;
		results = [];
		for(row = Math.max(y-radius[1],0); row <= y+radius[1]; row++){
			for(col = Math.max(x-radius[0],0); col<= x+radius[0]; col++){
				try {
					this.data[row][col].forEach(item=>{
						results.push(item);
					});
				} catch (error) {}	
			}
		}
		return results;
	}

	update(delta, view){
		//loops through all of the grid cells and calls the update funciton on the entities
		let results = [];
		for(let i=0; i<this.height; i++){
			for(let j=0; j<this.width; j++){
				for(let k=0; k<this.data[i][j].length; k++){
					
					try {
						const item = this.data[i][j][k];
						item.update(delta);
						this.delete(item);
						this.insert(item);
						if(this.data[i][j][k].transform.position.x < view[2] &&
							this.data[i][j][k].transform.position.y < view[3] &&
							this.data[i][j][k].transform.position.x + this.data[i][j][k].transform.size.x > view[1] &&
							this.data[i][j][k].transform.position.y +this.data[i][j][k].transform.size.y > view[0]	
							){results.push(item);}

					} catch (error) {
						
					}
					
				}
			}
		}

		return results
	}

}

export class Event{
	constructor(){
		this.events = {}
	}


	/**
	 * adds a event to the events object and adds the listener to the listeners list
	 * @param {*} item 
	 * @param {*} event 
	 * @param {*} callback 
	 */
	subscribe(listener, event, callback){
		if(this.events[event] == undefined){
			this.events[event] = [];
		}

		this.events[event].push({listener, callback});
	}

	unsubscribe(listener, event){
		if(this.events[event]){
			this.events[event].forEach(e=>{
				if(e.listener == listener){
					this.events[event].splice(e,1);
				}
			})
		}
		
		//if there are no listener attached to this event after subscribe, delete the event
		if(this.events[event].length == 0){
			delete this.events[event];
		}
	}

	notify(event, param, listener=null){
		try {
			this.events[event].forEach(e => {
				//e is an object with a listener object and callback method
				if(listener == null){
					e.listener[e.callback](param);
				}else{
					if(listener == e.listener){
						e.listener[e.callback](param);
					}
				}
			});
		} catch (error) {
			//ignore the event and move on
		}
		
		
	}
}

export class Map {
	constructor(width, height){
		this.background = [
			'background3.png',
		];
		this.width = width;
		this.height = height;
		this.obj = [];
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
		if(scalar instanceof Vector2){
			return new Vector2(this.x*scalar.x, this.y*scalar.y)
		}else{
			return new Vector2(this.x*scalar, this.y*scalar);
		}
		
	}

	/**
	 * This method returns new  unit Vector2 of the current vector2
	 * a unit vector is a vector with the same direction but a magnitude of 1
	 */
	normalize(){
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
		return v.normalize();
	}

	projectOnto(vector){
		let b = vector.normalize();
		return b.scalar(this.dot(b));
		
	}

	angleBetween(vector){
		let a = this.dot(vector);
		let b = this.magnitude() * vector.magnitude();
		return Math.acos(a/b);  //this is in radians
	}

	/**
	 * PUBLIC STATIC METHODS
	 */

	static vectorFromAngle(){}
}

export class Matrix{
	//this class DOES NOT have safe guards for order or size of matrices
	//use are your risk.
	constructor(rows, columns){
		this.rows = rows;
		this.columns = columns;
		this.data = [];

		for(let i = 0; i<this.rows; i++){
			this.data[i] = [];
			for(let j=0; j<this.columns; j++){
				this.data[i][j] = 0;
			}
		}
	}

	set(n){
		//n is a 2D array
		for(let i=0; i<this.rows; i++){
			for(let j=0; j<this.columns; j++){
				this.data[i][j] = n[i][j];
			}
		}
	}

	setVal(row, col, val){
		this.data[row][col] = val;
	}

	add(n){
		//n can be a scalar value or a matrix
		if(n instanceof Matrix){
			for(let i=0; i<this.rows; i++){
				for(let j=0; j< this.columns; j++){
					this.data[i][j] += n.data[i][j];
				}
			}
		}else{
			for(let i=0; i<this.rows; i++){
				for(let j=0; j< this.columns; j++){
					this.data[i][j] += n;
				}
			}
		}
	}

	multiply(n){
		//n can be scalar or a matrix
		//if n is a matrix, this will return a new matrix;
		if(n instanceof Matrix){
			if(this.columns !== n.rows){
				console.log('A.columns must equal b.rows')
				return undefined;
			}
			let b = new Matrix(this.rows, n.columns);
			for(let i = 0; i<b.rows; i++){
				for(let j=0; j<b.columns; j++){
					let sum = 0;
					for(let k=0; k<this.columns; k++){
						sum += this.data[i][k] * n.data[k][j]
					} 
					b.data[i][j] = sum;
				}
			}

			this.rows = b.rows;
			this.columns = b.columns;
			this.data = b.data;

		}else{
			for(let i=0; i<this.rows; i++){
				for(let j=0; j<this.columns; j++){
					this.data[i][j] *= n;
				}
			}
		}
	}

	transpose(){
		//flips the rows and columns of the matrix
		//returns a new matrix
		let b = new Matrix(this.columns, this.row);
		for(let i=0; i<this.rows; i++){
			for(let j=0; j<this.columns; j++){
				b.data[j][i] = this.data[i][j];
			}
		}
		this.rows = b.rows;
		this.columns = b.columns;
		this.data = b.data;
	}

	map(func){
		//this method calls the func on every element of the matrix
		for(let i=0; i<this.rows; i++){
			for(let j=0; j<this.columns; j++){
				this.data[i][j] = func(this.data[i][j], i, j);
			}
		}
	}

	print(){
		console.table(this.data);
	}

	static identityMatrix(rows, columns){
		//creates a new identity matrix 
		let result = new Matrix(rows, columns);
		const fn = function(val, i, j){
			return (i==j)? 1 : val;
		}
		result.map(fn);
		
		return result;
	}

	static multiply(m1, m2){
		if(m1.columns !== m2.rows){
			console.log('m1.columns must equal m2.rows')
			return undefined;
		}
		let result = new Matrix(m1.rows, m2.columns);
		for(let i = 0; i<result.rows; i++){
			for(let j=0; j<result.columns; j++){
				let sum = 0;
				for(let k=0; k<m1.columns; k++){
					sum += m1.data[i][k] * m2.data[k][j];
				} 
				result.data[i][j] = sum;
			}
		}

		return result;
	}
}



/**
 * ===============================================================
 * 	Non exported Clases
 * ===============================================================
 */

class MyCanvas{
	constructor(canvas){
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');
		this.canvas.style.border='2px solid black';
		this.canvas.width = this.canvas.parentElement.scrollWidth;
		this.canvas.height = this.canvas.parentElement.scrollHeight;
		
	}

	resize(){
		//changes the canvas resolution to match the screen and returns the resolution
		this.canvas.width = this.canvas.parentElement.scrollWidth;
		this.canvas.height = this.canvas.parentElement.scrollHeight;
		return {x: this.canvas.width, y:this.canvas.height}
	}
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








