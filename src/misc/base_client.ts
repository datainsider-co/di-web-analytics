import Axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosTransformer} from 'axios';
import MiniJson from 'mini-json';
import LibConfig from '../domain/config';

abstract class BaseClient {
  abstract get(path: string, config: { params?: any, headers?: any }): Promise<string>;

  abstract post(path: string, body?: any, config?: { params?: any, headers?: any }): Promise<string>;

  abstract put(path: string, body?: any, config?: { params?: any, headers?: any }): Promise<string>;

  abstract delete(path: string, config: { params: any, headers: any }): Promise<string>;
}

class HttpClient extends BaseClient {
  private readonly client: AxiosInstance;

  constructor(client: AxiosInstance) {
    super();
    this.client = client;
  }

  delete(path: string, config: { params?: any, headers?: any } = {}): Promise<string> {
    return this.client
      .delete<string>(path, { ...config })
      .then(HttpClient.getData)
      .catch(ex => HttpClient.handleError(path, ex));
  }

  get(path: string, config: { params?: any, headers?: any } = {}): Promise<string> {
    return this.client
      .get<string>(path, { ...config })
      .then(HttpClient.getData)
      .catch(ex => HttpClient.handleError(path, ex));
  }

  post(path: string, body?: any, config: { params?: any, headers?: any } = {}): Promise<string> {
    return this.client
      .post<string>(path, body, { ...config })
      .then(HttpClient.getData)
      .catch((ex) => HttpClient.handleError(path, ex));
  }

  put(path: string, body?: any, config: { params?: any, headers?: any } = {}): Promise<string> {
    return this.client
      .put<string>(path, body, { ...config })
      .then(HttpClient.getData)
      .catch(ex => HttpClient.handleError(path, ex));
  }

  private static getData(response: AxiosResponse<string>): string {
    return response.data;
  }

  private static handleError(path: string, reason: any): any {
    if (reason.toJSON) {
      console.warn('request error', 'path::', path, reason.toJSON());
    }

    if (reason.response?.data) {
      const apiException = MiniJson.fromJson<any>(reason.response.data);
      return Promise.reject(apiException);
    } else {
      const baseException = { message: reason.message };
      return Promise.reject(baseException);
    }
  }
}

export default BaseClient;

export const BASE_CLIENT: BaseClient = new HttpClient(
  Axios.create({
    baseURL: LibConfig.host,
    timeout: LibConfig.timeout,
    headers: LibConfig.baseHeaders,
    transformRequest: (data: AxiosTransformer) => {
      return JSON.stringify({
        tracking_api_key: LibConfig.trackingApiKey,
        ...data
      });
    }
  })
);
