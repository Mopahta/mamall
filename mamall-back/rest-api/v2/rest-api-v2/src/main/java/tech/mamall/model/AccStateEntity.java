package tech.mamall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "acc_states", schema = "mamall")
public class AccStateEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "acc_state_id", nullable = false)
	private Integer id;

	@Column(name = "description", length = 60)
	private String description;

}