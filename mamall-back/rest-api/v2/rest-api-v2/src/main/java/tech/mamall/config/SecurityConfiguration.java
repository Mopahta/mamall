package tech.mamall.config;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import tech.mamall.service.UserService;

import java.util.List;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {
	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final UserService userService;
	private final PasswordEncoder passwordEncoder;

	@Value("#{systemProperties['CORSORIGIN'] ?: 'http://localhost:3000'}}")
	private String corsOrigins;

	@Bean
	@SneakyThrows
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http.csrf(AbstractHttpConfigurer::disable)
			  .cors(
				    httpSecurityCorsConfigurer -> httpSecurityCorsConfigurer.configurationSource(
						request -> {
							CorsConfiguration corsConfiguration = new CorsConfiguration();

							if (corsOrigins.contains(",")) {
								corsConfiguration.setAllowedOrigins(
									  List.of(corsOrigins.split(",")));
							}
							else {
								corsConfiguration.setAllowedOrigins(List.of(corsOrigins));
							}
							corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
							corsConfiguration.setAllowedHeaders(List.of("*"));
							corsConfiguration.setAllowCredentials(true);

							return corsConfiguration;
						}))
			  .authorizeHttpRequests(request -> request
				    .requestMatchers("/", "/api/v2/login", "/api/v2/signup", "/api/v2/refresh").permitAll()
				    .anyRequest().authenticated())
			  .sessionManagement(manager -> manager.sessionCreationPolicy(STATELESS))
			  .authenticationProvider(authenticationProvider())
			  .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		authProvider.setUserDetailsService(userService.userDetailsService());
		authProvider.setPasswordEncoder(passwordEncoder);
		return authProvider;
	}

	@Bean
	@SneakyThrows
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) {
		return config.getAuthenticationManager();
	}
}
