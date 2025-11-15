import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

/**
 * API 响应接口
 */
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message?: string
}

/**
 * HTTP 请求封装类
 * 基于 axios 封装，提供统一的 API 接口和拦截器
 */
class Request {
  private instance: AxiosInstance

  /**
   * 创建请求实例
   * @param config - 可选的 axios 配置
   */
  constructor(config?: AxiosRequestConfig) {
    this.instance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    })

    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors() {
    /**
     * 请求拦截器
     * @param {InternalAxiosRequestConfig} config - axios 请求配置对象，包含 headers、url、method 等
     * @returns {InternalAxiosRequestConfig} 处理后的请求配置对象
     * @throws {any} 请求配置错误时抛出异常
     * 功能说明:
     *   - 自动从 localStorage 获取 token，并将其注入到请求头的 Authorization 字段，格式为 "Bearer <token>"。
     *   - 支持后续添加其它统一 header 拦截操作。
     *   - 若拦截或配置有误，将异常传递给后续处理流程。
     */
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('app_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        // TODO: 请求错误处理：此处可统一处理请求前错误
        return Promise.reject(error)
      }
    )

    /**
     * 响应拦截器
     * @param {AxiosResponse<ApiResponse>} response - axios 响应对象，包含 data、status、statusText 等
     * @returns {ApiResponse<T>} 处理后的响应数据
     * @throws {any} 响应错误时抛出异常
     * 功能说明:
     *   - 统一处理响应数据格式，提取 code、data、message 等字段。
     *   - 支持后续添加其它统一响应处理。
     *   - 若处理或提取有误，将异常传递给后续处理流程。
     */
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response
      },
      (error) => {
        // TODO: 响应错误处理
        return Promise.reject(error)
      }
    )
  }

  /**
   * GET 请求
   * @param url - 请求地址
   * @param config - 可选的请求配置
   * @returns API 响应数据
   */
  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config)
    return response.data
  }

  /**
   * POST 请求
   * @param url - 请求地址
   * @param data - 请求数据
   * @param config - 可选的请求配置
   * @returns API 响应数据
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * PUT 请求
   * @param url - 请求地址
   * @param data - 请求数据
   * @param config - 可选的请求配置
   * @returns API 响应数据
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * DELETE 请求
   * @param url - 请求地址
   * @param config - 可选的请求配置
   * @returns API 响应数据
   */
  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  /**
   * PATCH 请求
   * @param url - 请求地址
   * @param data - 请求数据
   * @param config - 可选的请求配置
   * @returns API 响应数据
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(
      url,
      data,
      config
    )
    return response.data
  }
}

export default new Request()
