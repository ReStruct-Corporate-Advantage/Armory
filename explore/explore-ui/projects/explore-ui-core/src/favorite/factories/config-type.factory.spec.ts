import {AbstractConfig} from '../../core/models/abstract-config.model';
import {ColumnDefinition} from '../../definition/models/column-definition.model';
import {Favorite} from '../models/favorite.model';
import {CoreFavoriteStore} from '../stores';
import {ConfigTypeFactory} from './config-type.factory';
import {CoreColumnConstants} from '../../core/constants';
import moment from 'moment/moment';
import 'moment-timezone';
import {FavoriteConfig} from '../models/abstract-favorite-config.model.spec';
import {ColumnConfig} from '../../column/models/column-config/column-config.model';

/**
 * ConfigTypeFactory lives in core module, but this testcase has ColumnDefinition as a dependency (which lives in column-option module)
 */
describe('ConfigTypeFactory', () => {

    /**
     * Test registerConfigType and getConfigTypeFromKey
     */
    it('registerConfigType/getConfigTypeFromKey', () => {
        ConfigTypeFactory.registerConfigType('colDef', ColumnDefinition);
        expect(ConfigTypeFactory.getConfigTypeFromKey('colDef')).toBe(ColumnDefinition);
    });

    /**
     * Test createConfig
     */
    it('createConfig', () => {
        ConfigTypeFactory.registerConfigType(CoreColumnConstants.COL_DEF_BEAN, ColumnDefinition);
        expect(ConfigTypeFactory.createConfig(null, 'colDef')).toBeUndefined();
        expect(ConfigTypeFactory.createConfig(undefined, 'colDef')).toBeUndefined();
        expect(ConfigTypeFactory.createConfig('text', 'key')).toBe('text');

        const col: any = {'reportTypes': ['EXPOST'], 'columnTag': 'ActRetSemid', 'columnReports': ['prism_all'], 'isGroupable': false, 'columnType': 'EXPOST', 'field': 'ActRetSemid', 'isSubtotalable': false, 'isNotSupportedInCustomCal': false, 'functionFlag': 4, 'dataType': 'DOUBLE',
            'staticColumn': false, 'groups': ['Expost', 'Statistics'], 'uses': 'ACTIVE', 'title': 'Active Semi Deviation', 'columnFormat': {'scalingOptions': {'Percent (%)': 0.01, 'Basis Point (bp)': 0.0001}, 'scalable': true, 'scalingFactor': 0.0001, 'useThousandsSeparator': true,
            'decimalPlaces': 2, 'CLASS_TYPE': 'numericColumnFormat'}, 'CLASS_TYPE': CoreColumnConstants.COL_DEF_BEAN};

        expect(ConfigTypeFactory.createConfig(col, CoreColumnConstants.COL_DEF_BEAN) instanceof ColumnDefinition).toBeTruthy();

        col.configType = CoreColumnConstants.COL_DEF_BEAN;
        expect(ConfigTypeFactory.createConfig(col, 'colDef') instanceof ColumnDefinition).toBeTruthy();
    });

    describe('getFavoriteConfig Test', () => {
        beforeEach(() => {
            ConfigTypeFactory.registerConfigType(ColumnConfig.configType, ColumnConfig);
            jest.spyOn(moment.tz, 'guess').mockReturnValue('America/New_York');
        });

        it('Tests getFavoriteConfig method - When favorite is present', () => {
            const sampleCol: any = {
                'field': 'ActRetSemid',
                'staticColumn': false,
                'title': 'Active Semi Deviation',
                'CLASS_TYPE': ColumnConfig.configType
            };

            const cacheFav: Favorite = new Favorite();
            cacheFav.data = JSON.stringify(sampleCol);
            cacheFav.owner = 'tushshar';
            cacheFav.id = 127;
            cacheFav.aliasId = 'aliasId';
            cacheFav.type = ColumnConfig.configType;
            cacheFav.title = 'test_favorite';

            jest.spyOn(CoreFavoriteStore.favoriteCache, 'get').mockReturnValue(cacheFav);
            const favoriteConfig: AbstractConfig = ConfigTypeFactory.getFavoriteConfig(127, false);
            expect(favoriteConfig instanceof ColumnConfig).toBeTruthy();
        });

        it('Tests getFavoriteConfig method - When favorite is absent', () => {
            jest.spyOn(CoreFavoriteStore.favoriteCache, 'get').mockReturnValue(null);
            const favoriteConfig: AbstractConfig = ConfigTypeFactory.getFavoriteConfig(126, false);
            expect(favoriteConfig).toBeNull();
        });
    });
});
