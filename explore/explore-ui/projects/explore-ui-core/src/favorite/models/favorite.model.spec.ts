/**
 * Test cases for Favorite class
 */
import {Favorite} from './favorite.model';

describe('Favorite tests', () => {
    it('should create an instance', () => {
        expect(new Favorite()).toBeTruthy();
    });

    /**
     * Tests constructing the WorkspaceConfig and setting/getting all the properties to ensure they set and return the correct values.
     */
    it('Construct object and test getter/setters', () => {
        const fav: Favorite = createTestFavorite();
        validateTestFavorite(fav);
    });

    /**
     * Test calling serialize on the WorkspaceConfig and then using that generated string to deserialize into a new WorkspaceConfig and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        const fav: Favorite = createTestFavorite();

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(fav.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        deserializedData.aliasId = 'abcde';
        const newFav: Favorite = new Favorite(deserializedData);

        validateTestFavorite(newFav);
    });

    it('Deserialize Compressed Test', () => {
        const fav: Favorite = createTestFavorite();
        fav.data = 'eNoLycgsVgCiRIWS1OISheKSosy8dIWSfBRucn5uQVFqcXFmfp5CXn5JBkgsN78oFQC4CBcD::compressed';

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(fav.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newFav: Favorite = new Favorite(deserializedData);
        expect(newFav.data).toEqual('This is a test string to test string compression nothing more');
    });

    /**
     * Tests that the function is Prism Favorite works as expected.
     */
    it('Test isPrismFav', () => {
        const fav: Favorite = createTestFavorite();
        expect(fav.isPrismFavorite()).toBeFalsy();

        fav.tool = 'Prism';
        expect(fav.isPrismFavorite()).toBeTruthy();
    });

    /**
     * Creates a test favorite object to test with.
     * @returns test favorite object
     */
    function createTestFavorite(): Favorite {
        const fav: Favorite = new Favorite();
        expect(fav).not.toBeUndefined();

        fav.tool = 'Explore';
        fav.title = 'Test Fav';
        fav.type = 'REPORT';
        fav.id = 99;
        fav.listOrder = 10;
        fav.owner = 'proberts';
        fav.description = 'Awesome Fav';
        fav.data = '{data}';

        return fav;
    }

    /**
     * Validates that the favorite has the correct values in it.
     * @param fav - favorite to be validated
     */
    function validateTestFavorite(fav: Favorite): void {
        expect(fav).not.toBeUndefined();
        expect(fav.tool).toBe('Explore');
        expect(fav.title).toBe('Test Fav');
        expect(fav.type).toBe('REPORT');
        expect(fav.id).toBe(99);
        expect(fav.listOrder).toBe(10);
        expect(fav.owner).toBe('proberts');
        expect(fav.description).toBe('Awesome Fav');
        expect(fav.data).toBe('{data}');
    }
});
