"use client";

import { SOCKET_CHAT_MES } from "@/constant/chat.constant";
import { CHAT_BUBBLE, CHAT_OPENED } from "@/constant/chat.constant";
import {
    CHAT_BOXES_UPDATED_EVENT,
    CHAT_NEW_MESSAGE_EVENT,
    emitChatNewMessage,
    getChatOpened,
    listenToEvent,
    removeEventListener,
} from "@/helpers/chat.helper";
import { useSocket } from "@/hooks/socket.hook";
import { TAllmessage, TStateChat } from "@/types/chat.type";
import _ from "lodash";
import { useEffect, useState } from "react";
import ChatUserBubble from "../chat-user-bubble/ChatUserBubble";
import ChatUserItem from "../chat-user-item/ChatUserItem";

export default function ChatContainer() {
    const [chatListUserItem, setChatListUserItem] = useState<TStateChat[]>([]);
    const [chatListUserBubble, setChatListUserBubble] = useState<TStateChat[]>([]);

    const [dataSendMessages, setDataSendMessages] = useState<{ [key: string]: TAllmessage }>({});

    const { socket } = useSocket();

    useEffect(() => {
        const syncChatBoxes = () => {
            setChatListUserItem(getChatOpened(CHAT_OPENED).slice(0, 2));
            setChatListUserBubble(getChatOpened(CHAT_BUBBLE));
        };

        syncChatBoxes();
        window.addEventListener("storage", syncChatBoxes);
        window.addEventListener("focus", syncChatBoxes);
        window.addEventListener(CHAT_BOXES_UPDATED_EVENT, syncChatBoxes);

        return () => {
            window.removeEventListener("storage", syncChatBoxes);
            window.removeEventListener("focus", syncChatBoxes);
            window.removeEventListener(CHAT_BOXES_UPDATED_EVENT, syncChatBoxes);
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        listenToEvent(socket, SOCKET_CHAT_MES.SEND_MESSAGE, (data: TAllmessage) => {
            setDataSendMessages((prev) => {
                return {
                    ...prev,
                    [data.chatGroupId]: data,
                };
            });
            emitChatNewMessage(data);
        });

        return () => {
            if (!socket) return;
            removeEventListener(socket, SOCKET_CHAT_MES.SEND_MESSAGE);
        };
    }, [socket]);

    return (
        <>
            {_.isArray(chatListUserItem) &&
                chatListUserItem.map((stateChat: TStateChat, i) => {
                    return (
                        <ChatUserItem
                            key={`${stateChat.chatGroupId}`}
                            stateChat={stateChat}
                            i={i}
                            dataSendMessage={dataSendMessages[stateChat.chatGroupId]}
                        />
                    );
                })}
            {_.isArray(chatListUserBubble) &&
                chatListUserBubble.map((stateChat: TStateChat, i) => {
                    return <ChatUserBubble key={`${stateChat.chatGroupId}`} stateChat={stateChat} i={i} />;
                })}
        </>
    );
}
