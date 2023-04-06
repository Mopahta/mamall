INSERT INTO mamall.online_statuses (description)
SELECT descr from UNNEST(ARRAY['offline', 'online', 'away']) descr;

INSERT INTO mamall.acc_states (description)
SELECT descr FROM UNNEST(ARRAY['active', 'suspended', 'hidden', 'deleted']) descr;

INSERT INTO mamall.room_modes (description)
SELECT descr FROM UNNEST(ARRAY['private', 'public']) descr;

INSERT INTO mamall.user_roles (description, role_value) VALUES
('guest', 0), ('cockroach', 1), ('peasant', 2), ('moderator', 150), ('admin', 230), ('creator', 255);