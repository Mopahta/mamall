package tech.mamall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user_roles", schema = "mamall")
public class UserRoleEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "role_id", nullable = false)
	private Integer id;

	@Column(name = "description", length = 60)
	private String description;

	@Column(name = "role_value")
	private Integer roleValue;

	public String getDescription() {
		return description;
	}
}