from flask import Flask, jsonify, request
import requests as http
from dotenv import load_dotenv
import os
import time
import uuid
import bcrypt
import jwt
from functools import wraps
from datetime import datetime, timedelta, timezone

load_dotenv()

app = Flask(__name__)

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

def sb_headers(extra=None):
    h = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if extra:
        h.update(extra)
    return h

def sb_get(table, params=None):
    r = http.get(f"{SUPABASE_URL}/rest/v1/{table}", headers=sb_headers(), params=params)
    r.raise_for_status()
    return r.json()

def sb_insert(table, doc):
    r = http.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=sb_headers({"Prefer": "return=representation"}),
        json=doc,
    )
    r.raise_for_status()
    return r.json()

def sb_upsert(table, doc, on_conflict):
    r = http.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=sb_headers({"Prefer": f"resolution=merge-duplicates,return=representation"}),
        params={"on_conflict": on_conflict},
        json=doc,
    )
    r.raise_for_status()
    return r.json()

def sb_update(table, params, doc):
    r = http.patch(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=sb_headers({"Prefer": "return=representation"}),
        params=params,
        json=doc,
    )
    r.raise_for_status()
    return r.json()

def sb_delete(table, params):
    r = http.delete(f"{SUPABASE_URL}/rest/v1/{table}", headers=sb_headers(), params=params)
    r.raise_for_status()

# Coordinates derived from verified school addresses (YRDSB secondary schools)
locations = [
    {"id": 1,  "name": "Dr. G.W. Williams Secondary School", "lat": 44.0046, "lng": -79.4656},
    {"id": 2,  "name": "Newmarket High School",              "lat": 44.0370, "lng": -79.4613},
    {"id": 3,  "name": "Huron Heights Secondary School",     "lat": 44.0453, "lng": -79.4858},
    {"id": 4,  "name": "Unionville High School",             "lat": 43.8655, "lng": -79.3246},
    {"id": 5,  "name": "Markham District High School",       "lat": 43.8742, "lng": -79.2612},
    {"id": 6,  "name": "Richmond Hill High School",          "lat": 43.9056, "lng": -79.4280},
    {"id": 7,  "name": "Maple High School",                  "lat": 43.8490, "lng": -79.5073},
    {"id": 8,  "name": "Stouffville District Secondary School", "lat": 43.9742, "lng": -79.2469},
    {"id": 9,  "name": "King City Secondary School",         "lat": 43.9278, "lng": -79.5237},
    {"id": 10, "name": "Hodan Nalayeh Secondary School",     "lat": 43.8197, "lng": -79.4463},
]


# ── Auth middleware ───────────────────────────────────────────────────────────

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'missing token'}), 401
        token = auth[7:]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'invalid token'}), 401
        request.user = payload
        return f(*args, **kwargs)
    return decorated


# ── Auth routes ───────────────────────────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not name or not email or not password:
        return jsonify({'error': 'name, email, and password are required'}), 400
    if '@' not in email or '.' not in email:
        return jsonify({'error': 'invalid email address'}), 400
    if len(password) < 6:
        return jsonify({'error': 'password must be at least 6 characters'}), 400

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_id = uuid.uuid4().hex

    try:
        sb_insert('users', {
            'user_id': user_id,
            'name': name,
            'email': email,
            'password_hash': pw_hash,
            'created_at': time.time(),
        })
    except http.HTTPError as e:
        if e.response is not None and e.response.status_code == 409:
            return jsonify({'error': 'email already registered'}), 409
        print(f"Database error during register: {e}")
        return jsonify({'error': 'service unavailable'}), 503

    token = jwt.encode(
        {'user_id': user_id, 'name': name, 'email': email,
         'exp': datetime.now(timezone.utc) + timedelta(days=30)},
        SECRET_KEY, algorithm='HS256'
    )
    return jsonify({'token': token, 'name': name, 'user_id': user_id})


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    try:
        rows = sb_get('users', {'email': f'eq.{email}', 'select': '*'})
        user = rows[0] if rows else None
    except Exception as e:
        print(f"Database error during login: {e}")
        return jsonify({'error': 'service unavailable'}), 503

    if not user or not bcrypt.checkpw(password.encode(), user['password_hash'].encode()):
        return jsonify({'error': 'invalid email or password'}), 401

    token = jwt.encode(
        {'user_id': user['user_id'], 'name': user['name'], 'email': email,
         'exp': datetime.now(timezone.utc) + timedelta(days=30)},
        SECRET_KEY, algorithm='HS256'
    )
    return jsonify({'token': token, 'name': user['name'], 'user_id': user['user_id']})


