import {ExportHubUtils} from './export-hub.utils';
import {Widget} from '@models/widget/widget.model';
import {
    ExportHubJobExecutionHistory
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {ColumnConfig, CoreUserMetaDataStore, TokenUtils, WidgetConfigType} from '@blk/explore-ui-core';
import {Breakdown, BreakdownInitializer, CustomSector, Sector} from '@blk/explore-ui-breakdown';
import {Timestamp} from 'google-protobuf/google/protobuf/timestamp_pb';

describe('ExportHubUtils', () => {

    describe('encodeWidgetSettingsForScheduledJob', () => {
        it('should throw error if dataStore is not found', () => {
            const mockWidget = new Widget();
            mockWidget.configType = WidgetConfigType.RISK_EXPOSURE;
            mockWidget.dataStore = null;

            expect(() => {
                ExportHubUtils.encodeWidgetSettingsForScheduledJob(mockWidget);
            }).toThrowError('dataStore not found..');
        });

        it('should throw error if serialization fails', () => {
            const mockWidget = new Widget();
            mockWidget.configType = WidgetConfigType.RISK_EXPOSURE;
            mockWidget.dataStore = {
                serialize: jest.fn().mockImplementation(() => {
                    throw new Error('serialization error');
                })
            };

            expect(() => {
                ExportHubUtils.encodeWidgetSettingsForScheduledJob(mockWidget);
            }).toThrowError('Serialization error -> Cannot read properties of undefined (reading \'cols\')');
        });

        it('should handle data store with metaData and property', () => {
            const mockWidget = new Widget();
            mockWidget.configType = WidgetConfigType.RISK_EXPOSURE;
            mockWidget.serialize = jest.fn().mockReturnValue({ config: 'mockConfig' });
            mockWidget.dataStore = {
                serialize: jest.fn().mockReturnValue({ data: 'mockData', metaData: {} })
            };

            const expectedConfig = {
                nestedWidgetConfig: { config: 'mockConfig' },
                nestedDataStore: { data: 'mockData', metaData: { type: 'agGrid' } }
            };

            const encodedSettings = ExportHubUtils.encodeWidgetSettingsForScheduledJob(mockWidget);

            expect(encodedSettings).toBe(btoa(JSON.stringify(expectedConfig)));
        });
    });

    it('should decode Base64 encoded string to ExportHubJobExecutionHistory object', () => {
        const encodedString = "EiQyMmM0NDVmMi04YzdlLTRmZGYtYmRlMi0zYWE1Zjk0ZDNiMzQaClRlc3QgSm9iIDE=";
        const decodedMessage = ExportHubUtils.decodeJobExecutionHistory(encodedString);

        expect(decodedMessage).toBeInstanceOf(ExportHubJobExecutionHistory);
        expect(decodedMessage.getJobId()).toBe('22c445f2-8c7e-4fdf-bde2-3aa5f94d3b34');
        expect(decodedMessage.getJobName()).toBe('Test Job 1');
        // Add more assertions based on the expected structure of ExportHubJobExecutionHistory
    });

    describe('shouldSaveLinkedFav', () => {


        it('should throw error for COLUMN type with custom_calc and id not present', () => {
            const config = new ColumnConfig();
            config.columnTag = 'custom_calc';
            expect(() => ExportHubUtils.shouldSaveLinkedFav(config)).toThrow('Custom Calculation is not currently supported with export hub. Please remove the column to proceed with export hub job');
        });

        it('should throw error for COLUMN type with style col tag', () => {
            const config = new ColumnConfig();
            config.columnTag = 'custom_style';
            expect(() => ExportHubUtils.shouldSaveLinkedFav(config)).toThrow('Style Analysis is not currently supported with export hub. Please remove the column to proceed with export hub job');
        });

        it('should return false for breakdown type without custom sector', () => {
            BreakdownInitializer.registerSectorConfigTypes();
            const breakdown: Sector = new Breakdown({
                'breakdown': {
                    'isConfigured': true,
                    'breakdownTitle': '<Untitled>',
                    'subSectors': [{
                        'breakdownRuleType': 'String',
                        'groupByColumn': {
                            'columnName': 'Book Currency',
                            'columnTag': 'book_ccy',
                            'dataType': 'STRING',
                            'positionColumnType': 'PORT'
                        },
                        'subSectors': [],
                        'useNoneBuckets': true
                    }]
                }
            });
            expect(ExportHubUtils.shouldSaveLinkedFav(breakdown)).toBe(false);
        });

        it('should return true for breakdown type with custom sector', () => {
            BreakdownInitializer.registerSectorConfigTypes();
            const breakdown: Sector = new Breakdown({
                'breakdown': {
                    'isConfigured': true,
                    'breakdownTitle': '<Untitled>',
                    'subSectors': [{
                        'breakdownRuleType': 'String',
                        'groupByColumn': {
                            'columnName': 'Book Currency',
                            'columnTag': 'book_ccy',
                            'dataType': 'STRING',
                            'positionColumnType': 'PORT'
                        },
                        'subSectors': [{
                            'breakdownRuleType': 'CustomSector',
                            'includeOtherBucket': true,
                            'rule': {
                                'colPositionColumnType': 'ALL',
                                'colTag': 'sec_group',
                                'colTitle': 'Security Group',
                                'colType': 'STRING',
                                'compType': 'Equals',
                                'compValues': ['INDEX'],
                                'customSectorType': 'Attributes',
                                'ruleType': 'Rule',
                                'includeNullValues': false
                            },
                            'title': 'Custom Sector'
                        }
                        ],
                        'useNoneBuckets': true
                    }]
                }
            });
            expect(ExportHubUtils.shouldSaveLinkedFav(breakdown)).toBe(true);
        });

        it('should return false for breakdown type without custom sector', () => {
            expect(ExportHubUtils.shouldSaveLinkedFav(new Breakdown())).toBe(false);
        });

        it('should return true for CUSTOM_SECTOR type', () => {
            expect(ExportHubUtils.shouldSaveLinkedFav(new CustomSector())).toBe(true);
        });

        it('should return false for other types', () => {
            expect(ExportHubUtils.shouldSaveLinkedFav({} as any)).toBe(false);
        });
    });

    describe('isExportHubEnabled', () => {
        it('should return true if the feature is enabled and user has access', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            CoreUserMetaDataStore.userMetaData = { exportHubAccess: true } as any;

            expect(ExportHubUtils.isExportHubEnabled()).toBe(true);
        });

        it('should return false if the feature is not enabled', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);
            CoreUserMetaDataStore.userMetaData = { exportHubAccess: true } as any;

            expect(ExportHubUtils.isExportHubEnabled()).toBe(false);
        });

        it('should return false if the user does not have access', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            CoreUserMetaDataStore.userMetaData = { exportHubAccess: false } as any;

            expect(ExportHubUtils.isExportHubEnabled()).toBe(false);
        });

        it('should return false if neither the feature is enabled nor the user has access', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);
            CoreUserMetaDataStore.userMetaData = { exportHubAccess: false } as any;

            expect(ExportHubUtils.isExportHubEnabled()).toBe(false);
        });
    });

    describe('formatDateTime', () => {
        it('should format Timestamp to string in MM/DD/YYYY HH:mm:ss format', () => {
            const timestamp = new Timestamp();
            timestamp.fromDate(new Date('2023-10-01T15:30:45Z'));

            const formattedDate = ExportHubUtils.formatDateTime(timestamp);

            expect(formattedDate).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2} (AM|PM)$/);
        });

    });
});
