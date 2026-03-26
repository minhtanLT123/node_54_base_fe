"use client";

import { ROUTER_CLIENT } from "@/constant/router.constant";
import TagUser from "@/components/tag-user/TagUser";
import { useAppSelector } from "@/redux/hooks";
import { NavLink, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { IconClockPlus } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function HomeLeft() {
    const info = useAppSelector((state) => state.user.info);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isOvertimePage = pathname === ROUTER_CLIENT.OVERTIME_REGISTER;
    const dateParam = searchParams.get("date");

    const selectedDate = dateParam || null;

    const handlePickDate = (value: string | null) => {
        if (!value) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set("date", value);
        router.push(`${ROUTER_CLIENT.OVERTIME_REGISTER}?${params.toString()}`);
    };

    return (
        <Stack>
            <TagUser fullName={info?.fullName} avatar={info?.avatar} />
            <NavLink
                component={Link}
                href={ROUTER_CLIENT.OVERTIME_REGISTER}
                label="Overtime"
                active={pathname === ROUTER_CLIENT.OVERTIME_REGISTER}
                leftSection={
                    <ThemeIcon variant="light" size="sm" radius="xl">
                        <IconClockPlus size={14} />
                    </ThemeIcon>
                }
                variant="light"
            />

            {isOvertimePage && (
                <Paper withBorder radius="md" p="sm" style={{ overflow: "hidden" }}>
                    <Stack gap={8}>
                        <Text fz="sm" fw={600}>
                            Chọn ngày tăng ca
                        </Text>
                        <DatePicker
                            value={selectedDate}
                            onChange={handlePickDate}
                            size="xs"
                            styles={{
                                day: {
                                    "&:hover": {
                                        backgroundColor: "var(--mantine-color-blue-1)",
                                        color: "var(--mantine-color-blue-9)",
                                    },
                                },
                                calendarHeader: { width: "100%" },
                                month: { width: "100%" },
                                monthRow: { width: "100%" },
                                monthCell: { textAlign: "center" },
                            }}
                        />
                    </Stack>
                </Paper>
            )}
        </Stack>
    );
}
