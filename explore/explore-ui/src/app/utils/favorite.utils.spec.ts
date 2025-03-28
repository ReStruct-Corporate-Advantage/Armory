import {FavoriteUtils} from './favorite.utils';
import {Favorite} from '@blk/explore-ui-core';

describe('FavoriteUtils', () => {
    describe('decodeFavorite Test', () => {
        it('should decode', function () {
            const encodedData = {
                'owner': 'seakim',
                'data': '%7b"configType":"workspace","workpads":%5b%7b"configType":"flat-workpad","reports":%5b%7b"configType":"WIDGETS_REPORT","widgets":%5b%5d,"title":"Report"%7d%5d,"portfolios":%5b%7b"configType":"portfolio","ticker":"PEP","benchmark":%7b"type":"RISK","order":1,"name":"MSAC_APACN"%7d%7d%5d%7d%5d,"title":"Untitled Workspace"%7d',
                serialize: null,
                deserialize: null
            };
            const decodedData = {
                'owner': 'seakim',
                'data': '{"configType":"workspace","workpads":[{"configType":"flat-workpad","reports":[{"configType":"WIDGETS_REPORT","widgets":[],"title":"Report"}],"portfolios":[{"configType":"portfolio","ticker":"PEP","benchmark":{"type":"RISK","order":1,"name":"MSAC_APACN"}}]}],"title":"Untitled Workspace"}',
                serialize: null,
                deserialize: null
            };

            expect(FavoriteUtils['decodeFavorite'](encodedData)).toEqual(decodedData);
        });
    });

    describe('splitFlagIdForFavorite Test', () => {
        it('should parse flagId', () => {
            expect(FavoriteUtils.splitFlagIdForFavorite('false;1325090')).toEqual({owner: '_ADMIN', id: 1325090});
            expect(FavoriteUtils.splitFlagIdForFavorite('true;1325090')).toEqual({owner: '_GLOBAL', id: 1325090});
            expect(FavoriteUtils.splitFlagIdForFavorite('1325090')).toEqual({owner: '_ADMIN', id: 1325090});
        });
    });

    describe('updateHeaderBasedOnToolName Test', () => {
        it('should prepend "Prism: " for prism favorites', () => {
            expect(FavoriteUtils.updateHeaderBasedOnToolName(new Favorite({
                tool: 'Prism',
                title: 'workspace'
            }))).toBe('Prism: workspace');
        });

        it('should return just title for explore favorites', () => {
            expect(FavoriteUtils.updateHeaderBasedOnToolName(new Favorite({
                tool: 'Explore',
                title: 'workspace'
            }))).toBe('workspace');
        });
    });

    it('should test transformInFrontendName', () => {
        expect(FavoriteUtils.transformInFrontendName('LAYOUT')).toBe('REPORT');
        expect(FavoriteUtils.transformInFrontendName('REPORT')).toBe('COLUMN_SET');
        expect(FavoriteUtils.transformInFrontendName('WORKSPACE')).toBe('WORKSPACE');
    });
});
