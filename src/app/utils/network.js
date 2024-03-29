import ArmoryError from "../errors/armory-error";
import Helper from "./Helper";
import API_CONFIG from "../constants/api-config";

export default class Network {

  static async get(url, queryParams, options) {
    const urlString = Network.stringifyUrl(url, queryParams);
    options = { method: "GET", mode: "cors", credentials: "include", ...options};
    return Network.crud(urlString, options);
  }

  static async getStatic(url, queryParams, options) {
    let urlString = Network.stringifyUrl(url, queryParams);
    const host = urlString.startsWith("http") ? "" : (API_CONFIG.STATIC_HOST[process.env.NODE_ENV || "development"]);
    urlString =  host ? host + urlString : urlString;
    options = { method: "GET", mode: "cors", credentials: "include", ...options};
    return Network.crud(urlString, options);
  }

  static async post(url, data, queryParams) {
    const urlString = Network.stringifyUrl(url, queryParams);
    const options = {
      method: "POST",
      body: JSON.stringify(data),
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    };
    return Network.crud(urlString, options);
  }

  static async postAsFormData(url, data, queryParams) {
    const urlString = Network.stringifyUrl(url, queryParams);
    const options = {
      method: "POST",
      body: data,
      headers: {}
    };
    return Network.crud(urlString, options);
  }

  static async put(url, data, queryParams) {
    const urlString = Network.stringifyUrl(url, queryParams);
    const options = {
      method: "PUT",
      body: JSON.stringify(data),
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    };
    return Network.crud(urlString, options);
  }

  static async delete(url, queryParams) {
    const urlString = Network.stringifyUrl(url, queryParams);
    const options = {
      method: "DELETE",
      noInject: true
    };
    return Network.crud(urlString, options);
  }

  static async crud(urlString, options) {
    const host = urlString.startsWith("http") ? "" : (API_CONFIG.HOST[process.env.NODE_ENV || "development"]);
    urlString =  host ? host + urlString : urlString;
    if (!options.headers) {
      options.headers = {}
    }
    options.toggleLoader && options.toggleLoader({[urlString]: true});
    options.headers["x-access-token"] = Helper.getCookie("auth_session_token");
    options.headers["Origin"] = window.location.protocol + "//" + window.location.host;
    const response = await fetch(urlString, options);
    const { ok, status, headers } = response;
    if (ok) {
      if (headers.get("content-type").indexOf("application/json") !== -1) {
        const body = await response.json();
        options.toggleLoader && options.toggleLoader({[urlString]: false});
        return { status, body };
      } else if (headers.get("content-type").indexOf("application/zip") !== -1
        || headers.get("content-type").indexOf("application/pdf") !== -1) {
        const body = await response.arrayBuffer();
        options.toggleLoader && options.toggleLoader({[urlString]: false});
        return { status, body };
      }
      const body = await response.text();
      options.toggleLoader && options.toggleLoader({[urlString]: false});
      return { status, body };
    }
    const err = await response.json();
    options.toggleLoader && options.toggleLoader({[urlString]: false});
    console.log(err);
    throw new ArmoryError(status, err.error, err.message);
  }

  static stringifyUrl(url, queryParams) {
    return url ? queryParams ? Object.keys(queryParams).reduce((acc, key) => acc.concat(`${key}=${queryParams[key]}`), url + "?") : url : "";
  }
}
