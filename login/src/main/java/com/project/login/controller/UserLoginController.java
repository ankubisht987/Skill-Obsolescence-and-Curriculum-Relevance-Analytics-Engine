package com.project.login.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.login.schema.UserLogIn;
import com.project.login.schema.UserLoginRegister;
import com.project.login.service.JwtService;
import com.project.login.service.MyUserDetailLoginRegisterService;
import com.project.login.service.MyUserLoginDetailsService;


@RestController
@RequestMapping("/api/auth")
// @CrossOrigin(origins = "http://localhost:5173")
public class UserLoginController {

   
    private MyUserDetailLoginRegisterService serviceRegister;
    private MyUserLoginDetailsService serviceLogin;
    private final JwtService jwtService;

    public UserLoginController(MyUserDetailLoginRegisterService serviceRegister , 
                                MyUserLoginDetailsService serviceLogin, JwtService jwtService){
        this.serviceRegister =serviceRegister;
        this.serviceLogin = serviceLogin;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public String register(@Validated @RequestBody UserLoginRegister request){
        System.out.println("You enter Successfully");
        return serviceRegister.registerUser(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLogIn login) {  

    String result = serviceLogin.loginUser(login);

    if (!"Login successful".equals(result)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(result);
    }

    String token = jwtService.generateToken(login.getUserEmail());

    return ResponseEntity.ok(Map.of(
            "token", token
    ));
}

}
