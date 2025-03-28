import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CommonUtils} from '@blk/explore-ui-core';
import {UtilConstants} from '@constants/util.constants';
import {URLConstants} from '@constants/url.constants';
import {isEmpty} from "lodash";

/*
This interceptor handles the parameters passed in the url
 */
@Injectable()
export class RequestEnablerInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let clonedReq: HttpRequest<any> = req;
        const paramsPassedInURL: Map<string, string> = CommonUtils.getAllURLParams();
        if (!!paramsPassedInURL.size) {
            const urlParams: Map<string, string> = URLConstants.URL_PARAMS_WITH_DEFAULT_VALUES;
            const jsonObj = {};
            //if the passed value is not the default value set it in the request body/param
            paramsPassedInURL.forEach((value: string, key: string) => {
                const defaultValue = urlParams.get(key);
                if (value && defaultValue && defaultValue !== value) {
                    jsonObj[key] = value;
                }
            });
            if(!isEmpty(jsonObj)) {
                clonedReq = this.handleBodyIn(req, jsonObj);
            }
        }

        return next.handle(clonedReq);
    }

    handleBodyIn(req: HttpRequest<any>, jsonObj: any): HttpRequest<any> {
        let newReq: HttpRequest<any>;
        if (req.method.toLowerCase() === UtilConstants.POST) {
            newReq = req.clone({
                body: {...req.body, ...jsonObj}
            })
        }

        if (req.method.toLowerCase() === UtilConstants.GET) {
            newReq = req.clone({
                setParams: {...jsonObj}
            })
        }
        return newReq;
    }

}
