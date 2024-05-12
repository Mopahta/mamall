package tech.mamall.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tech.mamall.dto.response.ContactsDto;
import tech.mamall.model.UserEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
	Optional<UserEntity> findByUsername(String username);
	Boolean existsByUsername(String username);
	Boolean existsByEmail(String username);

	@Query("SELECT new tech.mamall.dto.response.ContactsDto(ue2.id, ce.contactNickname, ce.room.id, " +
		  "ce.contactSince, ue2.username, ue2.iconFileId) " +
		  "FROM UserEntity ue " +
		  "INNER JOIN ContactEntity ce " +
		  "ON ue.id = ce.user.id " +
		  "AND ue.id = :id  AND ce.pendingInvite = 0 " +
		  "INNER JOIN UserEntity ue2 " +
		  "ON ce.contact.id = ue2.id")
	List<ContactsDto> findUserContactsById(Long id);
}
