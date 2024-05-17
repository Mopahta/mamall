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
@Table(name = "user_acc_state", schema = "mamall")
public class UserAccState {
	@EmbeddedId
	private UserAccStateId id;

	@MapsId("userId")
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.RESTRICT)
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity user;

	@MapsId("accStateId")
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	@JoinColumn(name = "acc_state_id", nullable = false)
	private AccStateEntity accState;

	@Column(name = "state_until")
	private Instant stateUntil;

}