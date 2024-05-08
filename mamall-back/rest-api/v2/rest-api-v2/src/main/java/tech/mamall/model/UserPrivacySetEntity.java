package tech.mamall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "user_privacy_sets", schema = "mamall")
public class UserPrivacySetEntity {
	@Id
	@Column(name = "user_id", nullable = false)
	private Long id;

	@MapsId
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.RESTRICT)
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity users;

	@Column(name = "room_invite_not_contact_allowed")
	private Short roomInviteNotContactAllowed;

}