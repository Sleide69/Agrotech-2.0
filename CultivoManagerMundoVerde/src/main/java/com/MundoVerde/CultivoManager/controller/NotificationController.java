package com.MundoVerde.CultivoManager.controller;

import com.MundoVerde.CultivoManager.Models.Notificacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificationController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/enviar")
    public void enviarNotificacion(@RequestParam String mensaje, @RequestParam String tipo) {
        Notificacion notificacion = new Notificacion(mensaje, tipo, LocalDateTime.now());
        simpMessagingTemplate.convertAndSend("/topic/notificaciones", notificacion);
    }
}
