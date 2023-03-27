CREATE TABLE IF NOT EXISTS online_statuses (
  online_status_id SERIAL,
  description VARCHAR(60) NULL,
  PRIMARY KEY (online_status_id));

CREATE TABLE IF NOT EXISTS users (
  user_id BIGSERIAL,
  username VARCHAR(45) NOT NULL UNIQUE,
  password VARCHAR(65) NOT NULL,
  email VARCHAR(45) NULL,
  date_registered TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  online_status_id INT NOT NULL DEFAULT 1,
  icon_file_id INT NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_users_table11
    FOREIGN KEY (online_status_id)
    REFERENCES online_statuses (online_status_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS contacts (
  user_id BIGINT NOT NULL,
  contact_id BIGINT NOT NULL,
  contact_nickname VARCHAR(45) NULL,
  contact_since TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (user_id <> contact_id),
  PRIMARY KEY (user_id, contact_id),
  CONSTRAINT fk_contacts_users
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_contacts_users1
    FOREIGN KEY (contact_id)
    REFERENCES users (user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS room_modes (
  mode_id SERIAL,
  description VARCHAR(60) NULL,
  PRIMARY KEY (mode_id));

CREATE TABLE IF NOT EXISTS rooms (
  room_id BIGSERIAL,
  name VARCHAR(45) NOT NULL,
  room_mode_id INT NOT NULL DEFAULT 1,
  PRIMARY KEY (room_id),
  CONSTRAINT fk_rooms_room_modes1
    FOREIGN KEY (room_mode_id)
    REFERENCES room_modes (mode_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS acc_states (
  acc_state_id SERIAL,
  description VARCHAR(60) NULL,
  PRIMARY KEY (acc_state_id));

CREATE TABLE IF NOT EXISTS user_room_roles (
  role_id SERIAL,
  description VARCHAR(60) NULL,
  role_value INT NULL,
  PRIMARY KEY (role_id));

CREATE TABLE IF NOT EXISTS room_user (
  room_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  user_room_nickname VARCHAR(45) NULL,
  user_role_id INT NOT NULL DEFAULT 1,
  PRIMARY KEY (room_id, user_id),
  CONSTRAINT fk_room_user_rooms1
    FOREIGN KEY (room_id)
    REFERENCES rooms (room_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_room_user_users1
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_room_user_user_room_roles1
    FOREIGN KEY (user_role_id)
    REFERENCES user_room_roles (role_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE IF NOT EXISTS user_acc_state (
  user_id BIGINT NOT NULL,
  acc_state_id INT NOT NULL,
  state_until TIMESTAMP NULL,
  PRIMARY KEY (user_id, acc_state_id),
  CONSTRAINT fk_user_acc_state_users1
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_user_acc_state_acc_states1
    FOREIGN KEY (acc_state_id)
    REFERENCES acc_states (acc_state_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS user_privacy_sets (
  user_id BIGINT NOT NULL UNIQUE,
  room_invite_not_contact_allowed SMALLINT DEFAULT 0,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_user_privacy_sets_users1
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS files (
  file_id  BIGSERIAL,
  file_url VARCHAR(256) NULL,
  file_path VARCHAR(256) NULL,
  PRIMARY KEY (file_id));

CREATE TABLE IF NOT EXISTS user_icon (
  user_id BIGINT NOT NULL,
  file_id BIGINT NOT NULL,
  active SMALLINT NULL DEFAULT 0,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_user_icon_user_files1
    FOREIGN KEY (file_id)
    REFERENCES files (file_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_user_icon_users2
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS room_message (
  message_id BIGSERIAL,
  room_id BIGINT NOT NULL,
  message VARCHAR(300) NULL,
  sender_id BIGINT NOT NULL,
  time_sent TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  reply_to_message_id BIGINT NULL,
  PRIMARY KEY (message_id),
  CONSTRAINT fk_room_message_users1
    FOREIGN KEY (sender_id)
    REFERENCES users (user_id)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT fk_room_message_rooms1
    FOREIGN KEY (room_id)
    REFERENCES rooms (room_id)
    ON DELETE NO ACTION
    ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS message_files (
  message_id BIGINT NOT NULL,
  file_id BIGINT NOT NULL,
  date_uploaded TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  file_size INT NULL,
  PRIMARY KEY (message_id, file_id),
  CONSTRAINT fk_message_files_room_message1
    FOREIGN KEY (message_id)
    REFERENCES room_message (message_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_message_files_files1
    FOREIGN KEY (file_id)
    REFERENCES files (file_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);