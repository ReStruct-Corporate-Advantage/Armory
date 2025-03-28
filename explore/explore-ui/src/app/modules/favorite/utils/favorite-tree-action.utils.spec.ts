import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {FavoriteConstants} from '@constants/favorite.constants';
import {UIConstants} from '@constants/ui.constants';
import {FavoriteTreeActionUtils} from './favorite-tree-action.utils';

describe('FavoriteTreeActionUtils', () => {
    describe('addContextMenu Test', () => {
        let data: AuxAdvancedTreeListInterface;

        beforeEach(() => {
            data = {label: 'test'};
        });

        it('should create the context menu for FAVORITE', () => {
            FavoriteTreeActionUtils.addContextMenu(data, FavoriteConstants.FAVORITE);
            expect(data.contextMenu).toEqual([{label: UIConstants.DELETE_FAVORITE}]);
        });

        it('should create the context menu for FOLDER', () => {
            FavoriteTreeActionUtils.addContextMenu(data, FavoriteConstants.FOLDER);
            expect(data.contextMenu).toEqual([
                {label: UIConstants.CREATE_FOLDER},
                {label: UIConstants.RENAME_FOLDER}
            ]);
        });

        it('should create the context menu for EMPTY_FOLDER', () => {
            FavoriteTreeActionUtils.addContextMenu(data, FavoriteConstants.EMPTY_FOLDER);
            expect(data.contextMenu).toEqual([
                {label: UIConstants.CREATE_FOLDER},
                {label: UIConstants.RENAME_FOLDER},
                {label: UIConstants.DELETE_FOLDER}
            ]);
        });
    });


    describe('addContextMenu Modified Test', () => {
        let data: AuxAdvancedTreeListInterface;

        beforeEach(() => {
            data = {label: 'test'};
        });

        it('should create the context menu for LAYOUT', () => {
            FavoriteTreeActionUtils.addContextMenu(data, FavoriteConstants.FAVORITE, 'Workspace');
            expect(data.contextMenu).toEqual([{label: UIConstants.DELETE_FAVORITE + ' Workspace'}]);
        });

        it('should create the context menu for NULL data', () => {
            FavoriteTreeActionUtils.addContextMenu(data, FavoriteConstants.FAVORITE, null);
            expect(data.contextMenu).toEqual([{label: UIConstants.DELETE_FAVORITE}]);
        });
    });
});
