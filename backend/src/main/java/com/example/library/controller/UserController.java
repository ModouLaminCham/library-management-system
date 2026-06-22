package com.example.library.controller;

import com.example.library.model.Role;
import com.example.library.model.User;
import com.example.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> dtos = users.stream().map(UserDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(UserDTO::new)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<?> updateRoles(@PathVariable Long id, @RequestBody Map<String, List<String>> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> strRoles = request.get("roles");
        Set<Role> roles = new HashSet<>();
        if (strRoles != null) {
            strRoles.forEach(role -> {
                switch (role) {
                    case "ROLE_ADMIN":
                        roles.add(Role.ROLE_ADMIN);
                        break;
                    default:
                        roles.add(Role.ROLE_USER);
                }
            });
        }
        if (roles.isEmpty()) {
            roles.add(Role.ROLE_USER);
        }
        user.setRoles(roles);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Roles updated successfully"));
    }

    @PutMapping("/{id}/toggle-enabled")
    public ResponseEntity<?> toggleEnabled(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.getEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", user.getEnabled() ? "User enabled" : "User disabled",
                "enabled", user.getEnabled()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/member-id")
    public ResponseEntity<?> getMemberId(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (user.getMember() != null) {
                        return ResponseEntity.ok(Map.of("memberId", user.getMember().getId()));
                    }
                    return ResponseEntity.ok(Map.of("memberId", null));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    static record UserDTO(Long id, String username, String email, Boolean enabled, List<String> roles, Long memberId) {
        UserDTO(User user) {
            this(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getEnabled(),
                user.getRoles().stream().map(Role::name).collect(Collectors.toList()),
                user.getMember() != null ? user.getMember().getId() : null
            );
        }
    }
}
