package tech.mamall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "files", schema = "mamall")
public class FileEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "file_id", nullable = false)
	private Long id;

	@Column(name = "file_url", length = 256)
	private String fileUrl;

	@Column(name = "file_path", length = 256)
	private String filePath;

	@Column(name = "time_uploaded")
	private Instant timeUploaded;

}