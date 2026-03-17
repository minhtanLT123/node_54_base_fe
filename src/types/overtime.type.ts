export type TCreateOvertimeReq = {
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
};

export type TOvertimeRequest = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
};
