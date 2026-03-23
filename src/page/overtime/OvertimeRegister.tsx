"use client";

import { useCreateOvertime } from "@/api/tantask/overtime.tanstack";
import { Button, Container, Group, Paper, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import * as Yup from "yup";

const parseTimeToMinutes = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
};

export default function OvertimeRegister() {
    const t = useTranslations("overtime");
    const createOvertime = useCreateOvertime();
    const searchParams = useSearchParams();
    const selectedDate = searchParams.get("date") || "";

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
        <Container size={720} py={50}>
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
    );
}
