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
public class ContactIdEntity implements Serializable {
	private static final long serialVersionUID = 1944045173769545929L;
	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "contact_id", nullable = false)
	private Long contactId;

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
		ContactIdEntity entity = (ContactIdEntity) o;
		return Objects.equals(this.contactId, entity.contactId) &&
			  Objects.equals(this.userId, entity.userId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(contactId, userId);
	}

}