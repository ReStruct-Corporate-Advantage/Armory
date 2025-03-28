import {PortfolioHoldingChange} from './portfolio-holding-change.model';
import {NewPortfolioHoldingChange} from './new-portfolio-holding-change.model';
import {PortfolioSecurityHoldingChange} from './portfolio-security-holding-change.model';
import {NewSecurityHoldingChange} from './new-security-holding-change.model';
import {CompositionSetting} from '@models/portfolio/composition/composition-setting.model';

describe('Test holding changes', () => {

    // Create test holding change objects
    const testSecurityChange = new PortfolioSecurityHoldingChange();
    testSecurityChange.lineItem = '22533WAA7';
    testSecurityChange.isNavNeutral = true;
    testSecurityChange.isCashOffsetRequired = true;

    testSecurityChange.newMarketValue = 10000.234;
    testSecurityChange.newNotionalMarketValue = 10000.234;
    testSecurityChange.newQuantity = 10000.234;
    testSecurityChange.newParValue = 11000.234;
    testSecurityChange.newCurrentFace = 98567.45;
    testSecurityChange.newDeltaAdjNotional = 10000.234;
    testSecurityChange.newWeight = 12.34;

    testSecurityChange.changeInMarketValue = 2345.45;
    testSecurityChange.changeInNotionalMarketValue = 2345.45;
    testSecurityChange.changeInQuantity = 2345.45;
    testSecurityChange.changeInParValue = 2345.45;
    testSecurityChange.changeInCurrentFace = 3345.45;
    testSecurityChange.changeInDeltaAdjNotional = 2345.45;
    testSecurityChange.changeInWeight = 5.45;

    const testNewSecurityChange = new NewSecurityHoldingChange();
    testNewSecurityChange.lineItem = '22533WAA7';
    testNewSecurityChange.isNavNeutral = true;
    testNewSecurityChange.addedDuringWhatIfInitialization = true;
    testNewSecurityChange.isCashOffsetRequired = true;

    testNewSecurityChange.newMarketValue = 10000.234;
    testNewSecurityChange.newNotionalMarketValue = 10000.234;
    testNewSecurityChange.newQuantity = 10000.234;
    testNewSecurityChange.newParValue = 11000.234;
    testNewSecurityChange.newCurrentFace = 98567.45;
    testNewSecurityChange.newDeltaAdjNotional = 10000.234;
    testNewSecurityChange.newWeight = 12.34;

    testNewSecurityChange.changeInMarketValue = 2345.45;
    testNewSecurityChange.changeInNotionalMarketValue = 2345.45;
    testNewSecurityChange.changeInQuantity = 2345.45;
    testNewSecurityChange.changeInParValue = 2345.45;
    testNewSecurityChange.changeInCurrentFace = 3345.45;
    testNewSecurityChange.changeInDeltaAdjNotional = 2345.45;
    testNewSecurityChange.changeInWeight = 5.45;
    testNewSecurityChange.analyticsId = '12345678891';
    testNewSecurityChange.isValid = true;


    const testPortfolioHoldingChange = new PortfolioHoldingChange();
    testPortfolioHoldingChange.lineItem = 'IP';
    testPortfolioHoldingChange.newWeight = 7.34;
    testPortfolioHoldingChange.changeInWeight = 3.4;
    testPortfolioHoldingChange.childPortfolioName = 'IP';
    testPortfolioHoldingChange.isCashOffsetRequired = true;

    const testNewPortfolioHoldingChange = new NewPortfolioHoldingChange();
    testNewPortfolioHoldingChange.lineItem = 'PEP';
    testNewPortfolioHoldingChange.newWeight = 4.01;
    testNewPortfolioHoldingChange.changeInWeight = 1.5;
    testNewPortfolioHoldingChange.childPortfolioName = 'PEP';
    testNewPortfolioHoldingChange.isCashOffsetRequired = true;

    // Create test serialized objects
    const testSerializedHoldingChange = {
        isCashOffsetRequired: true,
        lineItem: '22533WAA7',
        isNavNeutral: true,
        changeInWeight: 5.45,
        newWeight: 12.34,
        changeType: 'Security',
        newMV: 10000.234,
        newNotional: 10000.234,
        newQuantity: 10000.234,
        newParValue: 11000.234,
        newCurrentFace: 98567.45,
        newDeltaAdjNMV: 10000.234,
        changeInMarketValue: 2345.45,
        changeInNotional: 2345.45,
        changeInQuantity: 2345.45,
        changeInParValue: 2345.45,
        changeInCurrentFace: 3345.45,
        changeInDeltaAdjNMV: 2345.45
    };

    const testSerializedNewSecurityHoldingChange = {
        isCashOffsetRequired: true,
        lineItem: '22533WAA7',
        isNavNeutral: true,
        changeInWeight: 5.45,
        addedDuringWhatIfInitialization: true,
        newWeight: 12.34,
        changeType: 'NewSecurity',
        analyticsId: '12345678891',
        newMV: 10000.234,
        newNotional: 10000.234,
        newQuantity: 10000.234,
        newParValue: 11000.234,
        newCurrentFace: 98567.45,
        newDeltaAdjNMV: 10000.234,
        changeInMarketValue: 2345.45,
        changeInNotional: 2345.45,
        changeInQuantity: 2345.45,
        changeInParValue: 2345.45,
        changeInCurrentFace: 3345.45,
        changeInDeltaAdjNMV: 2345.45
    };

    const testSerializedPortChange = {
        isCashOffsetRequired: true,
        lineItem: 'IP',
        changeInWeight: 3.4,
        newWeight: 7.34,
        changeType: 'Portfolio',
        childPortfolioName: 'IP'
    };

    const testSerializedNewPortChange = {
        isCashOffsetRequired: true,
        lineItem: 'PEP',
        changeInWeight: 1.5,
        newWeight: 4.01,
        changeType: 'NewPortfolio',
        childPortfolioName: 'PEP'
    };

    describe('Test serialization', () => {

        it('Portfolio Security Holding Change', () => {
            expect(testSerializedHoldingChange).toEqual(testSecurityChange.serialize());
        });

        it('New Security Holding Change', () => {
            expect(testSerializedNewSecurityHoldingChange).toEqual(testNewSecurityChange.serialize());
        });

        it('Portfolio Holding Change', () => {
            expect(testSerializedPortChange).toEqual(testPortfolioHoldingChange.serialize());
        });

        it('New Portfolio Holding Change', () => {
            expect(testSerializedNewPortChange).toEqual(testNewPortfolioHoldingChange.serialize());
        });
    });

    describe('Test deserialization', () => {

        it('Portfolio Security Holding Change', () => {
            expect(testSecurityChange.isEqual(new PortfolioSecurityHoldingChange(testSerializedHoldingChange))).toBeTruthy();
        });

        it('New Security Holding Change', function () {
            expect(testNewSecurityChange.isEqual(new NewSecurityHoldingChange(testSerializedNewSecurityHoldingChange))).toBeTruthy();
        });

        it('Portfolio Holding Change', () => {
            expect(testPortfolioHoldingChange.isEqual(new PortfolioHoldingChange(testSerializedPortChange))).toBeTruthy();
        });

        it('New Portfolio Holding Change', () => {
            expect(testNewPortfolioHoldingChange.isEqual(new NewPortfolioHoldingChange(testSerializedNewPortChange))).toBeTruthy();
        });
    });

    describe('Test isEquals', () => {

        it('when objects are not instances of same type', () => {
            expect(testSecurityChange.isEqual(new CompositionSetting())).toBeFalsy();
        });

        it('Portfolio Security Holding Change with different isCashOffsetRequired values', () => {
            const portfolioSecurityHoldingChange = new PortfolioSecurityHoldingChange(testSerializedHoldingChange);
            portfolioSecurityHoldingChange.isCashOffsetRequired = false;
            expect(testSecurityChange.isEqual(portfolioSecurityHoldingChange)).toBeFalsy();
        });

        it('Portfolio Security Holding Change with different lineitem values', () => {
            const portfolioSecurityHoldingChange = new PortfolioSecurityHoldingChange(testSerializedHoldingChange);
            portfolioSecurityHoldingChange.lineItem = 'asdf';
            expect(testSecurityChange.isEqual(portfolioSecurityHoldingChange)).toBeFalsy();
        });

        it('Portfolio Security Holding Change with different changeInWeight values', () => {
            const portfolioSecurityHoldingChange = new PortfolioSecurityHoldingChange(testSerializedHoldingChange);
            portfolioSecurityHoldingChange.changeInWeight = 0.234;
            expect(testSecurityChange.isEqual(portfolioSecurityHoldingChange)).toBeFalsy();
        });
    });
});
