import { useFindAllChatGroup } from "@/api/tantask/user.tanstack";
import Avatar from "@/components/avatar/Avatar";
import { CHAT_NEW_MESSAGE_EVENT } from "@/helpers/chat.helper";
import { animationList } from "@/helpers/function.helper";
import { useAppSelector } from "@/redux/hooks";
import { TAllmessage, TChatGroup, TStateChat } from "@/types/chat.type";
import { Box, Group, Stack, Text } from "@mantine/core";
import { Dispatch, Fragment, SetStateAction, useEffect, useRef, useState } from "react";
import { AppendLoading } from "../data-state/append-state/AppendState";
import NodataOverlay from "../no-data/NodataOverlay";

type TProps = {
    setChat: Dispatch<SetStateAction<TStateChat | null>>;
};

export default function ChatGroupList({ setChat }: TProps) {
    const userId = useAppSelector((state) => state.user.info?.id);
    const [page, setPage] = useState(1);
    const [chatGroups, setChatGroups] = useState<TChatGroup[]>([]);

    const totalPageRef = useRef(0);
    const containerRef = useRef<HTMLDivElement | null>(null);
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

    const findAllChatGroup = useFindAllChatGroup({
        pagination: { page: page, pageSize: 5 },
        filters: {},
        sort: { sortBy: `createdAt`, isDesc: true },
    });

    useEffect(() => {
        if (!findAllChatGroup.data?.items) return;

        const newChatGroups = findAllChatGroup.data.items;

        setChatGroups((prev) => {
            if (page === 1) return newChatGroups;
            return [...prev, ...newChatGroups];
        });
    }, [findAllChatGroup.data?.items]);

    useEffect(() => {
        if (findAllChatGroup.data?.totalPage) totalPageRef.current = findAllChatGroup.data.totalPage;
    }, [findAllChatGroup.data?.totalPage]);

    const handleEndReached = () => {
        if (findAllChatGroup.isFetching || findAllChatGroup.isLoading || page >= totalPageRef.current) return;
        setPage((prev) => prev + 1);
    };

    const handleClickChatGroup = (chatGroup: TChatGroup) => {
        setChat({
            chatGroupId: String(chatGroup.id),
            chatGroupName: chatGroup.name || "",
            chatGroupMembers: (chatGroup.ChatGroupMembers || []).map((member) => ({
                avatar: member.Users?.avatar,
                fullName: member.Users?.fullName,
                roleId: member.Users?.roleId || "",
                userId: String(member.Users?.id || member.userId),
            })),
        });
    };

    return (
        <Stack gap={10} sx={{ height: "100%" }}>
            <div ref={containerRef} className={`relative p-5 gap-5  overflow-y-scroll`}>
                <div>
                    <AppendLoading
                        debug
                        isLoading={findAllChatGroup.isLoading}
                        isEmpty={chatGroups.length === 0}
                        isError={findAllChatGroup.isError}
                        onLoadMore={handleEndReached}
                        containerRef={containerRef}
                        footerLoadingComponent={Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} />
                        ))}
                        initialLoadingComponent={Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} />
                        ))}
                        noDataComponent={<NodataOverlay visible />}
                    >
                        {chatGroups.map((chatGroup, i) => {
                            const user = (chatGroup?.ChatGroupMembers || []).find((user) => String(user.userId) !== String(userId));
                            if (!user) return <Fragment key={i}></Fragment>;
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
                                    {(() => {
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
                                        );
                                    })()}
                                </Box>
                            );
                        })}
                    </AppendLoading>
                </div>
            </div>
        </Stack>
    );
}
