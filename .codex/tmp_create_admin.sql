insert into "User" ("id", "email", "name", "passwordHash", "role", "createdAt", "updatedAt")
values ('admin-primary-user', 'admin@folqen.app', 'Folqen Admin', '$2b$12$53v8EJ.3IidRhhytCaANHu.eq1jdc03tSfdT03DMJpJNCENEUuxGq', 'ADMIN', '2026-05-14 08:05:39', '2026-05-14 08:05:39')
on conflict ("email") do update
set "name" = excluded."name",
    "passwordHash" = excluded."passwordHash",
    "role" = 'ADMIN',
    "updatedAt" = excluded."updatedAt";