# ── Public routes ─────────────────────────────────────────────────────────────

@app.route('/api/locations')
def get_locations():
    return jsonify(locations)


@app.route('/api/time')
def get_time():
    return jsonify({"time": time.time()})


# ── Protected: user presence ──────────────────────────────────────────────────

@app.route('/api/users/location', methods=['POST'])
@require_auth
def update_user_location():
    user_id = request.user['user_id']
    name = request.user['name']
    data = request.get_json() or {}
    sb_upsert('user_locations', {
        'user_id': user_id,
        'name': name,
        'lat': data['lat'],
        'lng': data['lng'],
        'updated_at': time.time(),
    }, on_conflict='user_id')
    return jsonify({'ok': True})


@app.route('/api/users/locations', methods=['GET'])
@require_auth
def get_user_locations():
    cutoff = time.time() - 120
    rows = sb_get('user_locations', {
        'updated_at': f'gt.{cutoff}',
        'select': 'user_id,name,lat,lng,updated_at',
    })
    return jsonify(rows)


@app.route('/api/users/search', methods=['GET'])
@require_auth
def search_users():
    q = (request.args.get('q') or '').strip()
    my_id = request.user['user_id']
    if len(q) < 2:
        return jsonify([])
    try:
        rows = sb_get('users', {
            'name': f'ilike.*{q}*',
            'select': 'user_id,name',
            'limit': '10',
        })
        return jsonify([r for r in rows if r['user_id'] != my_id])
    except Exception:
        return jsonify([])


# ── Protected: carpool requests ───────────────────────────────────────────────

@app.route('/api/carpool/requests', methods=['GET'])
@require_auth
def get_carpool_requests():
    cutoff = time.time() - 7200
    rows = sb_get('carpool_requests', {'created_at': f'gt.{cutoff}', 'select': '*'})
    return jsonify(rows)


@app.route('/api/carpool/request', methods=['POST'])
@require_auth
def create_carpool_request():
    user_id = request.user['user_id']
    name = request.user['name']
    data = request.get_json() or {}
    doc = {
        'id': uuid.uuid4().hex[:8],
        'user_id': user_id,
        'name': name,
        'lat': data['lat'],
        'lng': data['lng'],
        'school_id': data['school_id'],
        'school_name': data['school_name'],
        'message': data.get('message', ''),
        'created_at': time.time(),
    }
    sb_insert('carpool_requests', doc)
    return jsonify(doc)


@app.route('/api/carpool/request/<req_id>', methods=['DELETE'])
@require_auth
def cancel_carpool_request(req_id):
    user_id = request.user['user_id']
    sb_delete('carpool_requests', {'id': f'eq.{req_id}', 'user_id': f'eq.{user_id}'})
    return jsonify({'ok': True})


# ── Protected: friends ────────────────────────────────────────────────────────

def _friendship_status(my_id, other_id):
    """Return friendship row if it exists between two users, else None."""
    a, b = sorted([my_id, other_id])
    rows = sb_get('friendships', {
        'select': '*',
        'or': f'(and(requester_id.eq.{a},requestee_id.eq.{b}),and(requester_id.eq.{b},requestee_id.eq.{a}))',
    })
    return rows[0] if rows else None


@app.route('/api/friends', methods=['GET'])
@require_auth
def list_friends():
    my_id = request.user['user_id']
    rows = sb_get('friendships', {
        'select': '*',
        'status': 'eq.accepted',
        'or': f'(requester_id.eq.{my_id},requestee_id.eq.{my_id})',
    })
    friends = []
    for row in rows:
        friend_id = row['requestee_id'] if row['requester_id'] == my_id else row['requester_id']
        users = sb_get('users', {'user_id': f'eq.{friend_id}', 'select': 'user_id,name'})
        if users:
            friends.append({'friendship_id': row['id'], 'user_id': friend_id, 'name': users[0]['name']})
    return jsonify(friends)


