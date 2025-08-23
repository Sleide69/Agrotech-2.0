package com.MundoVerde.CultivoManager;

import org.springframework.boot.web.context.WebServerInitializedEvent;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class ServerPortLogger {

    private int port;

    @EventListener
    public void handleWebServerInitialized(WebServerInitializedEvent event) {
        this.port = event.getWebServer().getPort();
    }

    @EventListener
    public void handleApplicationReady(ApplicationReadyEvent event) {
        System.out.println("\n🌐 SERVIDOR CORRIENDO EN : http://localhost:" + port);
    }
}
