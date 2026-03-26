import { NEXT_PUBLIC_BASE_DOMAIN_BE_API } from "@/constant/app.constant";
import { ENDPOINT } from "@/constant/endpoint.constant";
import { getCookieHeader, setCookieHeader } from "@/helpers/cookies.helper";
import { clearTokensAction } from "./actions/auth.action";

const TOKEN_EXPIRED = "TOKEN_EXPIRED";

type ErrorResponse = {
    message?: string;
    errorCode?: string;
};

export async function logout() {
    await clearTokensAction();
    // googleLogout();

    if (typeof window !== "undefined") {
        // Client
        window.location.reload();
        window.location.href = "/login";
    } else {
        // Server
        const { redirect } = await import("next/navigation");
        redirect("/login");
    }
}

type FetchOptions = RequestInit & { body?: any; isFormData?: boolean };

class APIClient {
    private baseURL: string;
    private isRefreshing = false;
    private refreshQueue: Array<(refreshSucceeded: boolean) => void> = [];

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const { body, headers, ...restOptions } = options;

        const isFormData = body instanceof FormData;

        const contentType = isFormData ? {} : { "Content-Type": "application/json" };

        const handleBody = () => {
            if (!body) return undefined;
            if (isFormData) return body;
            return JSON.stringify(body);
        };

        const cookieHeader = await getCookieHeader();

        const optionFetch: any = {
            ...restOptions,
            headers: {
                ...contentType,
                ...headers,
                cookie: cookieHeader,
            },
            body: handleBody(),
        };

        const response = await fetch(`${this.baseURL}/${url}`, optionFetch);

        const setCookies = response.headers.getSetCookie();
        if (setCookies) {
            for (const cookie of setCookies) {
                await setCookieHeader(cookie);
            }
        }

        const cloneResponse = response.clone();
        const errorData = await this.parseErrorResponse(cloneResponse);
        const shouldRefreshToken = this.shouldRefreshToken(response.status, errorData);

        if (shouldRefreshToken) {
            console.log({
                status: response.status,
                url: response.url,
                message: `Access Token đã hết hạn → Cần refresh token`,
                errorCode: errorData?.errorCode,
            });

            if (!this.isRefreshing) {
                this.isRefreshing = true;

                try {
                    const refreshResult = await this.refreshAccessToken();

                    this.resolveRefreshQueue(Boolean(refreshResult));

                    if (refreshResult) {
                        return this.request<T>(url, options);
                    }
                } finally {
                    this.isRefreshing = false;
                }

                await logout();
                throw new Error("Refresh token failed, logout.");
            }

            return new Promise<T>((resolve, reject) => {
                this.refreshQueue.push((refreshSucceeded) => {
                    if (!refreshSucceeded) {
                        reject(new Error("Refresh token failed, logout."));
                        return;
                    }

                    this.request<T>(url, options).then(resolve).catch(reject);
                });
            });
        }

        if (response.status === 401) {
            console.log({
                status: response.status,
                url: response.url,
                message: `Không có quyền truy cập tài nguyên ngay cả khi đã đăng nhập → Logout`,
                errorCode: errorData?.errorCode,
            });
            await logout();
            throw new Error(errorData?.message || "Unauthorized");
        }

        if (!response.ok) {
            console.log({ errorData });
            throw new Error(errorData?.message || `Error ${response.status}`);
        }

        return response.json();
    }

    get<T>(url: string, options?: FetchOptions) {
        return this.request<T>(url, { ...options, method: "GET" });
    }

    post<T>(url: string, body?: any, options?: FetchOptions) {
        return this.request<T>(url, { ...options, method: "POST", body });
    }

    put<T>(url: string, body?: any, options?: FetchOptions) {
        return this.request<T>(url, { ...options, method: "PUT", body });
    }

    patch<T>(url: string, body?: any, options?: FetchOptions) {
        return this.request<T>(url, { ...options, method: "PATCH", body });
    }

    delete<T>(url: string, options?: FetchOptions) {
        return this.request<T>(url, { ...options, method: "DELETE" });
    }

    private async refreshAccessToken() {
        try {
            const res = await this.post(ENDPOINT.AUTH.REFRESH_TOKEN);
            return res;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    private resolveRefreshQueue(refreshSucceeded: boolean) {
        this.refreshQueue.forEach((cb) => cb(refreshSucceeded));
        this.refreshQueue = [];
    }

    private shouldRefreshToken(status: number, errorData?: ErrorResponse | null) {
        return (status === 401 || status === 403) && errorData?.errorCode === TOKEN_EXPIRED;
    }

    private async parseErrorResponse(response: Response): Promise<ErrorResponse | null> {
        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            return null;
        }

        try {
            return (await response.json()) as ErrorResponse;
        } catch {
            return null;
        }
    }
}

const api = new APIClient(NEXT_PUBLIC_BASE_DOMAIN_BE_API);

export default api;
