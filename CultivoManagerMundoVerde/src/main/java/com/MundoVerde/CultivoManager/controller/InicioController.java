package com.MundoVerde.CultivoManager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class InicioController {

    @GetMapping("/")
    // @ResponseBody
    public String inicio() {
        return "inicio"; 
    }
}
