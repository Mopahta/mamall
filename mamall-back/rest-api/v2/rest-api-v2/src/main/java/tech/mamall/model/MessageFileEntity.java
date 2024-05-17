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
@Table(name = "message_files", schema = "mamall")
public class MessageFileEntity {
	@EmbeddedId
	private MessageFileIdEntity id;

	@MapsId("messageId")
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	@JoinColumn(name = "message_id", nullable = false)
	private RoomMessageEntity message;

	@MapsId("fileId")
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	@JoinColumn(name = "file_id", nullable = false)
	private FileEntity file;

	@Column(name = "date_uploaded")
	private Instant dateUploaded;

	@Column(name = "file_size")
	private Integer fileSize;

}