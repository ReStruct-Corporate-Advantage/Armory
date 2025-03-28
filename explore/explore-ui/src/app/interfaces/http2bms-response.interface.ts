export interface Http2BmsResponse<T> {
    args: string[];
    output: T;
    transactionContext: {};
    return_val: string;
    transactionId: string;
    message?: string;
    command: string;
}
