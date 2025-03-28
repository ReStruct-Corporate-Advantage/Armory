import {PortfolioHoldingChange} from '../models/portfolio/composition/portfolio-holding-change.model';
import {HoldingChangeFactory} from './holding-change.factory';
import {PortfolioSecurityHoldingChange} from '../models/portfolio/composition/portfolio-security-holding-change.model';
import {NewSecurityHoldingChange} from '../models/portfolio/composition/new-security-holding-change.model';
import {ConfigInitializer} from '../initializers/config.initializer';

describe('Holding Change Factory Tests', () => {
    let testSecurityChange, testNewSecurityChange, testPortfolioHoldingChange;

    beforeAll(() => {
        ConfigInitializer.registerHoldingChangeTypes();

        testSecurityChange = new PortfolioSecurityHoldingChange({
            lineItem: '22533WAA7',
            newWeight: 12.34,
            changeInWeight: 5.45,
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
        });

        testNewSecurityChange = new NewSecurityHoldingChange({
            lineItem: '22533WAA7',
            analyticsId: '12345678891',
            isValid: true,
            newWeight: 12.34,
            changeInWeight: 5.45,
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
        });

        testPortfolioHoldingChange = new PortfolioHoldingChange({
            lineItem: 'IP',
            newWeight: 7.34,
            changeInWeight: 3.4,
            childPortfolioName: 'IP'
        });
    });

    it('Test converting object to holding change', () => {
        expect(testSecurityChange.isEqual(HoldingChangeFactory.convertObjectToHoldingChange({
            lineItem: '22533WAA7',
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
        }))).toBe(true);

        expect(testNewSecurityChange.isEqual(HoldingChangeFactory.convertObjectToHoldingChange({
            lineItem: '22533WAA7',
            changeInWeight: 5.45,
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
        }))).toBe(true);

        expect(testPortfolioHoldingChange.isEqual(HoldingChangeFactory.convertObjectToHoldingChange({
            lineItem: 'IP',
            changeInWeight: 3.4,
            newWeight: 7.34,
            changeType: 'Portfolio',
            childPortfolioName: 'IP'
        }))).toBe(true);

        expect(HoldingChangeFactory.convertObjectToHoldingChange({
            lineItem: 'IP',
            changeInWeight: 3.4,
            newWeight: 7.34,
            changeType: '',
            childPortfolioName: 'IP'
        })).toBe(null);
    });
});

