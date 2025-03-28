const mock = () => {
    let storage = {};
    /* istanbul ignore next */
    return {
        getItem: key => (key in storage ? storage[key] : null),
        setItem: (key, value) => (storage[key] = value || ''),
        removeItem: key => delete storage[key],
        clear: () => (storage = {}),
        getStorage: () => storage
    };
};

Object.defineProperty(window, 'localStorage', { value: mock() });
Object.defineProperty(window, 'sessionStorage', { value: mock() });
Object.defineProperty(document, 'doctype', {
    value: '<!DOCTYPE html>'
});
Object.defineProperty(window, 'CSS', { value: mock() });
Object.defineProperty(window, 'alert', { value: (msg) => { console.log(msg); } });

Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
        getPropertyValue: prop => {
            return '';
        }
    })
});

Object.defineProperty(window, 'matchMedia', {
    value: () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {}
    })
});
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
    value: () => {
        return {
            enumerable: true,
            configurable: true
        };
    }
});

// required for ADS to prevent reinitialisation
jest.mock('@blk/aladdin-web-components/dist/loader', () => {
    const {applyPolyfills, defineCustomElements} = jest.requireActual('@blk/aladdin-web-components/dist/loader');
    return ({
        applyPolyfills: jest.fn().mockImplementationOnce(() => applyPolyfills()).mockImplementation(() => Promise.resolve()),
        defineCustomElements: jest.fn().mockImplementationOnce(() => defineCustomElements()).mockImplementation(() => Promise.resolve())
    })
});

type FilterType = (string | RegExp);
export const filterConsole = (stream: keyof Console, filters: FilterType[]) => {
    const compiled = filters.map(filter => new RegExp(filter));

    const real = console[stream] as any;
    (console as any)[stream] = jest.fn((...args) => {
        if(args[0]) {
            const s = `${args[0]}`;
            const shouldFilter = compiled.some(regex => s.match(regex));
            if(!shouldFilter) {
                real(...args);
            }
        }
    })
}

// required to silence spurious logging during tests
filterConsole('error', [
    'Could not find column',
    'No column Format is found of this column',
    'SyntaxError: Unexpected token \'\\(\'',
    'SyntaxError: Unexpected token \'.\'',
    'value is not in number',
    'The favorite does not exist.',
    'Invalid widget input',
    'Network error for TestCommand:',
    'Error: test',
    'Matching holding change type not found',
    'Failed to save the favorite',
    'Widget config type is not mapped to widget type',
    'No data in the response',
    'Fetch portfolio information error',
    'Error: Not implemented: window.open',
    'Failed to save',
    'Failed to load',
    'AppComponent initialisation error',
    'Parameters:',
    'Response:',
    'Failed to delete',
    'Failed to load',
    'failed to load',
    'error on finding tab uid',
    'No portfolio specified',
    'error loading the cusip',
    'Failed to get favorite:',
    'Failed to convert favorite',
    'Failed to get favorite folder structure:',
    'Failed to get slim favorites:',
    'Failed to get full favorites:',
    'Failed to favorites for user and type:',
    'Error: Http failure response while getting data',
    /^error$/
]);
filterConsole('warn', [
    'Unknown config type:',
    'No highlight rule found',
    'No HighlightComparisonType:',
    'Deprecation warning: value provided is not in a recognized RFC2822 or ISO format.',
    'Not supported:',
    'Invalid modeling type selected',
    'Unknown data store input',
    'Trying to cache empty data',
    'definition not found'
]);
filterConsole('info', [/.*/]);
filterConsole('log', [/.*/]);
filterConsole('group', [/.*/]);
filterConsole('groupEnd', [/.*/]);