@app.route('/api/friends/requests', methods=['GET'])
@require_auth
def list_friend_requests():
    my_id = request.user['user_id']
    rows = sb_get('friendships', {
        'requestee_id': f'eq.{my_id}',
        'status': 'eq.pending',
        'select': '*',
    })
    result = []
    for row in rows:
        users = sb_get('users', {'user_id': f'eq.{row["requester_id"]}', 'select': 'user_id,name'})
        if users:
            result.append({'friendship_id': row['id'], 'user_id': row['requester_id'], 'name': users[0]['name']})
    return jsonify(result)


@app.route('/api/friends/request', methods=['POST'])
@require_auth
def send_friend_request():
    my_id = request.user['user_id']
    data = request.get_json() or {}
    target_id = data.get('user_id', '').strip()
    if not target_id or target_id == my_id:
        return jsonify({'error': 'invalid user'}), 400

    existing = _friendship_status(my_id, target_id)
    if existing:
        return jsonify({'error': 'already friends or request pending'}), 409

    doc = {
        'id': uuid.uuid4().hex[:12],
        'requester_id': my_id,
        'requestee_id': target_id,
        'status': 'pending',
        'created_at': time.time(),
    }
    sb_insert('friendships', doc)
    return jsonify({'ok': True, 'id': doc['id']})


@app.route('/api/friends/request/<friendship_id>/accept', methods=['PUT'])
@require_auth
def accept_friend_request(friendship_id):
    my_id = request.user['user_id']
    rows = sb_get('friendships', {'id': f'eq.{friendship_id}', 'requestee_id': f'eq.{my_id}', 'status': 'eq.pending'})
    if not rows:
        return jsonify({'error': 'request not found'}), 404
    sb_update('friendships', {'id': f'eq.{friendship_id}'}, {'status': 'accepted'})
    return jsonify({'ok': True})


@app.route('/api/friends/request/<friendship_id>', methods=['DELETE'])
@require_auth
def decline_or_remove_friend(friendship_id):
    my_id = request.user['user_id']
    sb_delete('friendships', {
        'id': f'eq.{friendship_id}',
        'or': f'(requester_id.eq.{my_id},requestee_id.eq.{my_id})',
    })
    return jsonify({'ok': True})


# ── Protected: messages ───────────────────────────────────────────────────────

@app.route('/api/messages/<other_id>', methods=['GET'])
@require_auth
def get_messages(other_id):
    my_id = request.user['user_id']
    a, b = sorted([my_id, other_id])
    rows = sb_get('messages', {
        'select': '*',
        'or': f'(and(sender_id.eq.{my_id},receiver_id.eq.{other_id}),and(sender_id.eq.{other_id},receiver_id.eq.{my_id}))',
        'order': 'created_at.asc',
        'limit': '100',
    })
    # Mark unread messages as read
    sb_update('messages', {
        'receiver_id': f'eq.{my_id}',
        'sender_id': f'eq.{other_id}',
        'read_at': 'is.null',
    }, {'read_at': time.time()})
    return jsonify(rows)


@app.route('/api/messages', methods=['POST'])
@require_auth
def send_message():
    my_id = request.user['user_id']
    data = request.get_json() or {}
    receiver_id = data.get('receiver_id', '').strip()
    content = (data.get('content') or '').strip()
    if not receiver_id or not content:
        return jsonify({'error': 'receiver_id and content are required'}), 400

    doc = {
        'id': uuid.uuid4().hex,
        'sender_id': my_id,
        'receiver_id': receiver_id,
        'content': content,
        'created_at': time.time(),
        'read_at': None,
    }
    sb_insert('messages', doc)
    return jsonify(doc)


@app.route('/api/messages/unread', methods=['GET'])
@require_auth
def get_unread_counts():
    my_id = request.user['user_id']
    rows = sb_get('messages', {
        'receiver_id': f'eq.{my_id}',
        'read_at': 'is.null',
        'select': 'sender_id',
    })
    counts = {}
    for row in rows:
        sid = row['sender_id']
        counts[sid] = counts.get(sid, 0) + 1
    return jsonify(counts)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
