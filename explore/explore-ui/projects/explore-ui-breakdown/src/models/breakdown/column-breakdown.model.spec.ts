import {ColumnBreakdown} from './column-breakdown.model';
import {Breakdown} from './breakdown.model';
import {ColumnOptionFactory, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {ColumnSector} from '../sector/column-sector/column-sector.model';
import {MultiManagerBreakdownModel} from '../multi-manager/multi-manager-breakdown.model';

describe('ColumnBreakdown', function () {
    let columnBreakdown: ColumnBreakdown;
    let breakdown: Breakdown;
    let multiManagerData: MultiManagerBreakdownModel;

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        ColumnOptionFactory.registerOptionType(ColumnBreakdown.CONFIG_TYPE, ColumnBreakdown);
        columnBreakdown = new ColumnBreakdown();
        columnBreakdown.initialize();

        const levelOneSector = new ColumnSector();
        breakdown = new Breakdown();
        breakdown.addChild(levelOneSector);
        multiManagerData = new MultiManagerBreakdownModel();
        multiManagerData.decompositionMode = 'mode1';

        columnBreakdown.breakdown = breakdown;
    });

    /**
     *
     */
    it('get configType', function () {
        expect(columnBreakdown.configType).toStrictEqual(ColumnBreakdown.CONFIG_TYPE);
    });

    /**
     *
     */
    it('doAddRequestParams', function () {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const addRequestParamsOnBreakdownSpy = jest.spyOn<any, any>(breakdown, 'addRequestParams');
        const setIncludeNoneBucketSpy = jest.spyOn<any, any>(Breakdown, 'setIncludeNoneBucket');

        // Add request params
        const requestParams = {};
        columnBreakdown.addRequestParams(requestParams);

        // Validate
        const columnBreakdownInRequest = requestParams['columnBreakdown'];
        expect(columnBreakdownInRequest).toBeDefined();
        expect(columnBreakdownInRequest['breakdownTree']).toBeDefined();
        expect((columnBreakdownInRequest['breakdownTree'] as string).includes('"useNoneBuckets":true')).toEqual(true);

        validateInitialisedValues(columnBreakdownInRequest, false, undefined);

        expect(addRequestParamsOnBreakdownSpy).toHaveBeenCalledTimes(1);
        expect(setIncludeNoneBucketSpy).toHaveBeenCalledTimes(1);
    });

    it('addRequestParams - portfolio-specific breakdown', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        columnBreakdown.breakdown.presetBreakdownId = 'iaa_breakdown';
        columnBreakdown.breakdown.title = 'IAA Breakdown';

        const requestParams = {};
        columnBreakdown.addRequestParams(requestParams);

        const columnBreakdownInRequest = requestParams['columnBreakdown'];
        expect(columnBreakdownInRequest).toBeDefined();
        expect(columnBreakdownInRequest['breakdownTree']).toBeDefined();
        expect(columnBreakdownInRequest['breakdownTree']).toContain('\"presetBreakdownId\":\"iaa_breakdown\"');
    });

    it('addRequestParams - mandate default breakdown', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        columnBreakdown.breakdown.isMandateDefaultBreakdown = true;
        columnBreakdown.breakdown.title = 'Default Breakdown';

        const requestParams = {};
        columnBreakdown.addRequestParams(requestParams);

        const columnBreakdownInRequest = requestParams['columnBreakdown'];
        expect(columnBreakdownInRequest).toBeDefined();
        expect(columnBreakdownInRequest['breakdownTree']).toBeDefined();
        expect(columnBreakdownInRequest['breakdownTree']).toContain('\"isMandateDefaultBreakdown\":true');
    });

    it('addRequestParams - multi manager data', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        columnBreakdown.multiManagerData = multiManagerData;

        const requestParams = {};
        columnBreakdown.addRequestParams(requestParams);

        const columnBreakdownInRequest = requestParams['multiManagerData'];
        expect(columnBreakdownInRequest).toBeDefined();
        expect(columnBreakdownInRequest['decompositionMode']).toBeDefined();
        expect(columnBreakdownInRequest['decompositionMode']).toContain('mode1');
    });

    /**
     *
     */
    it('initialize', function () {
        columnBreakdown.breakdown = undefined;

        const columnBreakdownValues = [
            {label: 'hasSectorBreakdown', value: false},
            {label: 'hasFactorBreakdown', value: true}
        ];

        const defaultSettings: any = {};
        defaultSettings.columnOptionAttributes = [
            {key: 'columnBreakdown', values: columnBreakdownValues}
        ];

        // Run initialise
        columnBreakdown.initialize(defaultSettings);

        // Validate
        expect(columnBreakdown.breakdown).toBeDefined();
        validateInitialisedValues(columnBreakdown, true, true);
    });

    /**
     *
     */
    it('doSerialize', function () {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const serialiseOnBreakdownSpy = jest.spyOn<any, any>(breakdown, 'serialize');
        const serialiseOnMultiManagerSpy = jest.spyOn<any, any>(multiManagerData, 'serialize');
        columnBreakdown.multiManagerData = multiManagerData;
        // Run serialise
        let serialisedColumn = columnBreakdown.doSerialize();

        // Validate
        expect(serialiseOnBreakdownSpy).toHaveBeenCalledTimes(1);
        expect(serialiseOnMultiManagerSpy).toHaveBeenCalledTimes(1);
        validateInitialisedValues(serialisedColumn, false, undefined);
        expect(serialisedColumn.multiManagerData).toBeDefined();


        // Check it returns undefined if invalid
        columnBreakdown.breakdown = undefined;
        columnBreakdown.multiManagerData = null;
        serialisedColumn = columnBreakdown.doSerialize();
        expect(serialisedColumn).toBeUndefined();
    });

    /**
     *
     */
    it('deserialize', function () {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        columnBreakdown.isFactorBreakdown = true;
        const serialisedColumn = columnBreakdown.doSerialize();

        const deserialisedColummn = new ColumnBreakdown();
        deserialisedColummn.deserialize(serialisedColumn);

        // Validate
        expect(deserialisedColummn.breakdown).toBeDefined();
        validateInitialisedValues(deserialisedColummn, true, true);
    });

    /**
     *
     */
    it('equals', function () {
        const otherColumnBreakdown = new ColumnBreakdown();
        otherColumnBreakdown.initialize();

        // Equal
        otherColumnBreakdown.breakdown = columnBreakdown.breakdown;
        expect(columnBreakdown.equals(otherColumnBreakdown)).toStrictEqual(true);

        // Not equal
        otherColumnBreakdown.breakdown = undefined;
        expect(columnBreakdown.equals(otherColumnBreakdown)).toStrictEqual(false);

        // Not equals undefined
        expect(columnBreakdown.equals(undefined)).toStrictEqual(false);
    });

    /**
     *
     */
    it('isValid', function () {
        // Valid
        expect(columnBreakdown.isValid()).toStrictEqual(true);

        // Invalid
        columnBreakdown.breakdown = undefined;
        expect(columnBreakdown.isValid()).toStrictEqual(false);

        columnBreakdown.breakdown = new Breakdown();
        expect(columnBreakdown.isValid()).toStrictEqual(false);
    });

    /**
     * Validates values in the given column breakdown. All are to be set to their default values except for the
     * "isFactorBreakdown" which is to be set to the given expectedIsFactorBreakdown.
     */
    function validateInitialisedValues(columnBreakdownToValidate: any, expectedIsFactorBreakdown: boolean, expectedBreakdownHideWithNoValues: boolean) {
        expect(columnBreakdownToValidate.breakdownLevel).toStrictEqual(1);
        expect(columnBreakdownToValidate.portfolioGroupLevel).toStrictEqual(1);
        expect(columnBreakdownToValidate.breakdownHideTotal).toStrictEqual(false);
        expect(columnBreakdownToValidate.breakdownHideOther).toStrictEqual(false);
        expect(columnBreakdownToValidate.breakdownHideWithNoValues).toStrictEqual(expectedBreakdownHideWithNoValues);
        expect(columnBreakdownToValidate.isFullPortfolioName).toStrictEqual(false);
        expect(columnBreakdownToValidate.isColumnBreakdownNormalize).toStrictEqual(false);
        expect(columnBreakdownToValidate.isGroupByPortBenchActive).toStrictEqual(false);
        expect(columnBreakdownToValidate.isFactorBreakdown).toStrictEqual(expectedIsFactorBreakdown);

    }

    /**
     *
     */
    it('addRequestParamsWithFavId - displayEmptyColumn selected', function () {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        ColumnOptionFactory.registerOptionType(ColumnBreakdown.CONFIG_TYPE, ColumnBreakdown);
        columnBreakdown = new ColumnBreakdown();
        columnBreakdown.initialize();
        // set to false
        columnBreakdown.breakdownHideWithNoValues = false;

        const levelOneSector = new ColumnSector();
        breakdown = new Breakdown();
        breakdown.addChild(levelOneSector);
        columnBreakdown.breakdown = breakdown;

        // Add request params
        const requestParams = {};
        columnBreakdown.addRequestParamsWithFavId(requestParams);

        // Validate
        const columnBreakdownInRequest = requestParams['columnBreakdown'];
        expect(columnBreakdownInRequest).toBeDefined();
        expect(columnBreakdownInRequest['breakdownTree']).toBeDefined();
        expect(columnBreakdownInRequest.breakdownHideWithNoValues).toStrictEqual(false);
    });

    it('addRequestParamsWithFavId - with Favorite', function () {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        ColumnOptionFactory.registerOptionType(ColumnBreakdown.CONFIG_TYPE, ColumnBreakdown);
        columnBreakdown = new ColumnBreakdown();
        columnBreakdown.initialize();
        columnBreakdown.breakdown.id = 1234;
        columnBreakdown.breakdownHideWithNoValues = true;

        // Add request params
        const requestParams = {};
        columnBreakdown.addRequestParamsWithFavId(requestParams);

        // Validate
        const columnBreakdownInRequest = requestParams['columnBreakdown'];
        expect(columnBreakdownInRequest).toBeDefined();
        expect(columnBreakdownInRequest['id']).toStrictEqual(1234);
        expect(columnBreakdownInRequest.breakdownHideWithNoValues).toStrictEqual(true);
    });

    /**
     *
     */
    it('addRequestParamsWithFavId - displayEmptyColumn deselected', function () {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        ColumnOptionFactory.registerOptionType(ColumnBreakdown.CONFIG_TYPE, ColumnBreakdown);
        columnBreakdown = new ColumnBreakdown();
        columnBreakdown.initialize();
        // set to false
        columnBreakdown.breakdownHideWithNoValues = true;

        const levelOneSector = new ColumnSector();
        breakdown = new Breakdown();
        breakdown.addChild(levelOneSector);
        columnBreakdown.breakdown = breakdown;

        // Add request params
        const requestParams = {};
        columnBreakdown.addRequestParamsWithFavId(requestParams);

        // Validate
        const columnBreakdownInRequest = requestParams['columnBreakdown'];
        expect(columnBreakdownInRequest).toBeDefined();
        expect(columnBreakdownInRequest['breakdownTree']).toBeDefined();
        expect(columnBreakdownInRequest.breakdownHideWithNoValues).toStrictEqual(true);
    });

});

