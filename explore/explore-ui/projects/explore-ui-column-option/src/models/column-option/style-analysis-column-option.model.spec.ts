import {StyleAnalysisColumnOption} from './style-analysis-column-option.model';
import {BookColumnOption} from './book-column-option.model';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';

describe('Style analysis column options model test', () => {
    let styleAnalysisColumnOptionModel: StyleAnalysisColumnOption;

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        styleAnalysisColumnOptionModel = new StyleAnalysisColumnOption({
            measures: {
                a: {
                    columnTag: 'market_val',
                    columnKey: 'market_val_0',
                    positionColumnType: 'PORT',
                    optionValues: []
                },
                b: {
                    columnTag: 'market_val',
                    columnKey: 'market_val_1',
                    positionColumnType: 'BENCH',
                    optionValues: []
                }
            },
            adjustActiveExposure: true,
            showMeasures: true,
            styleMeasureMapping: {
                a: {
                    min: 0,
                    max: 10,
                    weight: 25,
                    isNormal: true
                },
                b: {
                    min: 10,
                    max: 20,
                    weight: 30,
                    isNormal: false
                }
            }
        });
    });

    it('Serialize/Deserialize test', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        styleAnalysisColumnOptionModel.measureMapping['a'].columnKey = 'aaa';
        styleAnalysisColumnOptionModel.measureMapping['b'].columnKey = 'bbb';
        const serializedStyleAnalysis = styleAnalysisColumnOptionModel.serialize();
        // should not include measure columnKeys in serialization
        expect(JSON.stringify(serializedStyleAnalysis).includes('aaa')).toEqual(false);
        expect(JSON.stringify(serializedStyleAnalysis).includes('bbb')).toEqual(false);
        expect(JSON.stringify(serializedStyleAnalysis).includes('adjustActiveExposure')).toEqual(true);


        const styleAnalysisModel = new StyleAnalysisColumnOption(serializedStyleAnalysis);

        // should include randomly generated measure columnKeys when deserialized
        expect(styleAnalysisModel.measureMapping['a'].columnKey).toBeDefined();
        expect(styleAnalysisModel.measureMapping['b'].columnKey).toBeDefined();
        expect(styleAnalysisModel.styleMeasureMapping['a'].min).toBe(0);
        expect(styleAnalysisModel.styleMeasureMapping['a'].max).toBe(10);
        expect(styleAnalysisModel.styleMeasureMapping['a'].weight).toBe(25);
        expect(styleAnalysisModel.styleMeasureMapping['a'].isNormal).toBeTruthy();
        expect(styleAnalysisModel.styleMeasureMapping['b'].min).toBe(10);
        expect(styleAnalysisModel.styleMeasureMapping['b'].max).toBe(20);
        expect(styleAnalysisModel.styleMeasureMapping['b'].weight).toBe(30);
        expect(styleAnalysisModel.styleMeasureMapping['b'].isNormal).toBeFalsy();
        expect(styleAnalysisModel.adjustActiveExposure).toBeTruthy();

        expect(styleAnalysisModel.isValid()).toBeTruthy();
    });

    it('tests addRequestParams', () => {
        const requestParams: any = {};
        styleAnalysisColumnOptionModel.addRequestParams(requestParams);
        expect(requestParams['styleAnalysis']).toBeDefined();
        expect(Object.values(requestParams['styleAnalysis']['aliasDependencyMap']).length).toEqual(2);
        expect(Object.values(requestParams['styleAnalysis']['styleMeasureMetaData']).length).toEqual(2);
        expect(Object.values(requestParams['styleAnalysis']['showMeasures'])).toBeTruthy();
        expect(Object.values(requestParams['styleAnalysis']['adjustActiveExposure'])).toBeTruthy();
    });

    it('tests equals', () => {
        expect(styleAnalysisColumnOptionModel.equals(null)).toBeFalsy();
        expect(styleAnalysisColumnOptionModel.equals(new BookColumnOption())).toBeFalsy();
        expect(styleAnalysisColumnOptionModel.equals(new StyleAnalysisColumnOption())).toBeFalsy();
        expect(styleAnalysisColumnOptionModel.equals(new StyleAnalysisColumnOption({showMeasures: true}))).toBeFalsy();
        let styleAnalysisColumnOptionModelCopy = new StyleAnalysisColumnOption({
            measures: {
                a: {
                    columnTag: 'market_val',
                    columnKey: 'market_val_0',
                    positionColumnType: 'PORT',
                    optionValues: []
                },
                b: {
                    columnTag: 'market_val',
                    columnKey: 'market_val_1',
                    positionColumnType: 'BENCH',
                    optionValues: []
                }
            },
            showMeasures: true,
            styleMeasureMapping: {
                a: {
                    min: 0,
                    max: 10,
                    weight: 25,
                    isNormal: true
                }
            }
        });
        expect(styleAnalysisColumnOptionModel.equals(styleAnalysisColumnOptionModelCopy)).toBeFalsy();

        styleAnalysisColumnOptionModelCopy = new StyleAnalysisColumnOption({
            measures: {
                a: {
                    columnTag: 'market_val',
                    columnKey: 'market_val_0',
                    positionColumnType: 'PORT',
                    optionValues: []
                },
                b: {
                    columnTag: 'market_val',
                    columnKey: 'market_val_1',
                    positionColumnType: 'BENCH',
                    optionValues: []
                }
            },
            showMeasures: true,
            adjustActiveExposure: true,
            styleMeasureMapping: {
                a: {
                    min: 0,
                    max: 10,
                    weight: 25,
                    isNormal: true
                },
                b: {
                    min: 10,
                    max: 20,
                    weight: 30,
                    isNormal: false
                }
            }
        });
        styleAnalysisColumnOptionModelCopy.measureMapping['a'].columnKey = undefined;
        styleAnalysisColumnOptionModelCopy.measureMapping['b'].columnKey = undefined;
        styleAnalysisColumnOptionModel.measureMapping['a'].columnKey = undefined;
        styleAnalysisColumnOptionModel.measureMapping['b'].columnKey = undefined;
        expect(styleAnalysisColumnOptionModel.equals(styleAnalysisColumnOptionModelCopy)).toBeTruthy();
    });

    it('Test alias name more than 26  ', () => {
        const  columnOption = new StyleAnalysisColumnOption();
        expect(columnOption.getMeasureAlias(0)).toBe('a');
        expect(columnOption.getMeasureAlias(26)).toBe('aa');
        expect(columnOption.getMeasureAlias(52)).toBe('ba');
    });
});
