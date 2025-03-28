export abstract class TelemetryActionTracker<T, V> {
    public abstract generateProtoBuff(parameter: T): V;
}
