import React from 'react';
import test from 'ava';
import {render} from 'ink-testing-library';
import App from './source/app.js';

test('shows label', t => {
	const {lastFrame} = render(<App name="Jane" />);

	t.true(lastFrame().includes('RUNNING'));
});
