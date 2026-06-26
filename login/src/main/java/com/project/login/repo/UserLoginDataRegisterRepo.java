package com.project.login.repo;


import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.project.login.schema.UserLoginRegister;

@Repository
public interface  UserLoginDataRegisterRepo extends MongoRepository<UserLoginRegister , String>{

    UserLoginRegister findByUserEmail(String userEmail);
    
}
