import {getWebInstrumentations, initializeFaro} from '@grafana/faro-web-sdk';
import {TracingInstrumentation} from '@grafana/faro-web-tracing';

/**
 * Initializes Grafana Faro
 * https://github.com/grafana/faro-web-sdk/blob/main/docs/sources/tutorials/use-angular.md
 */
export class GrafanaFaroInitializer {
    private static readonly PROD_URL: string = 'https://faro-collector-prod-us-central-0.grafana.net/collect/114cf9b021de96ae71d22d9f4b9f844f';
    private static readonly PREPROD_URL: string = 'https://faro-collector-prod-us-central-0.grafana.net/collect/59f753a0c0a84305f66a5a18bff0a97d';

    /**
     * Initializes Grafana Faro if applicable
     */
    static initialize(): () => Promise<void> {
        if (!GrafanaFaroInitializer.isFaroEnabled()) {
            return () => new Promise<void>((resolve) => resolve());
        }

        const url = GrafanaFaroInitializer.isPreProd() ? GrafanaFaroInitializer.PREPROD_URL : GrafanaFaroInitializer.PROD_URL;

        return async () => {
            initializeFaro({
                url,
                app: {
                    name: 'Explore_UI',
                    version: '1.0.0',
                    environment: 'production',
                },
                instrumentations: [
                    ...getWebInstrumentations({captureConsole: true, captureConsoleDisabledLevels: []}),
                    new TracingInstrumentation()
                ],
                ignoreUrls: [/\/statcollector\/v1\/eventlogger\//]  // ignore UI snowflake telemetry https://webster.bfm.com/statcollector/v1/eventlogger/Explore%20Beta
            });
        };
    }

    /**
     * Check if Faro should be enabled
     */
    private static isFaroEnabled(): boolean {
        const isPreProd = GrafanaFaroInitializer.isPreProd();
        const isBLK = location.hostname === 'webster.bfm.com';

        // only enable Faro for preprod and BLK
        return isPreProd || isBLK;
    }

    /**
     * Check if the current environment is preprod
     */
    private static isPreProd(): boolean {
        const preProdHostnames = ['localhost', 'dev.blackrock.com', 'tst.blackrock.com', 'eng.blackrock.com', 'cirrus.blackrock.com', 'pac.blackrock.com',
            'padm.blackrock.com', 'pce.blackrock.com', 'psh.blackrock.com', 'pshcloud.blackrock.com', 'stageb.blackrock.com', 'torpedo.blackrock.com',
            'tstaen.blackrock.com', 'tstalx.blackrock.com', 'test.blackrock.com', 'tstblk.blackrock.com', 'tstcloud.blackrock.com', 'tstesp.blackrock.com', 'tstqa.blackrock.com'
        ];
        return preProdHostnames.includes(location.hostname);
    }
}
