package com.project.login.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.login.repo.UserLoginDataRegisterRepo;
import com.project.login.schema.UserLoginRegister;

@Service
public class MyUserDetailLoginRegisterService {
    
    private final  UserLoginDataRegisterRepo userRepo;

    public MyUserDetailLoginRegisterService(UserLoginDataRegisterRepo userRepo){
        this.userRepo = userRepo;
    }
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public String registerUser(UserLoginRegister request){
        if (request == null) {
            return "Invalid request";
        }
        //this is High Security UnComment these to get some
        //String password = request.getPassword();
        // if (password == null || password.length() < 8) {
        //     return "Password must be at least 8 characters";
        // }
        // if (!password.matches(".*[A-Z].*"))
        //     return "Password must contain an uppercase letter";
        // if (!password.matches(".*[a-z].*"))
        //     return "Password must contain a lowercase letter";
        // if (!password.matches(".*\\d.*"))
        //     return "Password must contain a digit";
        // if (!password.matches(".*[@#$%^&+=!].*"))
        //     return "Password must contain a special character";

        String email = request.getUserEmail();
        if (email == null || email.isBlank()) {
            return "Email is required";
        }
        if (userRepo.findByUserEmail(email) != null) {
            return "User already exists";
        }

        UserLoginRegister user = new UserLoginRegister();
        user.setUserName(request.getUserName());
        user.setUserEmail(request.getUserEmail());
        user.setPassword(encoder.encode(request.getPassword()));


        userRepo.save(user);
        return "Signup Successfully";
    }

}
