import BoxCollider from './components/BoxCollider.js';
import PlayerController from './components/playerController.js';
import Sprite from './components/sprite.js';
import AnimatedSprite from './components/animatedSprite.js';
import Transform from './components/transform.js';
import * as GE from './GameEngine.js';

class Mario extends GE.GameEngine{
	constructor(canvas, camera){
		super(canvas, camera);
		this._pixelSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pixel-size'));

		const mario = new GE.Entity();
		const playerSize = 48;
		this._addEntity('player', mario);
		mario._addComponent('transform', new Transform(1, 1));
		mario._addComponent('collider', new BoxCollider(this, mario._getComponent('transform'), playerSize, playerSize));
		mario._addComponent('sprite', new Sprite(document.querySelector('.character'), null, mario._getComponent('transform'), playerSize, playerSize));
		mario._addComponent('controller', new PlayerController(mario._getComponent('transform'), mario._getComponent('collider')));

		const box2 = new GE.Entity();
		const box2Dom = this.newDomElement(48,48);
		this._addEntity('box2', box2);
		box2._addComponent('transform', new Transform(200,200));
		box2._addComponent('collider', new BoxCollider(this, box2._getComponent('transform'), 48,48));
		box2._addComponent('sprite', new Sprite(box2Dom, './ground.png', box2._getComponent('transform'), 48,48));

		const box3Size = 32;
		const box3Dom = this.newDomElement(box3Size,box3Size);
		const box3 = new GE.Entity();
		this._addEntity('box3', box3);
		box3._addComponent('transform', new Transform(200, 300));
		box3._addComponent('collider', new BoxCollider(this, box3._getComponent('transform'), box3Size, box3Size));
		box3._addComponent('sprite', new AnimatedSprite(box3Dom, 
														'./Water Top.png', 
														box3._getComponent('transform'), 
														box3Size, box3Size, 'vertical', 2));
		
		
		/*const boxSprite = document.createElement('DIV');
		const box1Size = 48;
		boxSprite.style.width = box1Size + 'px';
		boxSprite.style.height = box1Size + 'px';
		boxSprite.style.backgroundColor = 'black';
		boxSprite.style.position = 'absolute';
		boxSprite.style.top = '0';
		boxSprite.style.left = '0';
		this._canvas.appendChild(boxSprite);
		const box = new GE.Entity();
		this._addEntity('box1', box);
		box._addComponent('transform', new Transform(100, 100));
		box._addComponent('collider', new BoxCollider(box._getComponent('transform'), this._entities, box1Size, box1Size));
		box._addComponent('sprite', new Sprite(boxSprite, box._getComponent('transform'), box1Size, box1Size));

		const floorSprite = document.createElement('DIV');
		const floorWidth = 500;
		const floorHeight = 48;
		floorSprite.style.width = floorWidth + 'px';
		floorSprite.style.height = floorHeight + 'px';
		floorSprite.style.background = 'black';
		floorSprite.style.position = 'absolute';
		floorSprite.style.top = '0';
		floorSprite.style.lefft = '0';
		this._canvas.appendChild(floorSprite);
		const floor = new GE.Entity();
		this._addEntity('floor', floor);
		floor._addComponent('transform', new Transform(0, 500));
		floor._addComponent('collider', new BoxCollider(floor._getComponent('transform'), this._entities, floorWidth, floorHeight));
		floor._addComponent('sprite', new Sprite(floorSprite, floor._getComponent('transform'), floorWidth, floorHeight));
		*/
		
		//vector library test
		console.log(GE.Vector2.vectorFromAngle());

		this._gameLoop();
	}
}

const camera = document.querySelector('.camera');
const map = document.querySelector('.map');

new Mario(map, camera);
