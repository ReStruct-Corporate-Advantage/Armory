import {AdvancedRiskSettings} from './advanced-risk-settings.model';
import {CoreRiskConstants} from '../../core-risk.constants';
import {FilterScaling, FilterScalingUtil} from '../../enums/filter-scaling.enum';
import {DefaultRiskSettings} from '../default-risk-settings/default-risk-settings.model';

describe('AdvancedRiskSettings', () => {
    /**
     * Test case for AdvancedRiskSettings initializing correctly
     */
    it('Test if AdvancedRiskSettings initializes correctly ', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(new AdvancedRiskSettings(), CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // THEN
        expect(advancedRiskSettings.parentRiskSettings).toBeDefined();
        expect(advancedRiskSettings.name).toBeDefined();
        expect(advancedRiskSettings.name).toEqual(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
    });

    /**
     * Test case for exclude Block Getter from Parent
     */
    it('Test  exclude Block Getter from Parent', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.excludeBlock = 'FX';

        // THEN
        expect(advancedRiskSettings.excludeBlock).toEqual(parentRiskSettings.excludeBlock);
    });

    /**
     * Test case for exclude Block Getter from SELF
     */
    it('Test  exclude Block Getter from SELF', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.excludeBlock = 'FX';
        advancedRiskSettings.excludeBlock = 'Not_FX';

        // THEN
        expect(advancedRiskSettings.excludeBlock).toEqual('Not_FX');
    });

    /**
     * Test case for exclude Block Setting when value is same as parent
     */
    it('Test case for exclude Block Setting when value is same as parent', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.excludeBlock = 'FX';
        advancedRiskSettings.excludeBlock = 'FX';

        // THEN
        expect(advancedRiskSettings.doesValueExist('excludeBlock')).toEqual(false);
    });

    /**
     * Test case for exclude Block Setting when value is not same as parent
     */
    it('Test case for exclude Block Setting when value is not same as parent ', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.excludeBlock = 'FX';
        advancedRiskSettings.excludeBlock = 'My_Own_Value';

        // THEN
        expect(advancedRiskSettings.excludeBlock).toEqual('My_Own_Value');
    });

    /**
     * Test deserialize
     */
    it('Test deserialize', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        const data: any = {excludeBlock: 'FX', market: 'SNP500'};

        // WHEN
        advancedRiskSettings.deserialize(data);

        // THEN
        expect(advancedRiskSettings.excludeBlock).toEqual('FX');
        expect(advancedRiskSettings.market).toEqual('SNP500');
    });

    /**
     * Test serialize
     */
    it('Test serialize', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        advancedRiskSettings.excludeBlock = 'FX';
        advancedRiskSettings.market = 'SNP500';

        // WHEN
        const expected = advancedRiskSettings.serialize();

        // THEN
        expect(expected.excludeBlock).toEqual('FX');
        expect(expected.market).toEqual('SNP500');
    });

    /**
     * Test resetSettings
     */
    it('Test resetSettings', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        advancedRiskSettings.excludeBlock = 'FX';

        // WHEN
        advancedRiskSettings.resetSettings();

        // THEN
        expect(advancedRiskSettings.excludeBlock).toBeFalsy();
    });

    /**
     * Test addRequestData When
     */
    it('Test addRequestData 1', function () {

        // GIVEN
        const defaultRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const parentRiskSettings = new AdvancedRiskSettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        defaultRiskSettings.excludeBlock = 'FX';
        defaultRiskSettings.market = 'SNP100';

        // WHEN
        const expected: any = {};
        advancedRiskSettings.addRequestData(expected, advancedRiskSettings);

        // THEN
        expect(expected).toEqual({});
    });

    /**
     * Test addRequestData When
     */
    it('Test addRequestData 2', function () {

        // GIVEN
        const defaultRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const parentRiskSettings = new AdvancedRiskSettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        defaultRiskSettings.excludeBlock = 'FX';
        advancedRiskSettings.excludeBlock = 'My_FX';
        defaultRiskSettings.market = 'SNP100';
        advancedRiskSettings.market = 'My_SNP100';
        // WHEN
        const expected: any = {};
        advancedRiskSettings.addRequestData(expected, advancedRiskSettings.parentRiskSettings as AdvancedRiskSettings);

        // THEN
        expect(expected).toEqual({ExcludeBlock: 'My_FX', market: 'My_SNP100'});
    });


    /**
     * Test addRequestData For Columns
     */
    it('Test addRequestData For Columns', function () {

        // GIVEN
        const defaultRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const parentRiskSettings = new AdvancedRiskSettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const widgetAdvancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        const advancedRiskSettings = new AdvancedRiskSettings(widgetAdvancedRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);

        defaultRiskSettings.excludeBlock = 'FX';
        widgetAdvancedRiskSettings.excludeBlock = 'My_FX';
        defaultRiskSettings.market = 'SNP100';
        widgetAdvancedRiskSettings.market = 'My_SNP100';
        // WHEN
        const expected: any = {};
        advancedRiskSettings.addRequestData(expected, advancedRiskSettings.parentRiskSettings as AdvancedRiskSettings);

        // THEN
        expect(expected).toEqual({});
    });

    /**
     * Test doesValueExist
     */
    it('Test doesValueExist when it does', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        advancedRiskSettings.excludeBlock = 'FX';

        // THEN
        expect(advancedRiskSettings.doesValueExist('excludeBlock')).toEqual(true);
    });

    /**
     * Test doesValueExist When
     */
    it('Test doesValueExist when it doesnt ', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        advancedRiskSettings.excludeBlock = undefined;

        // THEN
        expect(advancedRiskSettings.doesValueExist('excludeBlock')).toEqual(false);
    });

    /**
     * Test case for market Getter from Parent
     */
    it('Test  market Getter from Parent', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.market = 'SNP100';

        // THEN
        expect(advancedRiskSettings.market).toEqual(parentRiskSettings.market);
    });

    /**
     * Test case for market Getter from SELF
     */
    it('Test  market Getter from SELF', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.market = 'SNP100';
        advancedRiskSettings.market = 'Not_SNP100';

        // THEN
        expect(advancedRiskSettings.market).toEqual('Not_SNP100');
    });

    /**
     * Test case for filterScaling Getter from Parent
     */
    it('Test  filterScaling Getter from Parent', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.filterScaling = FilterScaling.PORTFOLIO_NAV;

        // THEN
        expect(advancedRiskSettings.filterScaling).toEqual(parentRiskSettings.filterScaling);
    });

    it('Test  filterScaling serialize and deserialize', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        // WHEN
        advancedRiskSettings.filterScaling = FilterScaling.PORTFOLIO_NAV;

        const serialize: any = advancedRiskSettings.serialize();
        const advancedRiskSettingsNew = new AdvancedRiskSettings();
        advancedRiskSettingsNew.deserialize(serialize);

        // THEN
        expect(advancedRiskSettingsNew.filterScaling).toEqual(advancedRiskSettings.filterScaling);
    });

    it('Test  filterScaling addRequestData', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        // WHEN
        advancedRiskSettings.filterScaling = FilterScaling.PORTFOLIO_NAV;

        const requestData: any = {};
        advancedRiskSettings.addRequestData(requestData, new AdvancedRiskSettings());

        // THEN
        expect(requestData).toEqual({filterScaling: 'PORTFOLIO_NAV'});
    });

    /**
     * Test case for assetClassCovariance Getter from Parent
     */
    it('Test  assetClassCovariance Getter from Parent', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.assetClassCovariance = 'abc';

        // THEN
        expect(advancedRiskSettings.assetClassCovariance).toEqual(parentRiskSettings.assetClassCovariance);
    });

    /**
     * Test case for assetClassCovariance Getter from Self
     */
    it('Test  assetClassCovariance Getter from SELF', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.assetClassCovariance = 'abc';
        advancedRiskSettings.assetClassCovariance = 'test';

        // THEN
        expect(advancedRiskSettings.assetClassCovariance).toEqual('test');
    });

    it('Test  assetClassCovariance serialize and deserialize', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        // WHEN
        advancedRiskSettings.assetClassCovariance = 'abc';

        const serialize: any = advancedRiskSettings.serialize();
        const advancedRiskSettingsNew = new AdvancedRiskSettings();
        advancedRiskSettingsNew.deserialize(serialize);

        // THEN
        expect(advancedRiskSettingsNew.assetClassCovariance).toEqual(advancedRiskSettings.assetClassCovariance);
    });

    it('Test  assetClassCovariance addRequestData', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        // WHEN
        advancedRiskSettings.assetClassCovariance = 'abc';

        const requestData: any = {};
        advancedRiskSettings.addRequestData(requestData, new AdvancedRiskSettings());

        // THEN
        expect(requestData).toEqual({ AssetClassCovariance: 'abc'});
    });

    /**
     * Test case for dxsBlock Getter from Parent
     */
    it('Test  dxsBlock Getter from Parent', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.dxsBlock = 'abc';

        // THEN
        expect(advancedRiskSettings.dxsBlock).toEqual(parentRiskSettings.dxsBlock);
    });

    /**
     * Test case for dxsBlock Getter from Self
     */
    it('Test  dxsBlock Getter from SELF', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.dxsBlock = 'abc';
        advancedRiskSettings.dxsBlock = 'test';

        // THEN
        expect(advancedRiskSettings.dxsBlock).toEqual('test');
    });

    it('Test  dxsBlock serialize and deserialize', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        // WHEN
        advancedRiskSettings.dxsBlock = 'abc';

        const serialize: any = advancedRiskSettings.serialize();
        const advancedRiskSettingsNew = new AdvancedRiskSettings();
        advancedRiskSettingsNew.deserialize(serialize);

        // THEN
        expect(advancedRiskSettingsNew.dxsBlock).toEqual(advancedRiskSettings.dxsBlock);
    });

    it('Test  dxsBlock addRequestData', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        // WHEN
        advancedRiskSettings.dxsBlock = 'abc';

        const requestData: any = {};
        advancedRiskSettings.addRequestData(requestData, new AdvancedRiskSettings());

        // THEN
        expect(requestData).toEqual({ DxsBlock: 'abc'});
    });

    it('Test setOrgDefaultAdvancedRiskSettings', function () {
        const defaultRiskSettings = new DefaultRiskSettings({});
        defaultRiskSettings.assetClassCovariance = 'abc';
        defaultRiskSettings.dxsBlock = 'test';


        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        advancedRiskSettings.setOrgDefaultAdvancedRiskSettings(defaultRiskSettings);

        expect(advancedRiskSettings.assetClassCovariance).toEqual('abc');
        expect(advancedRiskSettings.dxsBlock).toEqual('test');
        expect(advancedRiskSettings.filterScaling === FilterScaling.PORTFOLIO_NAV).toBeTruthy();
    });

    it('Test setPortDefaultAdvancedRiskSettings', function () {
        const defaultRiskSettings = new DefaultRiskSettings({});
        defaultRiskSettings.assetClassCovariance = 'abc';
        defaultRiskSettings.dxsBlock = 'test';


        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        advancedRiskSettings.setPortDefaultAdvancedRiskSettings(defaultRiskSettings);

        expect(advancedRiskSettings.assetClassCovariance).toEqual('abc');
        expect(advancedRiskSettings.dxsBlock).toEqual('test');
        expect(advancedRiskSettings.filterScaling === FilterScaling.PORTFOLIO_NAV).toBeTruthy();
    });

    /**
     * Test case for scaleDxsExposures Getter from Parent
     */
    it('Test scaleDxsExposures Getter from Parent', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.scaleDxsExposures = true;

        // THEN
        expect(advancedRiskSettings.scaleDxsExposures).toEqual(parentRiskSettings.scaleDxsExposures);
    });

    /**
     * Test case for scaleDxsExposures Getter from Self
     */
    it('Test scaleDxsExposures Getter from SELF', function () {

        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        parentRiskSettings.scaleDxsExposures = true;
        advancedRiskSettings.scaleDxsExposures = false;

        // THEN
        expect(advancedRiskSettings.scaleDxsExposures).toEqual(false);
    });

    it('Test scaleDxsExposures serialize and deserialize', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        // WHEN
        advancedRiskSettings.scaleDxsExposures = true;

        const serialize: any = advancedRiskSettings.serialize();
        const advancedRiskSettingsNew = new AdvancedRiskSettings();
        advancedRiskSettingsNew.deserialize(serialize);

        // THEN
        expect(advancedRiskSettingsNew.scaleDxsExposures).toEqual(advancedRiskSettings.scaleDxsExposures);
    });

    it('Test scaleDxsExposures addRequestData', function () {

        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        // WHEN
        advancedRiskSettings.scaleDxsExposures = true;

        const requestData: any = {};
        advancedRiskSettings.addRequestData(requestData, new AdvancedRiskSettings());

        // THEN
        expect(requestData).toEqual({ ScaleDxsExposures: true});
    });

    it('Test setOrgDefaultAdvancedRiskSettings', function () {
        const defaultRiskSettings = new DefaultRiskSettings({});
        defaultRiskSettings.scaleDxsExposures = true;

        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        advancedRiskSettings.setOrgDefaultAdvancedRiskSettings(defaultRiskSettings);

        expect(advancedRiskSettings.scaleDxsExposures).toEqual(true);
    });


    /**
     * Test case for assumeZeroAverageReturn Getter from Parent
     */
    it('Test assumeZeroAverageReturn Getter from Parent', function () {
        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        // WHEN
        parentRiskSettings.assumeZeroAverageReturn = true;
        // THEN
        expect(advancedRiskSettings.assumeZeroAverageReturn).toEqual(parentRiskSettings.assumeZeroAverageReturn);
    });

    /**
     * Test case for assumeZeroAverageReturn Getter from SELF
     */
    it('Test assumeZeroAverageReturn Getter from SELF', function () {
        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        // WHEN
        parentRiskSettings.assumeZeroAverageReturn = true;
        advancedRiskSettings.assumeZeroAverageReturn = false;
        // THEN
        expect(advancedRiskSettings.assumeZeroAverageReturn).toEqual(false);
    });

    it('Test assumeZeroAverageReturn serialize', function () {
        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        // WHEN
        advancedRiskSettings.assumeZeroAverageReturn = true;
        const serialize: any = advancedRiskSettings.serialize();
        // THEN
        expect(advancedRiskSettings.assumeZeroAverageReturn).toEqual(serialize.assumeZeroAverageReturn);
    });

    it('Test assumeZeroAverageReturn deserialize', function () {
        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const data: any = {assumeZeroAverageReturn: true};
        // WHEN
        advancedRiskSettings.deserialize(data);
        // THEN
        expect(advancedRiskSettings.assumeZeroAverageReturn).toEqual(true);
    });

    it('Test assumeZeroAverageReturn addRequestData', function () {
        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        // WHEN
        advancedRiskSettings.assumeZeroAverageReturn = true;
        const requestData: any = {};
        advancedRiskSettings.addRequestData(requestData, new AdvancedRiskSettings());
        // THEN
        expect(requestData).toEqual({AssumeZeroAverageReturn: true});
    });
    /**
     * Test case for exposureLookback Getter from Parent
     */
    it('Test exposureLookback Getter from Parent', function () {
        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        // WHEN
        parentRiskSettings.exposureLookback = 18;
        // THEN
        expect(advancedRiskSettings.exposureLookback).toEqual(parentRiskSettings.exposureLookback);
    });

    /**
     * Test case for exposureLookback Getter from SELF
     */
    it('Test exposureLookback Getter from SELF', function () {
        // GIVEN
        const parentRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        // WHEN
        parentRiskSettings.exposureLookback = 18;
        advancedRiskSettings.exposureLookback = 9;
        // THEN
        expect(advancedRiskSettings.exposureLookback).toEqual(9);
    });

    it('Test exposureLookback serialize', function () {
        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        // WHEN
        advancedRiskSettings.exposureLookback = 9;
        const serialize: any = advancedRiskSettings.serialize();
        // THEN
        expect(advancedRiskSettings.exposureLookback).toEqual(serialize.exposureLookback);
    });

    it('Test exposureLookback deserialize', function () {
        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const data: any = {exposureLookback: 9};
        // WHEN
        advancedRiskSettings.deserialize(data);
        // THEN
        expect(advancedRiskSettings.exposureLookback).toEqual(9);
    });

    it('Test exposureLookback addRequestData', function () {
        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        // WHEN
        advancedRiskSettings.exposureLookback = 9;
        const requestData: any = {};
        advancedRiskSettings.addRequestData(requestData, new AdvancedRiskSettings());
        // THEN
        expect(requestData).toEqual({exposureLookback: 9});
    });

    /**
     * Test case for riskMatrix Getter from SELF
     */
    it('Test riskMatrix Getter from SELF', function () {
        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        // WHEN
        advancedRiskSettings.riskMatrix = 11;
        // THEN
        expect(advancedRiskSettings.riskMatrix).toEqual(11);
    });

    it('Test riskMatrix serialize', function () {
        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        // WHEN
        advancedRiskSettings.riskMatrix = 11;
        const serialize: any = advancedRiskSettings.serialize();
        // THEN
        expect(advancedRiskSettings.riskMatrix).toEqual(serialize.riskMatrix);
    });

    it('Test riskMatrix deserialize', function () {
        // GIVEN
        const advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const data: any = {riskMatrix: 11};
        // WHEN
        advancedRiskSettings.deserialize(data);
        // THEN
        expect(advancedRiskSettings.riskMatrix).toEqual(11);
    });

    it('Formats parent value', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        parentAdvancedRiskSettings.excludeBlock = '';
        expect(advancedRiskSettings.getFormattedParentValue(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.EXCLUDE_BLOCK)).toEqual(CoreRiskConstants.NONE);
        parentAdvancedRiskSettings.excludeBlock = CoreRiskConstants.OTHER;
        expect(advancedRiskSettings.getFormattedParentValue(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.EXCLUDE_BLOCK)).toEqual(CoreRiskConstants.OTHER);

        parentAdvancedRiskSettings.market = 'JPN Market';
        expect(advancedRiskSettings.getFormattedParentValue(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.MARKET)).toEqual('JPN Market');

        parentAdvancedRiskSettings.filterScaling = FilterScaling.PORTFOLIO_NAV;
        expect(advancedRiskSettings.getFormattedParentValue(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.FILTER_SCALING)).toEqual(FilterScalingUtil.getDisplayName(FilterScaling.PORTFOLIO_NAV));

        parentAdvancedRiskSettings.dxsBlock = 'DXS_BLOCK';
        expect(advancedRiskSettings.getFormattedParentValue(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.DXS_BLOCK)).toEqual('DXS_BLOCK');

        parentAdvancedRiskSettings.assetClassCovariance = 'N';
        expect(advancedRiskSettings.getFormattedParentValue(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.ASSET_CLASS_COVARIANCE)).toEqual('Use pre-specified equity covariances with fixed income-equity covariances set to 0 and fixed income covariances calculated from the defined settings');

        parentAdvancedRiskSettings.exposureLookback = 3;
        expect(advancedRiskSettings.getFormattedParentValue(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.EXPOSURE_LOOKBACK)).toEqual('3');
    });
});
