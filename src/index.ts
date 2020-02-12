import axios, { AxiosRequestConfig, AxiosInstance, AxiosPromise } from 'axios';
import { Observable } from 'rxjs';

export class Api {
  private httpClient: AxiosInstance;

  constructor(config: {
    baseURL: Required<Pick<AxiosRequestConfig, 'baseURL'>>['baseURL'],
    headers?: Pick<AxiosRequestConfig, 'headers'>['headers'],
    withCredentials?: Pick<AxiosRequestConfig, 'withCredentials'>['withCredentials']
  }) {
    this.httpClient = axios.create({
      baseURL: config.baseURL,
    });
  }

  private makeRequest<T>(
    method: string,
    url: string,
    params?: object,
    body?: object
  ) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const config: AxiosRequestConfig = {
      params: params,
      cancelToken: source.token,
    };

    let request: AxiosPromise<T>;

    switch (method) {
      case 'GET':
        request = this.httpClient.get<T>(url, config);
        break;
      case 'POST':
        request = this.httpClient.post<T>(url, body, config);
        break;
      case 'PUT':
        request = this.httpClient.put<T>(url, body, config);
        break;
      case 'PATCH':
        request = this.httpClient.patch<T>(url, body, config);
        break;
      case 'DELETE':
        request = this.httpClient.delete(url, config);
        break;

      default:
        throw new Error('Method not supported');
    }

    return new Observable<T>(subscriber => {
      request.then(response => {
        subscriber.next(response.data);
        subscriber.complete();
      }).catch((err: Error) => {
        subscriber.error(err);
      });

      return () => {
        source.cancel();
      };
    });
  }

  get<T>(url: string, params?: object) {
    return this.makeRequest<T>('GET', url, params);
  }

  post<T>(url: string, data: object, queryParams?: object): Observable<T> {
    return this.makeRequest('POST', url, queryParams, data);
  }

  patch<T>(url: string, body: object, params?: object) {
    return this.makeRequest<T>('PATCH', url, params, body);
  }

  put<T>(url: string, body: object, params?: object) {
    return this.makeRequest<T>('PUT', url, params, body);
  }

  delete<T>(url: string, params?: object) {
    return this.makeRequest<T>('DELETE', url, params);
  }
}
