import {IRoomManagerServer} from "./Messages/generated/messages_grpc_pb";
import {
    ClientToServerMessage, ItemEventMessage,
    JoinRoomMessage, PlayGlobalMessage, PusherToBackMessage, QueryJitsiJwtMessage, ReportPlayerMessage,
    RoomJoinedMessage,
    ServerToClientMessage, SilentMessage, UserMovesMessage, ViewportMessage, WebRtcSignalToServerMessage
} from "./Messages/generated/messages_pb";
import grpc, {ServerWritableStream} from "grpc";
import {Empty} from "google-protobuf/google/protobuf/empty_pb";
import {socketManager} from "./Services/SocketManager";
import {emitError} from "./Services/IoSocketHelpers";
import {User, UserSocket} from "./Model/User";
import {GameRoom} from "./Model/GameRoom";

const roomManager: IRoomManagerServer = {
    joinRoom: (call: UserSocket): void => {
        try {
            let room: GameRoom|null;
            let user: User|null;

            call.on('data', (message: PusherToBackMessage) => {
                if (room === null || user === null) {
                    if (message.hasJoinroommessage()) {
                        const {room: gameRoom, user: myUser} = socketManager.handleJoinRoom(call, message.getJoinroommessage() as JoinRoomMessage);
                        room = gameRoom;
                        user = myUser;
                    } else {
                        throw new Error('The first message sent MUST be of type JoinRoomMessage');
                    }
                } else {
                    if (message.hasJoinroommessage()) {
                        throw new Error('Cannot call JoinRoomMessage twice!');
                    /*} else if (message.hasViewportmessage()) {
                        socketManager.handleViewport(client, message.getViewportmessage() as ViewportMessage);*/
                    } else if (message.hasUsermovesmessage()) {
                        socketManager.handleUserMovesMessage(room, user, message.getUsermovesmessage() as UserMovesMessage);
                        /*} else if (message.hasSetplayerdetailsmessage()) {
                            socketManager.handleSetPlayerDetails(client, message.getSetplayerdetailsmessage() as SetPlayerDetailsMessage);*/
                    } else if (message.hasSilentmessage()) {
                        socketManager.handleSilentMessage(room, user, message.getSilentmessage() as SilentMessage);
                    } else if (message.hasItemeventmessage()) {
                        socketManager.handleItemEvent(room, user, message.getItemeventmessage() as ItemEventMessage);
                    } else if (message.hasWebrtcsignaltoservermessage()) {
                        socketManager.emitVideo(room, user, message.getWebrtcsignaltoservermessage() as WebRtcSignalToServerMessage);
                    } else if (message.hasWebrtcscreensharingsignaltoservermessage()) {
                        socketManager.emitScreenSharing(room, user, message.getWebrtcscreensharingsignaltoservermessage() as WebRtcSignalToServerMessage);
                    } else if (message.hasPlayglobalmessage()) {
                        socketManager.emitPlayGlobalMessage(room, message.getPlayglobalmessage() as PlayGlobalMessage);
                    /*} else if (message.hasReportplayermessage()){
                        socketManager.handleReportMessage(client, message.getReportplayermessage() as ReportPlayerMessage);*/
                    } else if (message.hasQueryjitsijwtmessage()){
                        socketManager.handleQueryJitsiJwtMessage(user, message.getQueryjitsijwtmessage() as QueryJitsiJwtMessage);
                    } else {
                        throw new Error('Unhandled message type');
                    }
                }

            });

            call.on('end', () => {
                if (user !== null && room !== null) {
                    socketManager.leaveRoom(room, user);
                }
                call.end();
                room = null;
                user = null;
            });

            call.on('error', (err: Error) => {
                console.error('An error occurred in joinRoom stream:', err);
            });
        } catch (e) {
            emitError(call, e);
            call.end();
        }
    }
};

export {roomManager};