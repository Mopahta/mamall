package tech.mamall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "room_message", schema = "mamall")
public class RoomMessageEntity {
	@Id
	@Column(name = "message_id", nullable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "room_id", nullable = false)
	private RoomEntity room;

	@Column(name = "message", length = 300)
	private String message;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sender_id", nullable = false)
	private UserEntity sender;

	@Column(name = "time_sent")
	private Instant timeSent;

	@Column(name = "reply_to_message_id")
	private Long replyToMessageId;

}