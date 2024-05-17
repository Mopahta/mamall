package tech.mamall.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "online_statuses", schema = "mamall")
public class OnlineStatusEntity {
	@Id
	@Column(name = "online_status_id", nullable = false)
	private Integer id;

	@Column(name = "description", length = 60)
	private String description;

}