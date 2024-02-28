import {iterate, isEqual} from 'radash';
import figureSet from 'figures';
import React, {useEffect} from 'react';
import {nanoid} from 'nanoid';
import {Text, Box, Newline, useInput} from 'ink';
import * as emoji from 'node-emoji';
import {useBoardStore, useStatusStore} from './store.js';

const fieldColumns = 20;
const borderRows = fieldColumns * 2 - 1;

const ordinals = [
	'first',
	'second',
	'third',
	'fourth',
	'fifth',
	'sixth',
	'seventh',
	'eighth',
	'ninth',
	'tenth',
	'eleventh',
	'twelfth',
	'thirteenth',
];

const repeatString = (value, n) => iterate(n, acc => acc + value, '');
const nSpaces = n => repeatString(' ', n);

const showCellValueOrSingleItem = (item, loc, singleItem, figure) => {
	if (!singleItem) {
		return item.value;
	}

	return item.hasCoords(loc) ? figure : ' ';
};

const figuresToShow = [
	figureSet.heart,
	figureSet.arrowLeftRight,
	figureSet.arrowUpDown,
	figureSet.tick,
	figureSet.warning,
	figureSet.squareSmall,
	figureSet.squareSmallFilled,
	figureSet.triangleLeft,
	figureSet.triangleRight,
];

const emojisToShow = [
	'sunglasses',
	'angry',
	'ok_hand',
	'smile_cat',
	'heart',
	'pizza',
	'dancer',
	'smile',
	'joy',
	'grin',
].map(element => emoji.get(element));

