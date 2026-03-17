import { createOvertimeAction } from "@/api/actions/overtime.action";
import { resError } from "@/helpers/function.helper";
import { TCreateOvertimeReq } from "@/types/overtime.type";
import { useMutation } from "@tanstack/react-query";
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
