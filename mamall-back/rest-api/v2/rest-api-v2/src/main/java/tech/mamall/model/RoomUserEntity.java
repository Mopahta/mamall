package tech.mamall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "room_user", schema = "mamall")
public class RoomUserEntity {
	@EmbeddedId
	private RoomUserIdEntity id;

	@MapsId("roomId")
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	@JoinColumn(name = "room_id", nullable = false)
	private RoomEntity room;

	@MapsId("userId")
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.RESTRICT)
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity user;

	@Column(name = "user_room_nickname", length = 45)
	private String userRoomNickname;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_role_id", nullable = false)
	private UserRoleEntity userRole;

}