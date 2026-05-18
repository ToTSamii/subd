package com.example.demo.services.AuthServices;

import java.util.Date;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.requestDto.LoginRequest;
import com.example.demo.dtos.requestDto.RequestRegister;
import com.example.demo.dtos.responseDto.LoginResponse;
import com.example.demo.dtos.responseDto.UserResponse;
import com.example.demo.entities.Role;
import com.example.demo.entities.Student;
import com.example.demo.entities.User;
import com.example.demo.repositories.StudentRepository;
import com.example.demo.repositories.UserRepository;


@Service
public class AuthService {

    private AuthenticationManager authenticationManager;
    private CustomUserDetailsService сustomUserDetailsService;
    private JwtService jwtService;
    private UserRepository userRepository;
    private StudentRepository studentRepository;

    public AuthService(AuthenticationManager authenticationManager, 
                        CustomUserDetailsService customUserDetailsService, 
                        JwtService jwtService,
                        UserRepository userRepository,
                        StudentRepository studentRepository) {

        this.authenticationManager = authenticationManager;
        this.сustomUserDetailsService = customUserDetailsService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;

    }


    //Сервис обработки /auth/login
    public ResponseEntity<?> login(LoginRequest loginRequest) {

        try {

            String login = loginRequest.getLogin();
            String password = loginRequest.getPassword();

            if (login == null || password == null) {

                throw new Exception();

            }

            // Аутентификация
            Authentication authentication = authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                    login,
                    password

                )

            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);

            //Получаем пользователя
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            //Получаем роль
            String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .findFirst()
                .orElse("USER");
            
            System.out.println(role);
            
            // Генерируем JWT 
            String accessToken = jwtService.generateAccessToken(userDetails.getUsername(), role);
            UserResponse userInfo = сustomUserDetailsService.getUserInfo(loginRequest.getLogin());
            
            System.out.println("Auth token created: " + accessToken);

            return ResponseEntity.ok(new LoginResponse(

                accessToken,
                jwtService.accessExpiration,
                userInfo
                
            ));
            
        } catch (AuthenticationException e) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("AUTH_INVALID_CREDENTIALS Неверный логин или пароль!");

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("VALIDATION_ERROR Логин или пароль невалиден!");

        }

    }


    //Сервис обработки /auth/register
    @Transactional
    public ResponseEntity<?> register(RequestRegister requestRegister) {

        try {

            User user = new User();
            user.setLogin(requestRegister.getLogin());
            user.setPassword(requestRegister.getPassword());
            user.setEmail(requestRegister.getEmail());
            user.setPhoto(requestRegister.getPhoto());
            user.setRegistrationDate(new Date());

            Role role = new Role();
            role.setCode(1);
            role.setName("Студент");

            user.setRole(role);

            Student student = new Student();
            student.setFirstName(requestRegister.getFirstName());
            student.setLastName(requestRegister.getLastName());
            student.setMiddleName(requestRegister.getMiddleName());
            student.setBirthDate(requestRegister.getBirthDate());
            student.setUser(user);

            userRepository.save(user);
            studentRepository.save(student);

            return ResponseEntity.ok(student);

        } catch (Exception e) {

            return ResponseEntity.status(500).body("REGISTRATION_ERROR Ошибка регистрации" + e);

        }

    }


    //Сервис обработки /auth/me
    @Transactional
    public ResponseEntity<?> me(String token) {

        try {

            String login = jwtService.parseLogin(token.substring(7));

            User user = userRepository.findByLogin(login).orElse(null);

            if (user != null) {

                return ResponseEntity.ok(user);

            } else {

                return ResponseEntity.status(404).body("Пользователь не найден!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("SERVER_ERROR Ошибка сервера!");

        }

    }
    
}