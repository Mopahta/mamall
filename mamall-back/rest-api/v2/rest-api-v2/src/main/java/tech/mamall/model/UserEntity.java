package tech.mamall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;

@Getter
@Setter
@Entity
@Table(name = "users", schema = "mamall")
public class UserEntity implements UserDetails {
	@Id
	@Column(name = "user_id", nullable = false)
	private Long id;

	@Column(name = "username", nullable = false, length = 45)
	private String username;

	@Column(name = "password", nullable = false, length = 65)
	private String password;

	@Column(name = "refresh_token", length = 200)
	private String refreshToken;

	@Column(name = "email", length = 45)
	private String email;

	@Column(name = "date_registered", nullable = false)
	private Instant dateRegistered;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@OnDelete(action = OnDeleteAction.RESTRICT)
	@JoinColumn(name = "online_status_id", nullable = false)
	private OnlineStatusEntity onlineStatus;

	@Column(name = "icon_file_id")
	private Integer iconFileId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_role_id", nullable = false)
	private UserRoleEntity userRole;

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Collections.singleton(new SimpleGrantedAuthority(userRole.getDescription()));
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public String getPassword() {
		return password;
	}
}