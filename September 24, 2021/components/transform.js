/**
 * Transform component
 */

import { Component } from "../GameEngine.js";

export default class Transform extends Component{
	constructor(x, y, scale=1, rotation=0 ){
		super();
		this._x = x;
		this._y = y;
		this._scale = scale;
		this._rotation = rotation;
	}

	
}