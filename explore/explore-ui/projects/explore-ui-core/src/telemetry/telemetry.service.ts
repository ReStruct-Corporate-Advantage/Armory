import {
    AFTEventLogging,
    AladdinTelemetryConfigBuilder
} from '@blk/aladdin-frontend-telemetry';
import {Injectable} from '@angular/core';
import {ExploreAppContext} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_telemetry_config_pb';
import {TelemetryEventsProtobuffFactory} from './factories/telemetry-events-protobuff.factory';
import {TelemetryRegisterInitializer} from './telemetry-register.initializer';

/**
 * Telemetry Service
 */
@Injectable()
export class TelemetryService {
    private static telemetryConfig: AFTEventLogging = null;
    private static exploreAppContext: ExploreAppContext = null;
    private static isReady = false;

    static track(actionToTrack: string, actionParameters: any, functionName?: string): Promise<void> {
        if (!TelemetryService.isReady) {
            return;
        }
        try {
            const eventType = TelemetryEventsProtobuffFactory.getProtoTypeFromKey(actionToTrack);
            if (!eventType) {
                return;
            }
            const eventTracker = new eventType();

            // Add function name to the tracker if it's passed from event tracking.
            if (functionName) {
                eventTracker.functionName = functionName;
            }

            const protoBuff = eventTracker.generateProtoBuff(actionParameters);
            if (protoBuff) {
                if (Array.isArray(protoBuff)) {
                    protoBuff.forEach((action) => {
                        action.setExploreAppContext(TelemetryService.exploreAppContext);
                        TelemetryService.telemetryConfig.add(action, eventTracker.eventSchema, eventTracker.functionName);
                    });
                } else {
                    protoBuff.setExploreAppContext(TelemetryService.exploreAppContext);
                    TelemetryService.telemetryConfig.add(protoBuff, eventTracker.eventSchema, eventTracker.functionName);
                }
            }
        } catch (e) {
            console.log('Error recording telemetry for ', actionToTrack, ' ', e);
        }
    }

    static updateWorkspaceId(workspaceId: number|string): void {
        // Telemetry proto supports number|string for workspaceId
        if (TelemetryService.isReady && workspaceId) {
            TelemetryService.exploreAppContext.setWorkspaceId(workspaceId.toString());
        }
    }

    constructor() {}

    initializeTelemetry( workspaceId: number | string, userId: string, userOrg: string, browser: string,
                         isTelemetryEnabled: boolean, appName: string, version: string) {
        if (isTelemetryEnabled) {
            TelemetryService.exploreAppContext = new ExploreAppContext();
            TelemetryService.exploreAppContext.setBrowser(browser);
            if (workspaceId) {
                TelemetryService.exploreAppContext.setWorkspaceId(workspaceId.toString());
            }
            new AladdinTelemetryConfigBuilder()
            .setAppName(appName)
            .setAppVersion(version)
            .setUserName(userId)
            .setSessionIdCallback(function(): string {
                return Date.now().toString();
            })
            .setClientName(userOrg)
            .setQueueSize(1)
            .build()
            .then(telemetryConfig => {
                TelemetryService.telemetryConfig = telemetryConfig;
                TelemetryService.isReady = true;
                TelemetryRegisterInitializer.initialize();
            })
            .catch(e => {
                console.error(e);
            });
        } else {
            TelemetryService.telemetryConfig = null;
        }
    }
}
