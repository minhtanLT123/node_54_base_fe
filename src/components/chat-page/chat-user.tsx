"use client"; // Ensure this directive is at the top of the file

import { SOCKET_CHAT_MES } from "@/constant/chat.constant";
import { useSocket } from "@/hooks/socket.hook";
import { TAllmessage, TStateChat } from "@/types/chat.type";
import { Divider, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import MessageHeader from "../chat/chat-user-item/message-header/MessageHeader";
import MessageInput from "../chat/chat-user-item/message-input/MessageInput";
import MessageList from "../chat/chat-user-item/message-list/MessageList";

type TProps = {
    stateChat: TStateChat;
};

export default function ChatUser({ stateChat }: TProps) {
    const { socket } = useSocket();
    const [dataSendMessage, setDataSendMessage] = useState<TAllmessage>({} as TAllmessage);

    useEffect(() => {
        if (!socket) return;
        const handler = (data: TAllmessage) => {
            if (data.chatGroupId === stateChat.chatGroupId) {
                setDataSendMessage(data);
            }
        };
        socket.on(SOCKET_CHAT_MES.SEND_MESSAGE, handler);
        return () => {
            socket.off(SOCKET_CHAT_MES.SEND_MESSAGE, handler);
        };
    }, [socket, stateChat.chatGroupId]);

    return (
        <Stack sx={{ height: "100%", overflow: "hidden" }}>
            <MessageHeader stateChat={stateChat} />
            <Divider />
            <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
                <MessageList stateChat={stateChat} dataSendMessage={dataSendMessage} />
            </div>
            <Divider />
            <MessageInput stateChat={stateChat} />
        </Stack>
    );
}
