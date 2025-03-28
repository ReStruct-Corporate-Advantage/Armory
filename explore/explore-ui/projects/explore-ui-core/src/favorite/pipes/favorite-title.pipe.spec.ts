import {FavoriteTitlePipe} from './favorite-title.pipe';

describe('FavoriteTitlePipe', () => {
    const pipe = new FavoriteTitlePipe();

    describe('Transform Test', () => {
        it('should transform input', () => {
            expect(pipe.transform('Workspace', 'Search')).toBe('Search workspace');
            expect(pipe.transform('Workspace', 'Load')).toBe('Load Workspace');
            expect(pipe.transform('Workspace', 'Title')).toBe('Workspace Title');
            expect(pipe.transform('workspaces', 'My')).toBe('My workspaces');
            expect(pipe.transform('workspaces', 'Enterprise')).toBe('Enterprise workspaces');
            expect(pipe.transform('Report', 'Enterprise')).toBe('Enterprise report');
        });
    });
});