export default function App({emojiMode}) {
	const board = useBoardStore(state => state.board);
	const shuffledItems = useBoardStore(state => state.shuffledItems);
	const status = useStatusStore(state => state.status);
	const userSequence = useBoardStore(state => state.userSequence);
	const showSingleItem = useBoardStore(state => state.showSingleItem);
	const shownItems = useBoardStore(state => state.shownItems);
	const selectedItemIndex = useBoardStore(state => state.selectedItemIndex);
	const result = useBoardStore(state => state.result);
	useBoardStore(state => state.counter);

	const randomize = useBoardStore(state => state.actions.randomize);
	const drawItem = useBoardStore(state => state.actions.drawItem);
	const appendShownItem = useBoardStore(state => state.actions.appendShownItem);
	const shuffleItems = useBoardStore(state => state.actions.shuffleItems);
	const win = useBoardStore(state => state.actions.win);
	const lose = useBoardStore(state => state.actions.lose);
	const start = useStatusStore(state => state.actions.start);
	const finish = useStatusStore(state => state.actions.finish);
	const registerInterval = useBoardStore(
		state => state.actions.registerInterval,
	);
	const unsetInterval = useBoardStore(state => state.actions.unsetInterval);
	const incrementCounter = useBoardStore(
		state => state.actions.incrementCounter,
	);
	const activateSingleItem = useBoardStore(
		state => state.actions.activateSingleItem,
	);
	const selectNextItem = useBoardStore(state => state.actions.selectNextItem);
	const selectPreviousItem = useBoardStore(
		state => state.actions.selectPreviousItem,
	);
	const appendUserSequence = useBoardStore(
		state => state.actions.appendUserSequence,
	);
	const deactivateSingleItem = useBoardStore(
		state => state.actions.deactivateSingleItem,
	);
	const waitForUserInput = useStatusStore(state => state.actions.waitInput);
	const setItemsToShow = useBoardStore(state => state.actions.setItemsToShow);
	const reset = useBoardStore(state => state.actions.reset);

	const buildField = () => {
		return (
			<Box flexDirection="column" justifyContent="center">
				<Text>
					{figureSet.lineDownBoldRightBold}
					{iterate(borderRows, acc => acc + figureSet.lineBold, '')}
					{figureSet.lineDownBoldLeftBold}
				</Text>
				{board.map(row => (
					<Text key={nanoid()}>
						{figureSet.lineVerticalBold}
						{showSingleItem
							? row.some(element =>
									element.hasCoords({
										x: useBoardStore.getState().locX,
										y: useBoardStore.getState().locY,
									}),
							  )
								? row
										.map(item =>
											item.hasCoords({
												x: useBoardStore.getState().locX,
												y: useBoardStore.getState().locY,
											})
												? shownItems[shownItems.length - 1]
												: ' ',
										)
										.join(' ')
										.slice(0, -1)
								: nSpaces(borderRows)
							: row
									.map(item =>
										showCellValueOrSingleItem(
											item,
											useBoardStore.getState().loc,
											showSingleItem,
										),
									)
									.join(' ')}
						{figureSet.lineVerticalBold}
					</Text>
				))}
				<Text>
					{figureSet.lineUpBoldRightBold}
					{iterate(borderRows, acc => acc + figureSet.lineBold, '')}
					{figureSet.lineUpBoldLeftBold}
				</Text>
			</Box>
		);
	};

	useEffect(() => {
		setItemsToShow(emojiMode ? emojisToShow : figuresToShow);

		const interval = setInterval(() => {
			const currentState = useBoardStore.getState();

			if (currentState.shownItems.length === currentState.itemsToShow.length) {
				shuffleItems();
				waitForUserInput();
				clearInterval(interval);
				unsetInterval();
				return;
			}

			if (currentState.counter % 7 === 0) {
				randomize();
				appendShownItem();
				activateSingleItem();
			} else {
				drawItem();
				deactivateSingleItem();
			}

			incrementCounter();
		}, 1010);

		registerInterval(interval);
		return () => {
			const {gameInterval} = useBoardStore.getState();
			if (gameInterval) {
				clearInterval(gameInterval);
			}
		};
	}, [
		activateSingleItem,
		appendShownItem,
		deactivateSingleItem,
		drawItem,
		emojiMode,
		incrementCounter,
		randomize,
		registerInterval,
		setItemsToShow,
		shuffleItems,
		unsetInterval,
		waitForUserInput,
	]);

	useInput(
		(_input, key) => {
			if (key.leftArrow) {
				selectPreviousItem();
			} else if (key.rightArrow) {
				selectNextItem();
			} else if (key.return) {
				appendUserSequence(shuffledItems[selectedItemIndex]);

				const currentUserSequence = useBoardStore.getState().userSequence;
				if (currentUserSequence.length === shownItems.length) {
					if (isEqual(shownItems, currentUserSequence)) {
						win();
					} else {
						lose();
					}

					finish();
				}
			}
		},
		{isActive: status === 'WAITING_INPUT'},
	);

	useInput(
		(input, _key) => {
			if (input === 'n') {
				randomize();
				reset();
				start();
				const interval = setInterval(() => {
					const currentState = useBoardStore.getState();

					if (
						currentState.shownItems.length === currentState.itemsToShow.length
					) {
						shuffleItems();
						waitForUserInput();
						clearInterval(interval);
						unsetInterval();
						return;
					}

					if (currentState.counter % 7 === 0) {
						randomize();
						appendShownItem();
						activateSingleItem();
					} else {
						drawItem();
						deactivateSingleItem();
					}

					incrementCounter();
				}, 1010);
				registerInterval(interval);
			}
		},
		{isActive: status === 'FINISHED'},
	);

	return (
		<Box flexDirection="column" justifyContent="center" alignItems="center">
			{status === 'FINISHED' ? (
				<Box flexDirection="column" justifyContent="center" alignItems="center">
					<Text>{result}</Text>
					<Newline />
					<Text>Source sequence was the following:</Text>
					<Box justifyContent="center">
						{shownItems.map(item => (
							<Box
								key={nanoid()}
								borderStyle="single"
								borderColor="green"
								width={5}
								height={3}
							>
								<Text>{item}</Text>
							</Box>
						))}
					</Box>
					<Box justifyContent="center" alignItems="center">
						<Text>Your answer:</Text>
					</Box>
					<Box justifyContent="center" alignItems="center">
						{shownItems.map((item, i) => (
							<Box
								key={nanoid()}
								borderStyle="single"
								borderColor={userSequence[i] === item ? 'green' : 'red'}
								width={5}
								height={3}
							>
								<Text>{`${userSequence[i]}`}</Text>
							</Box>
						))}
					</Box>
					<Box paddingBottom={2}>
						<Text>
							<Text bold>n</Text> - start a new round
						</Text>
					</Box>
				</Box>
			) : status === 'WAITING_INPUT' ? (
				<Box
					flexDirection="column"
					justifyContent="center"
					alignItems="center"
					rowGap={1}
				>
					<Text>Restore the sequence in which the elements appeared.</Text>
					<Box columnGap={1}>
						<Text>
							<Text bold>{figureSet.arrowLeft}</Text> - next item
						</Text>
						<Text>
							<Text bold>{figureSet.arrowLeft}</Text> - previous item
						</Text>
						<Text>
							<Text bold>ENTER</Text> - set item to current position
						</Text>
					</Box>
					<Box flexDirection="column" justifyContent="center" columnGap={2}>
						<Box>
							{shuffledItems.map((item, i) => (
								<Box
									key={nanoid()}
									borderStyle="single"
									borderColor={selectedItemIndex === i ? 'cyan' : 'gray'}
									width={5}
									height={3}
								>
									<Text>{`${item === figureSet.heart ? ' ' : ''}${item}`}</Text>
								</Box>
							))}
						</Box>
						<Box>
							<Text>What was {ordinals[userSequence.length]} item?</Text>
						</Box>
						<Box>
							{shownItems.map((item, i) => (
								<Box
									key={nanoid()}
									borderStyle="single"
									borderColor={userSequence.length === i ? 'green' : 'gray'}
									width={5}
									height={3}
								>
									<Text>{`${userSequence[i] ?? ''}`}</Text>
								</Box>
							))}
						</Box>
					</Box>
				</Box>
			) : (
				<Box paddingTop={1}>
					<Text>RUNNING</Text>
				</Box>
			)}
			{status === 'RUNNING' && buildField()}
		</Box>
	);
}
