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
public class MessageFileIdEntity implements Serializable {
	private static final long serialVersionUID = 2329443537929536693L;
	@Column(name = "message_id", nullable = false)
	private Long messageId;

	@Column(name = "file_id", nullable = false)
	private Long fileId;

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
		MessageFileIdEntity entity = (MessageFileIdEntity) o;
		return Objects.equals(this.messageId, entity.messageId) &&
			  Objects.equals(this.fileId, entity.fileId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(messageId, fileId);
	}

}