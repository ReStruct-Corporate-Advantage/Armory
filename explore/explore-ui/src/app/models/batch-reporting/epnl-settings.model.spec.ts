/**
 * Tests for EPNLSettings class
 */
import {EpnlSettings} from '@models/batch-reporting/epnl-settings.model';
import {DateValue} from '@blk/explore-ui-core';

describe('EPNL Settings test', () => {
    let epnlSettings;
    let otherEpnlSettings;
    beforeEach(() => {
        otherEpnlSettings = new EpnlSettings();
        epnlSettings = new EpnlSettings();
    });

    describe('Test equals', () => {
        it('is Equal', () => {
            expect(epnlSettings.equals(new EpnlSettings())).toBeTruthy();
        });
        it('otherEpnlSettings isNil', () => {
            expect(epnlSettings.equals(null)).toBeFalsy();
        });
        it('enableBirtSummary not equal', () => {
            epnlSettings.enableBirtSummary = false;
            otherEpnlSettings.enableBirtSummary = true;
            expect(epnlSettings.equals(otherEpnlSettings)).toBeFalsy();
        });
        it('enableHideLinks not equal', () => {
            epnlSettings.enableHideLinks = false;
            otherEpnlSettings.enableHideLinks = true;
            expect(epnlSettings.equals(otherEpnlSettings)).toBeFalsy();
        });
        it('calCode not equal', () => {
            epnlSettings.calCode = 'US';
            otherEpnlSettings.calCode = 'GB';
            expect(epnlSettings.equals(otherEpnlSettings)).toBeFalsy();
        });
        it('fromDate not equal', () => {
            epnlSettings.fromDate.dateStringValue = 'T-3';
            otherEpnlSettings.fromDate.dateStringValue = 'T-2';
            expect(epnlSettings.equals(otherEpnlSettings)).toBeFalsy();
        });
        it('toDate not equal', () => {
            epnlSettings.toDate.dateStringValue = 'T-3';
            otherEpnlSettings.toDate.dateStringValue = 'T-2';
            expect(epnlSettings.equals(otherEpnlSettings)).toBeFalsy();
        });
    });

    it('Test serialize', () => {
        epnlSettings.calCode = 'US';
        epnlSettings.enableHideLinks = false;
        epnlSettings.enableBirtSummary = true;
        let serialized = epnlSettings.serialize();
        expect(serialized.calCode).toEqual('US');
        expect(serialized.enableHideLinks).toBeFalsy();
        expect(serialized.enableBirtSummary).toBeTruthy();
        epnlSettings.enableHideLinks = true;
        serialized = epnlSettings.serialize();
        expect(serialized.enableHideLinks).toBeTruthy();
    });

    it('Test deserialize', () => {
        let data = null;
        epnlSettings.deserialize(data);
        expect(epnlSettings.calCode).toBeFalsy();

        const fromDateValue = new DateValue({date: '04/01/2023'});
        const toDateValue = new DateValue({date: '09/06/2023'});

        data = {
            calCode: 'US',
            enableHideLinks: false,
            enableBirtSummary: true,
            fromDateValue: fromDateValue.serialize(),
            toDateValue: toDateValue.serialize()
        };
        epnlSettings.deserialize(data);
        expect(epnlSettings.calCode).toEqual('US');
        expect(epnlSettings.enableHideLinks).toBeFalsy();
        expect(epnlSettings.enableBirtSummary).toBeTruthy();
        expect(epnlSettings.fromDate.date).toEqual(fromDateValue.date);
        expect(epnlSettings.toDate.date).toEqual(toDateValue.date);
    });
});
