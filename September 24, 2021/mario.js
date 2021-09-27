import PlayerController from './components/playerController.js';
import Sprite from './components/sprite.js';
import Transform from './components/transform.js';
import * as GE from './GameEngine.js';

class Mario extends GE.GameEngine{
	constructor(canvas, camera){
		super(canvas, camera);
		const mario = new GE.Entity();
		mario._addComponent('transform', new Transform(1, 1));
		mario._addComponent('sprite', new Sprite(document.querySelector('.character'), mario._getComponent('transform'), 48, 48));
		mario._addComponent('controller', new PlayerController(mario._getComponent('transform')));
		this._addEntity('player', mario);

		const boxSprite = document.createElement('div');
		boxSprite.style.width = '48px';
		boxSprite.style.height = '48px';
		boxSprite.style.backgroundColor = 'black';
		boxSprite.style.position = 'absolute';
		this._canvas.appendChild(boxSprite);
		const box = new GE.Entity();
		box._addComponent('transform', new Transform(100, 100));
		box._addComponent('sprite', new Sprite(boxSprite, box._getComponent('transform'), 48, 48));
		this._addEntity('box1', box);


		this._gameLoop();
	}
}

const camera = document.querySelector('.camera');
const map = document.querySelector('.map');

new Mario(map, camera);
