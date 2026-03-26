export type TCreateOvertimeReq = {
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
};

export type TOvertimeRequest = {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
};
