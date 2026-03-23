"use client";

import RootPage from "@/components/root-page/RootPage";
import OvertimeRegister from "@/page/overtime/OvertimeRegister";
import { Box } from "@mantine/core";
import HomeLeft from "@/page/home/home-left/HomeLeft";
import HomeRight from "@/page/home/home-right/HomeRight";

export default function page() {
    return (
        <RootPage protect>
            <Box
                sx={(_, u) => {
                    return {
                        display: "grid",
                        [u.largerThan("md")]: {
                            gridTemplateColumns: "250px 1fr 250px",
                        },
                        [u.smallerThan("md")]: {
                            gridTemplateColumns: "1fr",
                        },
                        gap: 20,
                        height: "100%",
                        padding: "20px",
                    };
                }}
            >
                <Box
                    sx={(_, u) => {
                        return {
                            [u.smallerThan("md")]: {
                                display: "none",
                            },
                            [u.largerThan("md")]: {
                                display: "block",
                            },
                        };
                    }}
                >
                    <HomeLeft />
                </Box>

                <Box>
                    <OvertimeRegister />
                </Box>

                <Box
                    sx={(_, u) => {
                        return {
                            [u.smallerThan("md")]: {
                                display: "none",
                            },
                            [u.largerThan("md")]: {
                                display: "block",
                            },
                        };
                    }}
                >
                    <HomeRight />
                </Box>
            </Box>
        </RootPage>
    );
}
