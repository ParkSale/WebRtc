package com.example.WebRtc.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    //Thread프로그래밍 시 동기화 문제 해결하는 list
    List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    //세션에 삭제
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    //세션에 추가
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
    }

    //세션들중 나와 다른 애들에게 전송
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        for(WebSocketSession webSocketSession : sessions){
            if(webSocketSession.isOpen() && !session.getId().equals(webSocketSession.getId())){
                webSocketSession.sendMessage(message);
            }
        }
    }
}
