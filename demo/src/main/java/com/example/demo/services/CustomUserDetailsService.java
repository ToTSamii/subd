package com.example.demo.services;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.responseDto.UserResponse;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;


@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    private UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {

        this.userRepository = userRepository;

    }
    
    
    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {

        User user = userRepository.findByLogin(login)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String role = user.getRole().getName();
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
        
        return org.springframework.security.core.userdetails.User
            .builder()
            .username(user.getLogin())
            .password(user.getPassword())
            .authorities(Collections.singletonList(authority))
            .build();

    }


    @Transactional
    public User findByLogin(String login) {

        return userRepository.findByLogin(login)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + login));

    }


    @Transactional(readOnly = true)
    public UserResponse getUserInfo(String login) {

        User user = findByLogin(login);
        return convertToResponse(user);

    }


    private UserResponse convertToResponse(User user) {

        return new UserResponse(

            user.getUserId(),
            user.getLogin(),
            user.getEmail(),
            user.getRole().getName()
                  
        );
        
    }

}