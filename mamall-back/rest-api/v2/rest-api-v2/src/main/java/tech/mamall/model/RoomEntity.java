package tech.mamall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "rooms", schema = "mamall")
public class RoomEntity {
	@Id
	@Column(name = "room_id", nullable = false)
	private Long id;

	@Column(name = "name", nullable = false, length = 45)
	private String name;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.RESTRICT)
	@JoinColumn(name = "room_mode_id", nullable = false)
	private RoomModeEntity roomMode;

}