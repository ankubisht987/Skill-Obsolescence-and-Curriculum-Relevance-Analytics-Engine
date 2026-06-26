package com.project.login.schema;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "userRegistration")
public class UserLoginRegister {
    
    @Id
    private String id;

    private String userName;
    private String userEmail;
    private String password;

    public UserLoginRegister() {
    }


    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    
    public String getUserName() {
        return userName;
    }


    public void setUserName(String userName) {
        this.userName = userName;
    }


    public String getUserEmail() {
        return userEmail;
    }


    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }


    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public UserLoginRegister(String id, String username,String userEmail, String password ) {
        this.id = id;
        this.userName = username;
        this.userEmail = userEmail;
        this.password = password;
    }


    
}
