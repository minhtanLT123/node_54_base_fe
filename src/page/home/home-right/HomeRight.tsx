"use client";

import { useFindAllChatGroup } from "@/api/tantask/user.tanstack";
import Avatar from "@/components/avatar/Avatar";
import ModalCreateChatGroup from "@/components/modal/modal-create-chat-group/ModalCreateChatGroup";
import NodataOverlay from "@/components/no-data/NodataOverlay";
import ChatGroupSkeleton from "@/components/skeletons/ChatGroupSkeleton";
import { CHAT_NEW_MESSAGE_EVENT, addChatOpened, emitChatNewMessage } from "@/helpers/chat.helper";
import { animationList } from "@/helpers/function.helper";
import { useAppSelector } from "@/redux/hooks";
import { TAllmessage, TChatGroup } from "@/types/chat.type";
import { Box, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Fragment, useEffect, useState } from "react";

type TProps = {
    onClose?: () => void;
};

export default function HomeRight({ onClose }: TProps) {
    const userId = useAppSelector((state) => state.user.info?.id);

    const findAllChatGroup = useFindAllChatGroup({
        pagination: { page: 1, pageSize: 9999 },
        filters: {},
        sort: { sortBy: `createdAt`, isDesc: true },
    });
    const queryClient = useQueryClient();
    const [openedCreateChatGroup, handleModalCreateChatGroup] = useDisclosure(false);
    const [lastMessages, setLastMessages] = useState<Record<string, TAllmessage>>({});

    useEffect(() => {
        const handler = (e: Event) => {
            const msg = (e as CustomEvent<TAllmessage>).detail;
            if (!msg?.chatGroupId) return;
            setLastMessages((prev) => ({ ...prev, [String(msg.chatGroupId)]: msg }));
        };
        window.addEventListener(CHAT_NEW_MESSAGE_EVENT, handler);
        return () => window.removeEventListener(CHAT_NEW_MESSAGE_EVENT, handler);
    }, []);

    const handleClickChatGroup = (chatGroup: TChatGroup) => {
        if (onClose) onClose();
        addChatOpened(
            {
                chatGroupId: chatGroup.id,
                chatGroupName: chatGroup.name || "",
                chatGroupMembers: chatGroup.ChatGroupMembers.map((member) => ({
                    avatar: member.Users.avatar,
                    fullName: member.Users.fullName,
                    roleId: member.Users.roleId || "",
                    userId: String(member.Users.id),
                })),
            },
            () => {
                queryClient.invalidateQueries({ queryKey: [`chat-list-user-item`] });
                queryClient.invalidateQueries({ queryKey: [`chat-list-user-bubble`] });
            },
        );
    };

    const handleCreateChatGroup = () => {
        handleModalCreateChatGroup.open();
    };

    return (
        <>
            <Stack style={{ height: `calc(100vh - ( 20px + 20px + var(--height-header))` }}>
                {/* chat 1-1 */}
                <Box
                    onClick={handleCreateChatGroup}
                    sx={{
                        cursor: "pointer",
                        ...animationList(0),
                        "&:hover": { backgroundColor: `var(--mantine-color-gray-light-hover)` },
                        transition: `background-color 0.2s ease`,
                        padding: `5px`,
                        borderRadius: `10px`,
                    }}
                >
                    <Group wrap="nowrap" gap={5}>
                        <Box
                            sx={{
                                width: `38px`,
                                height: `38px`,
                                position: `relative`,
                                flexShrink: 0,
                                display: `flex`,
                                alignItems: `center`,
                                justifyContent: `center`,
                                borderRadius: `50%`,
                                backgroundColor: `var(--mantine-color-gray-light-hover)`,
                            }}
                        >
                            <IconPlus style={{ width: "60%", height: "60%" }} stroke={2.5} />
                        </Box>
                        <Text truncate>Create Group</Text>
                    </Group>
                </Box>

                <Stack
                    sx={{
                        overflow: "auto",
                        height: `100%`,
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {
                            display: "none",
                        },
                        position: `relative`,
                        gap: 5,
                    }}
                >
                    {findAllChatGroup.isPending && <ChatGroupSkeleton />}
                    <NodataOverlay
                        width={50}
                        visible={
                            !findAllChatGroup.isPending &&
                            (!findAllChatGroup.data || findAllChatGroup.data?.items?.length === 0 || findAllChatGroup.isError)
                        }
                    />
                    {(findAllChatGroup.data?.items || []).map((chatGroup, i) => {
                        const user = (chatGroup?.ChatGroupMembers || []).find((user) => String(user.userId) !== String(userId));
                        // console.log(user);
                        if (!user) return <Fragment key={i}></Fragment>;

                        if ((chatGroup?.ChatGroupMembers?.length ?? 0) > 2) {
                            const lastMsg =
                                lastMessages[String(chatGroup.id)] ||
                                (chatGroup.ChatMessages?.[0]
                                    ? {
                                          messageText: chatGroup.ChatMessages[0].messageText || "",
                                          chatGroupId: String(chatGroup.id),
                                          userIdSender: String(chatGroup.ChatMessages[0].userIdSender),
                                          createdAt: String(chatGroup.ChatMessages[0].createdAt),
                                      }
                                    : null);
                            return (
                                <Box
                                    key={i}
                                    onClick={() => {
                                        handleClickChatGroup(chatGroup);
                                    }}
                                    sx={{
                                        cursor: "pointer",
                                        ...animationList(i),
                                        "&:hover": { backgroundColor: `var(--mantine-color-gray-light-hover)` },
                                        transition: `background-color 0.2s ease`,
                                        padding: `5px`,
                                        borderRadius: `10px`,
                                    }}
                                >
                                    <Group wrap="nowrap" gap={5}>
                                        <Box sx={{ width: `38px`, height: `38px`, position: `relative`, flexShrink: 0 }}>
                                            {chatGroup.ChatGroupMembers.slice(0, 2).map((member, i) => (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        position: `absolute`,
                                                        ...(i === 0 ? { bottom: 0, left: 0, zIndex: 2 } : { top: 0, right: 0, zIndex: 1 }),
                                                    }}
                                                >
                                                    <Avatar size={`sm`} fullName={member.Users.fullName} avatar={member.Users.avatar} radius="xl" />
                                                </Box>
                                            ))}
                                        </Box>
                                        <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
                                            <Text truncate fw={500} size="sm">
                                                {chatGroup.name}
                                            </Text>
                                            {lastMsg && (
                                                <Text truncate size="xs" c="dimmed">
                                                    {lastMsg.messageText}
                                                </Text>
                                            )}
                                        </Stack>
                                    </Group>
                                </Box>
                            );
                        }
                        const lastMsg =
                            lastMessages[String(chatGroup.id)] ||
                            (chatGroup.ChatMessages?.[0]
                                ? {
                                      messageText: chatGroup.ChatMessages[0].messageText || "",
                                      chatGroupId: String(chatGroup.id),
                                      userIdSender: String(chatGroup.ChatMessages[0].userIdSender),
                                      createdAt: String(chatGroup.ChatMessages[0].createdAt),
                                  }
                                : null);
                        return (
                            <Box
                                key={i}
                                onClick={() => {
                                    handleClickChatGroup(chatGroup);
                                }}
                                sx={{
                                    cursor: "pointer",
                                    ...animationList(i),
                                    "&:hover": { backgroundColor: `var(--mantine-color-gray-light-hover)` },
                                    transition: `background-color 0.2s ease`,
                                    padding: `5px`,
                                    borderRadius: `10px`,
                                }}
                            >
                                <Group wrap="nowrap" gap={5}>
                                    <Box sx={{ flexShrink: 0 }}>
                                        <Avatar size="md" fullName={user.Users?.fullName} avatar={user.Users?.avatar} />
                                    </Box>
                                    <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
                                        <Text truncate fw={500} size="sm">
                                            {user.Users?.fullName}
                                        </Text>
                                        {lastMsg && (
                                            <Text truncate size="xs" c="dimmed">
                                                {lastMsg.messageText}
                                            </Text>
                                        )}
                                    </Stack>
                                </Group>
                            </Box>
                        );
                    })}
                </Stack>
            </Stack>
            <ModalCreateChatGroup opened={openedCreateChatGroup} close={handleModalCreateChatGroup.close} />
        </>
    );
}
