package com.project.login.service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String SECRET =
        "6ce9bd3c51997f7ccae6d9f6f5f60266dbdce0518582418415e8365af54779a4";

    private Key getKey() {
        return Keys.hmacShaKeyFor(
            SECRET.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(getKey(),SignatureAlgorithm.HS512)
                .compact();
    }
}