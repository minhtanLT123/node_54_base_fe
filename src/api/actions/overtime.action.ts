"use server";

import { ENDPOINT } from "@/constant/endpoint.constant";
import { TRes, TResAction, TResPagination } from "@/types/app.type";
import { TCreateOvertimeReq, TOvertimeRequest } from "@/types/overtime.type";
import api from "../core.api";

export async function createOvertimeAction(payload: TCreateOvertimeReq): Promise<TResAction<TOvertimeRequest | null>> {
    try {
        const result = await api.post<TRes<TOvertimeRequest>>(ENDPOINT.OVERTIME.CREATE, payload);
        const { data } = result;
        return { status: "success", message: result.message, data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Create overtime failed";
        return { status: "error", message, data: null };
    }
}

export async function getOvertimeListAction(query: string): Promise<TResAction<TResPagination<TOvertimeRequest> | null>> {
    try {
        const result = await api.get<TRes<TResPagination<TOvertimeRequest>>>(`${ENDPOINT.OVERTIME.LIST}?${query}`);
        const { data } = result;
        return { status: "success", message: result.message, data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Get overtime list failed";
        return { status: "error", message, data: null };
    }
}
