"use client";

import { useCreateOvertime, useGetOvertimeList } from "@/api/tantask/overtime.tanstack";
import TableCustom from "@/components/custom/table/TableCustom";
import { TOvertimeRequest } from "@/types/overtime.type";
import { Badge, Box, Button, Container, Group, Paper, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as Yup from "yup";

const STATUS_COLOR: Record<string, string> = {
    PENDING_LEADER: "yellow",
    PENDING_MANAGER: "orange",
    PENDING_DIRECTOR: "grape",
    PENDING_HR: "violet",
    APPROVED: "green",
    REJECTED: "red",
    CANCELLED: "gray",
};

const colHelper = createColumnHelper<TOvertimeRequest>();

function formatDate(value: string) {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString("vi-VN");
}

function formatTime(value: string) {
    if (!value) return "-";
    // If already HH:MM format
    if (/^\d{2}:\d{2}$/.test(value)) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const parseTimeToMinutes = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
};

export default function OvertimeRegister() {
    const t = useTranslations("overtime");
    const queryClient = useQueryClient();
    const createOvertime = useCreateOvertime();
    const searchParams = useSearchParams();
    const selectedDate = searchParams.get("date") || "";

    const columns = useMemo(
        () => [
            colHelper.accessor("date", {
                header: t("colDate"),
                cell: (info) => formatDate(info.getValue()),
            }),
            colHelper.accessor("startTime", {
                header: t("colStartTime"),
                cell: (info) => formatTime(info.getValue()),
            }),
            colHelper.accessor("endTime", {
                header: t("colEndTime"),
                cell: (info) => formatTime(info.getValue()),
            }),
            colHelper.accessor("hours", {
                header: t("colHours"),
                cell: (info) => `${info.getValue()}h`,
            }),
            colHelper.accessor("reason", {
                header: t("colReason"),
                cell: (info) => (
                    <Text size="sm" lineClamp={2} maw={240}>
                        {info.getValue()}
                    </Text>
                ),
            }),
            colHelper.accessor("status", {
                header: t("colStatus"),
                cell: (info) => {
                    const status = info.getValue() as string;
                    const labelKey = `status${status.charAt(0)}${status
                        .slice(1)
                        .toLowerCase()
                        .replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())}` as any;
                    const statusLabelMap: Record<string, string> = {
                        PENDING_LEADER: t("statusPendingLeader"),
                        PENDING_MANAGER: t("statusPendingManager"),
                        PENDING_DIRECTOR: t("statusPendingDirector"),
                        PENDING_HR: t("statusPendingHR"),
                        APPROVED: t("statusApproved"),
                        REJECTED: t("statusRejected"),
                        CANCELLED: t("statusCancelled"),
                    };
                    return (
                        <Badge color={STATUS_COLOR[status] ?? "gray"} variant="light" size="sm">
                            {statusLabelMap[status] ?? status}
                        </Badge>
                    );
                },
            }),
            colHelper.accessor("createdAt", {
                header: t("colCreatedAt"),
                cell: (info) => formatDate(info.getValue() ?? ""),
            }),
        ],
        [t],
    );

    const overtimeForm = useFormik({
        initialValues: {
            date: "",
            startTime: "",
            endTime: "",
            reason: "",
        },
        validationSchema: Yup.object().shape({
            date: Yup.string().required(t("dateRequired")),
            startTime: Yup.string().required(t("startTimeRequired")),
            endTime: Yup.string()
                .required(t("endTimeRequired"))
                .test("ot-time-valid", t("timeRangeInvalid"), function (value) {
                    const { startTime } = this.parent;
                    if (!value || !startTime) return false;
                    // So sanh theo phut de tranh loi timezone vi API nhan date va time tach rieng.
                    return parseTimeToMinutes(value) > parseTimeToMinutes(startTime);
                }),
            reason: Yup.string().trim().min(10, t("reasonMin")).required(t("reasonRequired")),
        }),
        onSubmit: async (valuesRaw, helpers) => {
            const payload = {
                date: valuesRaw.date,
                startTime: valuesRaw.startTime,
                endTime: valuesRaw.endTime,
                reason: valuesRaw.reason.trim(),
            };

            createOvertime.mutate(payload, {
                onSuccess: () => {
                    toast.success(t("createSuccess"));
                    helpers.resetForm();
                    queryClient.invalidateQueries({ queryKey: ["overtime-list"] });
                },
            });
        },
    });

    useEffect(() => {
        if (!selectedDate) return;
        const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);
        if (!isValidDate) return;

        overtimeForm.setFieldValue("date", selectedDate);
    }, [selectedDate]);

    return (
        <Stack gap={28} py={50}>
            <Container size={720} w="100%">
                <Stack gap={28}>
                    <Stack gap={8}>
                        <Title order={2} sx={{ fontWeight: 900, fontSize: "clamp(28px, 4vw, 34px)" }}>
                            {t("title")}
                        </Title>
                        <Text c="dimmed">{t("description")}</Text>
                    </Stack>

                    <Paper
                        withBorder
                        shadow="md"
                        p="xl"
                        radius="xl"
                        component="form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            overtimeForm.handleSubmit();
                        }}
                    >
                        <Stack>
                            <Group grow align="flex-start">
                                <TextInput
                                    withAsterisk
                                    type="date"
                                    label={t("date")}
                                    name="date"
                                    value={overtimeForm.values.date}
                                    onChange={overtimeForm.handleChange}
                                    error={overtimeForm.touched.date && overtimeForm.errors.date}
                                    inputWrapperOrder={["label", "input", "error"]}
                                />

                                <TextInput
                                    withAsterisk
                                    type="time"
                                    label={t("startTime")}
                                    name="startTime"
                                    value={overtimeForm.values.startTime}
                                    onChange={overtimeForm.handleChange}
                                    error={overtimeForm.touched.startTime && overtimeForm.errors.startTime}
                                    inputWrapperOrder={["label", "input", "error"]}
                                />

                                <TextInput
                                    withAsterisk
                                    type="time"
                                    label={t("endTime")}
                                    name="endTime"
                                    value={overtimeForm.values.endTime}
                                    onChange={overtimeForm.handleChange}
                                    error={overtimeForm.touched.endTime && overtimeForm.errors.endTime}
                                    inputWrapperOrder={["label", "input", "error"]}
                                />
                            </Group>

                            <Textarea
                                withAsterisk
                                label={t("reason")}
                                placeholder={t("reasonPlaceholder")}
                                name="reason"
                                minRows={4}
                                maxRows={8}
                                autosize
                                value={overtimeForm.values.reason}
                                onChange={overtimeForm.handleChange}
                                error={overtimeForm.touched.reason && overtimeForm.errors.reason}
                                inputWrapperOrder={["label", "input", "error"]}
                            />

                            <Group justify="flex-end">
                                <Button type="submit" loading={createOvertime.isPending}>
                                    {t("submit")}
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>

            <Container size="xl" w="100%" px="md">
                <Stack gap={8} style={{ minWidth: 0 }}>
                    <Title order={4}>{t("historyTitle")}</Title>
                    <Box style={{ width: "100%", overflowX: "auto" }}>
                        <TableCustom<TOvertimeRequest>
                            columns={columns}
                            fetchData={useGetOvertimeList}
                            styleTableTh={{ textAlign: "center", whiteSpace: "nowrap" }}
                            styleTableTd={{ textAlign: "center", whiteSpace: "nowrap" }}
                            showPaginations
                            showPageSize
                        />
                    </Box>
                </Stack>
            </Container>
        </Stack>
    );
}
