package com.example.demo.repository;

import com.example.demo.model.Message;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndReceiver(User sender, User receiver);

    @Query("SELECT m FROM Message m WHERE (m.sender = ?1 AND m.receiver = ?2) OR (m.sender = ?2 AND m.receiver = ?1) ORDER BY m.sentAt")
    List<Message> findConversation(User user1, User user2);

    List<Message> findByReceiverAndReadFalse(User receiver);
    
    // Récupérer tous les messages non lus envoyés par un utilisateur à un autre
    @Query("SELECT m FROM Message m WHERE m.sender = ?1 AND m.receiver = ?2 AND m.read = false ORDER BY m.sentAt")
    List<Message> findUnreadMessages(User sender, User receiver);
}