export class FieldCell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.value = '';
	}

	hasCoords(checkable) {
		return this.x === checkable.x && this.y === checkable.y;
	}

	hasSameCoords(otherCell) {
		return this.x === otherCell.x && this.y === otherCell.y;
	}

	setValue(value) {
		this.value = value;
		return this;
	}
}
