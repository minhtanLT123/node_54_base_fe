import { createOvertimeAction, getOvertimeListAction } from "@/api/actions/overtime.action";
import { TPayloadTable } from "@/components/custom/table/TableCustom";
import { resError } from "@/helpers/function.helper";
import { TCreateOvertimeReq } from "@/types/overtime.type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useCreateOvertime = () => {
    return useMutation({
        mutationFn: async (payload: TCreateOvertimeReq) => {
            const { data, status, message } = await createOvertimeAction(payload);
            if (status === "error" || data === null) throw new Error(message);
            return data;
        },
        onError: (error) => {
            toast.error(resError(error, "Create overtime request failed"));
        },
    });
};

export const useGetOvertimeList = (payload: TPayloadTable) => {
    const { pagination, filters, sort } = payload;
    const { pageIndex, pageSize } = pagination;
    return useQuery({
        queryKey: ["overtime-list", payload],
        queryFn: async () => {
            const query = `page=${pageIndex}&pageSize=${pageSize}&filters=${JSON.stringify(filters ?? {})}&sortBy=${sort?.sortBy ?? ""}&isDesc=${sort?.isDesc ?? false}`;
            const { data, status, message } = await getOvertimeListAction(query);
            if (status === "error" || data === null) throw new Error(message);
            return data;
        },
    });
};
