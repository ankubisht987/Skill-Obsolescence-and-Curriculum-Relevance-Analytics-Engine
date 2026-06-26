package com.project.login.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.login.repo.UserLoginDataRegisterRepo;
import com.project.login.schema.UserLogIn;
import com.project.login.schema.UserLoginRegister;



@Service
public class MyUserLoginDetailsService implements UserDetailsService{

    private final  UserLoginDataRegisterRepo userRepo;

    public MyUserLoginDetailsService(UserLoginDataRegisterRepo userRepo){
        this.userRepo = userRepo;
    }
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public String loginUser(UserLogIn request) {
        if (request == null || request.getUserEmail() == null || request.getPassword() == null) {
            return "Invalid request";
        }
        UserLoginRegister user = userRepo.findByUserEmail(request.getUserEmail());
        if (user == null) {
            return "User not found";
        }
        if (encoder.matches(request.getPassword(), user.getPassword())){
            return "Login successful";
        }
        return "Invalid password";
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserLoginRegister user = userRepo.findByUserEmail(username);

        if(user == null){
            throw  new UsernameNotFoundException("User not Found");
        }
        // System.out.println("Entered Password = " + request.getPassword());
        // System.out.println("DB Password = " + user.getPassword());
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUserEmail())
            .password(user.getPassword())
            .roles("USER")
            .build();
    }
}
