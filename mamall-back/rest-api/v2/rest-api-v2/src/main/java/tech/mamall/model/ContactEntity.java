package tech.mamall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "contacts", schema = "mamall")
public class ContactEntity {
	@EmbeddedId
	private ContactIdEntity id;

	@MapsId("userId")
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.RESTRICT)
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity user;

	@MapsId("contactId")
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	@JoinColumn(name = "contact_id", nullable = false)
	private UserEntity contact;

	@ManyToOne(fetch = FetchType.LAZY)
	@OnDelete(action = OnDeleteAction.SET_NULL)
	@JoinColumn(name = "room_id")
	private RoomEntity room;

	@Column(name = "pending_invite")
	private Short pendingInvite;

	@Column(name = "contact_nickname", length = 45)
	private String contactNickname;

	@Column(name = "contact_since")
	private Instant contactSince;

}