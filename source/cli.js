#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
		Usage
		  $ what-is-sequence-game

		Options
			--emoji  Use emojis as a sequence items
			--chars  Use chars as a sequence items

		Examples
		  $ what-is-sequence-game
		  $ what-is-sequence-game --emoji
	`,
	{
		importMeta: import.meta,
		flags: {
			emoj: {
				type: 'boolean',
				default: false,
				aliases: ['emoji', 'emojis'],
				shortFlag: 'e',
			},
			chars: {
				type: 'boolean',
				default: false,
				aliases: ['chs', 'chrs', 'char'],
				shortFlag: 'c',
			},
		},
	},
);

render(<App emojiMode={cli.flags.emoj} charsMode={cli.flags.chars} />);
