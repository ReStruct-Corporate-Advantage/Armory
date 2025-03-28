import {FavoriteTreeDirective} from './favorite-tree.directive';

describe('FavoriteTreeDirective Tests', () => {
    it('tests ngOnChanges conditions', () => {
        const favTreeDirective = new FavoriteTreeDirective(null, null);
        jest.spyOn(favTreeDirective, 'generateFavTreeForOwner').mockImplementation(() => {
        });

        // first half of scenarios
        testHelper(favTreeDirective, true);
        // second half of scenarios
        testHelper(favTreeDirective, false);
    });
});

const onChangesHelperMethod = (firstChange, currentValue, previousValue) => {
    return {
        favType: {
            firstChange,
            currentValue,
            previousValue
        } as any
    };
};

const testHelper = (favTreeDirective, saveMode) => {
    favTreeDirective['saveMode'] = saveMode;

    favTreeDirective.ngOnChanges(onChangesHelperMethod(true, 'a', 'a'));
    expect(favTreeDirective.generateFavTreeForOwner).not.toHaveBeenCalled();

    favTreeDirective.ngOnChanges(onChangesHelperMethod(false, 'a', 'a'));
    expect(favTreeDirective.generateFavTreeForOwner).not.toHaveBeenCalled();

    favTreeDirective.ngOnChanges(onChangesHelperMethod(true, 'a', 'b'));
    expect(favTreeDirective.generateFavTreeForOwner).not.toHaveBeenCalled();

    favTreeDirective.ngOnChanges(onChangesHelperMethod(true, 'a', null));
    expect(favTreeDirective.generateFavTreeForOwner).not.toHaveBeenCalled();

    favTreeDirective.ngOnChanges(onChangesHelperMethod(true, null, 'b'));
    expect(favTreeDirective.generateFavTreeForOwner).not.toHaveBeenCalled();

    favTreeDirective.ngOnChanges(onChangesHelperMethod(false, 'a', null));
    if (saveMode) {
        expect(favTreeDirective.generateFavTreeForOwner).not.toHaveBeenCalled();
    } else {
        // only one getting called as per conditions
        expect(favTreeDirective.generateFavTreeForOwner).toHaveBeenCalled();
    }

    favTreeDirective.ngOnChanges(onChangesHelperMethod(false, null, 'b'));
    if (saveMode) {
        expect(favTreeDirective.generateFavTreeForOwner).not.toHaveBeenCalled();
    } else {
        // only one getting called as per conditions
        expect(favTreeDirective.generateFavTreeForOwner).toHaveBeenCalled();
    }

    favTreeDirective.ngOnChanges(onChangesHelperMethod(false, 'a', 'b'));
    if (saveMode) {
        expect(favTreeDirective.generateFavTreeForOwner).not.toHaveBeenCalled();
    } else {
        // only one getting called as per conditions
        expect(favTreeDirective.generateFavTreeForOwner).toHaveBeenCalled();
    }
};
