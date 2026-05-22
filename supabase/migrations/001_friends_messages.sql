-- Friendships table
-- status: 'pending' | 'accepted'
create table if not exists friendships (
  id          text primary key,
  requester_id text not null,
  requestee_id text not null,
  status      text not null default 'pending',
  created_at  float8 not null
);

create unique index if not exists friendships_pair
  on friendships (least(requester_id, requestee_id), greatest(requester_id, requestee_id));

-- Messages table
create table if not exists messages (
  id          text primary key,
  sender_id   text not null,
  receiver_id text not null,
  content     text not null,
  created_at  float8 not null,
  read_at     float8
);

create index if not exists messages_conversation
  on messages (least(sender_id, receiver_id), greatest(sender_id, receiver_id), created_at);
