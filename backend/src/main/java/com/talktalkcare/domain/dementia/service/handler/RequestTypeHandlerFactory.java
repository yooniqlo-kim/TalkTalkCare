package com.talktalkcare.domain.dementia.service.handler;

import com.talktalkcare.domain.dementia.dto.RequestType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class RequestTypeHandlerFactory {

    private final Map<RequestType, RequestTypeHandler> handlerMap;

    @Autowired
    public RequestTypeHandlerFactory(List<RequestTypeHandler> handlers) {
        this.handlerMap = handlers.stream()
                .collect(Collectors.toMap(RequestTypeHandler::getRequestType, handler -> handler));
    }

    public RequestTypeHandler getHandler(RequestType requestType) {
        return handlerMap.get(requestType);
    }
}