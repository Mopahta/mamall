INSERT INTO mamall.online_statuses
SELECT descrs FROM unnest(ARRAY['offline', 'online', 'away']) descrs