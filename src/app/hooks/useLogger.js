import {useDispatch, useSelector} from "react-redux";
import {getLogs} from "../global-selectors";
import {dispatchLogs} from "../global-actions";

const useLogger = () => {
    const dispatch = useDispatch();
    const logs = useSelector(getLogs);

    return {
        logs,
        logger: (log) => {
            let logsTransformed = logs && logs.length === undefined ? logs.toArray().map(item => item.toObject()) : logs;
            logsTransformed = [...logsTransformed];
            logsTransformed.push(log);
            dispatch(dispatchLogs(logsTransformed))
        }
    }

}

export default useLogger;