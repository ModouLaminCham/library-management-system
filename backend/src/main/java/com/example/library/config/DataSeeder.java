package com.example.library.config;

import com.example.library.model.*;
import com.example.library.repository.BookRepository;
import com.example.library.repository.MemberRepository;
import com.example.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    // Overridable via ADMIN_USERNAME / ADMIN_PASSWORD env vars so a real
    // deployment doesn't ship with a publicly-documented default password.
    @Value("${library.app.adminUsername:admin}")
    private String adminUsername;

    @Value("${library.app.adminPassword:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        seedSampleBooks();
        seedSampleMembers();
    }

    private void seedAdminUser() {
        if (userRepository.count() == 0) {
            Set<Role> roles = new HashSet<>();
            roles.add(Role.ROLE_ADMIN);
            roles.add(Role.ROLE_USER);

            User admin = User.builder()
                    .username(adminUsername)
                    .email("admin@chamlib.com")
                    .password(passwordEncoder.encode(adminPassword))
                    .roles(roles)
                    .build();

            userRepository.save(admin);
            System.out.println("Admin user seeded: username=" + adminUsername
                    + ", password=" + adminPassword
                    + " (override via ADMIN_USERNAME / ADMIN_PASSWORD env vars in production)");
        }
    }

    private void seedSampleBooks() {
        if (bookRepository.count() == 0) {
            Book[] books = {
                new Book(null, "The Great Gatsby", "F. Scott Fitzgerald", "978-0-7432-7356-5", "Fiction", 1925, "A classic American novel about the Jazz Age.", true, null),
                new Book(null, "To Kill a Mockingbird", "Harper Lee", "978-0-06-112008-4", "Fiction", 1960, "A powerful story about racial injustice and childhood.", true, null),
                new Book(null, "1984", "George Orwell", "978-0-452-28423-4", "Dystopian", 1949, "A dystopian social science fiction novel.", true, null),
                new Book(null, "Pride and Prejudice", "Jane Austen", "978-0-14-143951-8", "Romance", 1813, "A romantic novel of manners.", true, null),
                new Book(null, "The Catcher in the Rye", "J.D. Salinger", "978-0-316-76948-0", "Fiction", 1951, "A controversial novel about teenage rebellion.", true, null),
                new Book(null, "Harry Potter and the Philosopher's Stone", "J.K. Rowling", "978-0-7475-3269-9", "Fantasy", 1997, "The first book in the Harry Potter series.", true, null),
                new Book(null, "The Lord of the Rings", "J.R.R. Tolkien", "978-0-544-00203-5", "Fantasy", 1954, "An epic high-fantasy novel.", true, null),
                new Book(null, "Dune", "Frank Herbert", "978-0-441-17271-9", "Science Fiction", 1965, "A science fiction epic.", true, null),
                new Book(null, "The Hitchhiker's Guide to the Galaxy", "Douglas Adams", "978-0-345-39180-3", "Science Fiction", 1979, "A comedic science fiction series.", true, null),
                new Book(null, "Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "978-0-06-231609-7", "Non-Fiction", 2011, "A book about the history of humankind.", true, null)
            };

            for (Book book : books) {
                bookRepository.save(book);
            }
            System.out.println("Sample books seeded: " + books.length + " books");
        }
    }

    private void seedSampleMembers() {
        if (memberRepository.count() == 0) {
            Member[] members = {
                new Member(null, "Alice Johnson", "alice@example.com", "+1-555-0101", "123 Main St, Anytown, USA", true, null),
                new Member(null, "Bob Smith", "bob@example.com", "+1-555-0102", "456 Oak Ave, Somewhere, USA", true, null),
                new Member(null, "Carol Williams", "carol@example.com", "+1-555-0103", "789 Pine Rd, Elsewhere, USA", true, null),
                new Member(null, "David Brown", "david@example.com", "+1-555-0104", "321 Elm St, Nowhere, USA", true, null),
                new Member(null, "Eva Davis", "eva@example.com", "+1-555-0105", "654 Maple Ln, Anywhere, USA", true, null)
            };

            for (Member member : members) {
                memberRepository.save(member);
            }
            System.out.println("Sample members seeded: " + members.length + " members");
        }
    }
}
