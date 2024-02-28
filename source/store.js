import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer'; // eslint-disable-line n/file-extension-in-import
import {draw, list, flat, shuffle} from 'radash';
import {FieldCell} from './field-cell.js';
import {fillingFigures} from './constants.js';

const fieldRows = 10;
const fieldColumns = 20;

const nCells = (rowCount, cellCount) => {
	const result = [];
	for (let i = 0; i < rowCount; i++) {
		for (let j = 0; j < cellCount; j++) {
			result[i] ||= [];
			result[i].push(new FieldCell(i, j).setValue(' '));
		}
	}

	return result;
};

export const useStatusStore = create(
	immer(set => ({
		status: 'RUNNING',
		actions: {
			start: () =>
				set(state => {
					state.status = 'RUNNING';
				}),
			waitInput: () =>
				set(state => {
					state.status = 'WAITING_INPUT';
				}),
			finish: () =>
				set(state => {
					state.status = 'FINISHED';
				}),
		},
	})),
);

export const useBoardStore = create(
	immer(set => ({
		loc: {
			x: 1,
			y: 1,
		},
		locX: 7,
		locY: 5,
		board: nCells(fieldRows, fieldColumns),
		storedCellsValues: flat(nCells(fieldRows, fieldColumns)),
		showSingleItem: false,
		gameInterval: null,
		counter: 1,
		shownItems: [],
		selectedItemIndex: 0,
		itemsToShow: [],
		shuffledItems: [],
		userSequence: [],
		randCoords: [],
		result: 'unknown',
		actions: {
			randomize: () =>
				set(state => {
					state.locX = draw(list(fieldRows - 1).slice(1, -1));
					state.locY = draw(list(fieldColumns - 1).slice(1, -1));
				}),
			drawItem: () =>
				set(state => {
					const flattenBoard = flat(state.board);
					const rnd = draw(flattenBoard);
					const cellValue = draw(fillingFigures);
					rnd.setValue(cellValue);
					state.storedCellsValues
						.find(item => item.x === rnd.x && item.y === rnd.y)
						.setValue(cellValue);
					// FlattenBoard.map((item) => {
					// 	const realCell = state.storedCellsValues.find((storedItem) => storedItem.hasSameCoords(item));
					// 	item.setValue(realCell.value);
					// });
				}),
			reset: () =>
				set(state => {
					state.shownItems = [];
					state.showSingleItem = false;
					state.shuffledItems = [];
					state.selectedItemIndex = 0;
					state.result = 'unknown';
					state.userSequence = [];
					state.counter = 1;
				}),
			registerInterval: value =>
				set(state => {
					state.gameInterval = value;
				}),
			unsetInterval: () =>
				set(state => {
					state.gameInterval = null;
				}),
			setItemsToShow: value =>
				set(state => {
					state.itemsToShow = value;
				}),
			incrementCounter: () =>
				set(state => {
					state.counter += 1;
				}),
			activateSingleItem: () =>
				set(state => {
					state.showSingleItem = true;
					state.loc = {
						x: 3,
						y: 2,
					};
				}),
			deactivateSingleItem: () =>
				set(state => {
					state.showSingleItem = false;
				}),
			addShownItem: value =>
				set(state => {
					state.shownItems.push(value);
				}),
			appendShownItem: () =>
				set(state => {
					const remained = state.itemsToShow.filter(
						item => !state.shownItems.includes(item),
					);
					if (remained.length > 0) {
						state.shownItems.push(draw(remained));
					}
				}),
			shuffleItems: () =>
				set(state => {
					state.shuffledItems = shuffle(state.itemsToShow);
				}),
			selectPreviousItem: () =>
				set(state => {
					const previousIndex = state.selectedItemIndex - 1;
					state.selectedItemIndex =
						previousIndex < 0 ? state.shownItems.length - 1 : previousIndex;
				}),
			selectNextItem: () =>
				set(state => {
					const nextIndex = state.selectedItemIndex + 1;
					state.selectedItemIndex =
						nextIndex < state.shownItems.length ? nextIndex : 0;
				}),
			appendUserSequence: value =>
				set(state => {
					state.userSequence.push(value);
				}),
			win: () =>
				set(state => {
					state.result = 'YOU WON';
				}),
			lose: () =>
				set(state => {
					state.result = 'YOU LOSE';
				}),
		},
	})),
);
