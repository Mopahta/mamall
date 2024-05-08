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
public class RoomUserIdEntity implements Serializable {
	private static final long serialVersionUID = -6158577155944673975L;
	@Column(name = "room_id", nullable = false)
	private Long roomId;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
		RoomUserIdEntity entity = (RoomUserIdEntity) o;
		return Objects.equals(this.userId, entity.userId) &&
			  Objects.equals(this.roomId, entity.roomId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(userId, roomId);
	}

}