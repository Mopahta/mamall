package tech.mamall.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class UserAccStateId implements Serializable {
	private static final long serialVersionUID = 7614402649518836850L;
	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "acc_state_id", nullable = false)
	private Integer accStateId;

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
		UserAccStateId entity = (UserAccStateId) o;
		return Objects.equals(this.accStateId, entity.accStateId) &&
			  Objects.equals(this.userId, entity.userId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(accStateId, userId);
	}

}