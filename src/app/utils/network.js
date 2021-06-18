import queryString from "query-string";
import ArmoryError from "../errors/armory-error";

export default class Network {

  static async get(url, queryParams) {
    const urlString = queryString.stringifyUrl({ url, query: queryParams });
    const options = { method: "GET", mode: "cors", credentials: "include", };
    return Network.crud(urlString, options);
  }

  static async post(url, data, queryParams) {
    const urlString = queryString.stringifyUrl({ url, query: queryParams });
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
    const urlString = queryString.stringifyUrl({ url, query: queryParams });
    const options = {
      method: "POST",
      body: data,
      headers: {}
    };
    return Network.crud(urlString, options);
  }

  static async put(url, data, queryParams) {
    const urlString = queryString.stringifyUrl({ url, query: queryParams });
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
    const urlString = queryString.stringifyUrl({ url, query: queryParams });
    const options = {
      method: "DELETE",
      noInject: true
    };
    return Network.crud(urlString, options);
  }

  static async crud(urlString, options) {
    const response = await fetch(urlString, options);
    const { ok, status, headers } = response;
//     console.log(response);
    if (ok) {
      if (headers.get("content-type").indexOf("application/json") !== -1) {
        const body = await response.json();
        return { status, body };
      } else if (headers.get("content-type").indexOf("application/zip") !== -1 || headers.get("content-type").indexOf("application/pdf") !== -1) {
        const body = await response.arrayBuffer();
        return { status, body };
      }
      const body = await response.text();
      return { status, body };
    }
    const err = await response.json();
    console.log(err);
    throw new ArmoryError(status, err.error, err.message);
  }
}
