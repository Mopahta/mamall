package tech.mamall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "room_modes", schema = "mamall")
public class RoomModeEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "mode_id", nullable = false)
	private Integer id;

	@Column(name = "description", length = 60)
	private String description;

}