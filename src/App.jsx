import { useState, useEffect, useRef } from 'react'
import MapComponent from './components/MapComponent'
import ChatPanel from './components/ChatPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Globe, MapPin, Users, MessageSquare, UserPlus, Check, X,
  LogOut, Search, Car, Plus, Trash2, UserCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SCHOOLS = [
  { id: 1,  name: "Dr. G.W. Williams Secondary School",    lat: 44.0046, lng: -79.4656 },
  { id: 2,  name: "Newmarket High School",                 lat: 44.0370, lng: -79.4613 },
  { id: 3,  name: "Huron Heights Secondary School",        lat: 44.0453, lng: -79.4858 },
  { id: 4,  name: "Unionville High School",                lat: 43.8655, lng: -79.3246 },
  { id: 5,  name: "Markham District High School",          lat: 43.8742, lng: -79.2612 },
  { id: 6,  name: "Richmond Hill High School",             lat: 43.9056, lng: -79.4280 },
  { id: 7,  name: "Maple High School",                     lat: 43.8490, lng: -79.5073 },
  { id: 8,  name: "Stouffville District Secondary School", lat: 43.9742, lng: -79.2469 },
  { id: 9,  name: "King City Secondary School",            lat: 43.9278, lng: -79.5237 },
  { id: 10, name: "Hodan Nalayeh Secondary School",        lat: 43.8197, lng: -79.4463 },
]

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// ── Auth screen ──────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { email, password }
        : { name: name.trim(), email, password }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      localStorage.setItem('hitch_token', data.token)
      onAuth(data.token)
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(0.10_0.02_270)] p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-teal-500 shadow-2xl shadow-violet-900/50 mb-4">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text">Hitch</h1>
          <p className="text-sm text-slate-500 mt-1">York Region District School Board</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[oklch(0.13_0.025_270)] p-6 shadow-2xl shadow-black/50">
          {/* Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-5">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={cn(
                  'flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150',
                  mode === m
                    ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-900/40'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {mode === 'signup' && (
              <Input
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            )}
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus={mode === 'login'}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />

            {error && (
              <p className="text-xs text-pink-400 text-center py-1">{error}</p>
            )}

            <Button className="w-full mt-1" size="lg" onClick={submit} disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar tabs ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'schools',  icon: MapPin,        label: 'Schools' },
  { id: 'carpools', icon: Car,           label: 'Carpools' },
  { id: 'friends',  icon: Users,         label: 'Friends' },
]

// ── Schools tab ───────────────────────────────────────────────────────────────

function SchoolsTab({ locations, selected, onSelect }) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/8 flex-shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
          Schools &mdash; {locations.length}
        </p>
      </div>
      <ScrollArea className="flex-1">
        <ul className="py-2">
          {locations.map(loc => (
            <li
              key={loc.id}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 cursor-pointer border-l-2 transition-all duration-100',
                selected?.id === loc.id
                  ? 'border-violet-400 bg-violet-600/10'
                  : 'border-transparent hover:bg-white/4 hover:border-white/10'
              )}
              onClick={() => onSelect(prev => prev?.id === loc.id ? null : loc)}
            >
              <span className={cn(
                'w-2 h-2 rounded-full flex-shrink-0 transition-all',
                selected?.id === loc.id
                  ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.7)]'
                  : 'bg-white/20'
              )} />
              <span className={cn(
                'text-sm leading-snug',
                selected?.id === loc.id ? 'text-violet-300 font-semibold' : 'text-slate-300 font-medium'
              )}>
                {loc.name}
              </span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}

// ── Carpools tab ──────────────────────────────────────────────────────────────

function CarpoolsTab({ locations, userLocation, userId, carpoolRequests, myRequest, onMyRequestChange, onRequestsChange, authHeaders }) {
  const [showForm, setShowForm] = useState(false)
  const [school, setSchool] = useState('')
  const [msg, setMsg] = useState('')

  const otherCarpools = carpoolRequests.filter(r => r.user_id !== userId)

  const submit = () => {
    if (!school || !userLocation) return
    const loc = locations.find(l => l.id === parseInt(school))
    if (!loc) return
    fetch('/api/carpool/request', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        lat: userLocation.lat, lng: userLocation.lng,
        school_id: loc.id, school_name: loc.name,
        message: msg,
      }),
    }).then(r => r.json()).then(req => {
      onMyRequestChange(req)
      onRequestsChange(prev => [...prev.filter(r => r.user_id !== userId), req])
      setShowForm(false)
      setMsg('')
      setSchool('')
    })
  }

  const cancel = () => {
    if (!myRequest) return
    fetch(`/api/carpool/request/${myRequest.id}`, { method: 'DELETE', headers: authHeaders() })
      .then(() => {
        onMyRequestChange(null)
        onRequestsChange(prev => prev.filter(r => r.id !== myRequest.id))
      })
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 flex flex-col gap-3">
        {/* CTA / form */}
        {!myRequest && !showForm && (
          <Button
            className="w-full"
            onClick={() => setShowForm(true)}
            disabled={!userLocation}
            title={!userLocation ? 'Waiting for your location…' : undefined}
          >
            <Plus className="h-4 w-4" />
            Request a Carpool
          </Button>
        )}

        {showForm && (
          <Card className="border-violet-500/20 bg-violet-600/5">
            <CardContent className="pt-4 flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-1.5">Destination</p>
                <Select value={school} onValueChange={setSchool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select school…" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(l => (
                      <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-1.5">
                  Message <span className="text-slate-500 normal-case font-normal tracking-normal">(optional)</span>
                </p>
                <Input
                  placeholder="e.g. Leaving at 8:15 am"
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setSchool(''); setMsg('') }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={submit} disabled={!school || !userLocation}>
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My request */}
        {myRequest && (
          <Card className="border-teal-500/30 bg-teal-500/5">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="teal" className="text-[10px]">Your request</Badge>
                <Button variant="destructive" size="icon-sm" onClick={cancel}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-sm font-semibold text-white mt-2">{myRequest.school_name}</p>
              {myRequest.message && (
                <p className="text-xs text-slate-400 italic mt-1">"{myRequest.message}"</p>
              )}
            </CardContent>
          </Card>
        )}

        {otherCarpools.length === 0 && !showForm ? (
          <div className="text-center py-8">
            <Car className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm text-slate-500">No carpool requests yet.</p>
          </div>
        ) : (
          otherCarpools.map(req => (
            <Card key={req.id} className="hover:border-violet-500/30 transition-colors">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarFallback>{req.name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{req.name}</p>
                    <p className="text-xs text-slate-400 truncate">{req.school_name}</p>
                  </div>
                </div>
                {req.message && (
                  <p className="text-xs text-slate-400 italic mt-2 ml-12">"{req.message}"</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

// ── Friends tab ───────────────────────────────────────────────────────────────

function FriendsTab({ myId, authHeaders, onOpenChat, activeChatId }) {
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [unread, setUnread] = useState({})
  const searchDebounce = useRef(null)

  const fetchFriends = async () => {
    try {
      const [fRes, rRes, uRes] = await Promise.all([
        fetch('/api/friends', { headers: authHeaders() }),
        fetch('/api/friends/requests', { headers: authHeaders() }),
        fetch('/api/messages/unread', { headers: authHeaders() }),
      ])
      if (fRes.ok) setFriends(await fRes.json())
      if (rRes.ok) setRequests(await rRes.json())
      if (uRes.ok) setUnread(await uRes.json())
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchFriends()
    const id = setInterval(fetchFriends, 10000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    clearTimeout(searchDebounce.current)
    if (searchQ.length < 2) { setSearchResults([]); return }
    setSearching(true)
    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQ)}`, { headers: authHeaders() })
        if (res.ok) setSearchResults(await res.json())
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [searchQ]) // eslint-disable-line react-hooks/exhaustive-deps

  const sendRequest = async (userId) => {
    await fetch('/api/friends/request', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ user_id: userId }),
    })
    setSearchResults(prev => prev.filter(u => u.user_id !== userId))
    setSearchQ('')
  }

  const acceptRequest = async (friendshipId) => {
    await fetch(`/api/friends/request/${friendshipId}/accept`, { method: 'PUT', headers: authHeaders() })
    fetchFriends()
  }

  const declineRequest = async (friendshipId) => {
    await fetch(`/api/friends/request/${friendshipId}`, { method: 'DELETE', headers: authHeaders() })
    setRequests(prev => prev.filter(r => r.friendship_id !== friendshipId))
  }

  const removeFriend = async (friendshipId) => {
    await fetch(`/api/friends/request/${friendshipId}`, { method: 'DELETE', headers: authHeaders() })
    setFriends(prev => prev.filter(f => f.friendship_id !== friendshipId))
  }

  const friendIds = new Set([...friends.map(f => f.user_id), ...requests.map(r => r.user_id)])

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input
            className="pl-8 text-sm"
            placeholder="Find people…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>

        {/* Search results */}
        {searchQ.length >= 2 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Results</p>
            {searching ? (
              <p className="text-xs text-slate-500 text-center py-2">Searching…</p>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-2">No users found.</p>
            ) : (
              searchResults.map(u => (
                <Card key={u.user_id}>
                  <CardContent className="pt-3 pb-3 flex items-center gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">{u.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-white flex-1 truncate">{u.name}</span>
                    {!friendIds.has(u.user_id) && (
                      <Button size="icon-sm" variant="secondary" onClick={() => sendRequest(u.user_id)}>
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {friendIds.has(u.user_id) && (
                      <UserCheck className="h-4 w-4 text-teal-400" />
                    )}
                  </CardContent>
                </Card>
              ))
            )}
            <Separator />
          </div>
        )}

        {/* Incoming requests */}
        {requests.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400 flex items-center gap-2">
              Requests
              <Badge variant="pink">{requests.length}</Badge>
            </p>
            {requests.map(req => (
              <Card key={req.friendship_id} className="border-violet-500/20 bg-violet-600/5">
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">{req.name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white flex-1 truncate">{req.name}</span>
                  <div className="flex gap-1.5">
                    <Button size="icon-sm" variant="teal" onClick={() => acceptRequest(req.friendship_id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon-sm" variant="destructive" onClick={() => declineRequest(req.friendship_id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Separator />
          </div>
        )}

        {/* Friends list */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400">
            Friends &mdash; {friends.length}
          </p>
          {friends.length === 0 ? (
            <div className="text-center py-6">
              <Users className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm text-slate-500">Search above to add friends.</p>
            </div>
          ) : (
            friends.map(f => {
              const unreadCount = unread[f.user_id] || 0
              const isActive = activeChatId === f.user_id
              return (
                <Card
                  key={f.friendship_id}
                  className={cn(
                    'cursor-pointer transition-all hover:border-violet-500/30',
                    isActive && 'border-violet-500/50 bg-violet-600/10'
                  )}
                  onClick={() => onOpenChat(f)}
                >
                  <CardContent className="pt-3 pb-3 flex items-center gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">{f.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{f.name}</p>
                      {unreadCount > 0 && (
                        <p className="text-xs text-violet-400">{unreadCount} new message{unreadCount > 1 ? 's' : ''}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {unreadCount > 0 && <Badge variant="pink" className="min-w-5 justify-center">{unreadCount}</Badge>}
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={e => { e.stopPropagation(); removeFriend(f.friendship_id) }}
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <MessageSquare className="h-4 w-4 text-slate-500" />
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </ScrollArea>
  )
}

// ── Online peers (bottom of sidebar) ─────────────────────────────────────────

function OnlinePeers({ otherUsers }) {
  if (otherUsers.length === 0) return null
  return (
    <div className="border-t border-white/8 p-3 flex-shrink-0">
      <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-2 flex items-center gap-2">
        Online
        <Badge variant="teal" className="text-[10px]">{otherUsers.length}</Badge>
      </p>
      <div className="flex flex-wrap gap-1.5">
        <TooltipProvider delayDuration={200}>
          {otherUsers.map(u => (
            <Tooltip key={u.user_id}>
              <TooltipTrigger asChild>
                <Avatar className="h-7 w-7 cursor-default">
                  <AvatarFallback className="text-[10px]">{u.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{u.name}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

function App() {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('hitch_token')
    return t && decodeToken(t) ? t : null
  })
  const [currentUser, setCurrentUser] = useState(() => {
    const t = localStorage.getItem('hitch_token')
    return t ? decodeToken(t) : null
  })

  const tokenRef = useRef(token)
  useEffect(() => { tokenRef.current = token }, [token])

  const userId = currentUser?.user_id
  const userName = currentUser?.name

  const [locations] = useState(SCHOOLS)
  const [selected, setSelected] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [otherUsers, setOtherUsers] = useState([])
  const [carpoolRequests, setCarpoolRequests] = useState([])
  const [myRequest, setMyRequest] = useState(null)
  const [activeTab, setActiveTab] = useState('schools')
  const [activeChat, setActiveChat] = useState(null) // friend object

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenRef.current}`,
  })

  const logout = () => {
    localStorage.removeItem('hitch_token')
    setToken(null)
    setCurrentUser(null)
    setMyRequest(null)
    setCarpoolRequests([])
    setOtherUsers([])
    setActiveChat(null)
  }

  const handleAuth = (newToken) => {
    setToken(newToken)
    setCurrentUser(decodeToken(newToken))
  }

  // Broadcast location every 15 s
  useEffect(() => {
    if (!token || !userLocation) return
    const send = () => fetch('/api/users/location', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ lat: userLocation.lat, lng: userLocation.lng }),
    }).then(r => { if (r.status === 401) logout() })
    send()
    const id = setInterval(send, 15000)
    return () => clearInterval(id)
  }, [token, userLocation]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll other users every 10 s
  useEffect(() => {
    if (!token) return
    const poll = () =>
      fetch('/api/users/locations', { headers: authHeaders() })
        .then(r => { if (r.status === 401) { logout(); return null } return r.json() })
        .then(data => data && setOtherUsers(data.filter(u => u.user_id !== userId)))
    poll()
    const id = setInterval(poll, 10000)
    return () => clearInterval(id)
  }, [token, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll carpools every 10 s
  useEffect(() => {
    if (!token) return
    const poll = () =>
      fetch('/api/carpool/requests', { headers: authHeaders() })
        .then(r => { if (r.status === 401) { logout(); return null } return r.json() })
        .then(data => {
          if (!data) return
          setCarpoolRequests(data)
          setMyRequest(data.find(r => r.user_id === userId) || null)
        })
    poll()
    const id = setInterval(poll, 10000)
    return () => clearInterval(id)
  }, [token, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!token) return <AuthScreen onAuth={handleAuth} />

  const carpoolBadge = carpoolRequests.filter(r => r.user_id !== userId).length

  return (
    <div className="flex flex-col h-screen bg-[oklch(0.10_0.02_270)] overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 h-14 px-5 bg-[oklch(0.09_0.02_270)] border-b border-white/8 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-teal-500 shadow-lg shadow-violet-900/40">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-extrabold gradient-text">Hitch</span>
        </div>

        <div className="w-px h-5 bg-white/10" />
        <span className="text-xs text-slate-500 font-medium hidden sm:block">York Region District School Board</span>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.7)] presence-dot" />
          <span className="text-xs text-slate-400 font-semibold hidden sm:block">{userName}</span>
        </div>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Log out</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 flex flex-col border-r border-white/8 bg-[oklch(0.115_0.022_270)] overflow-hidden">
          {/* Tab nav */}
          <nav className="flex border-b border-white/8 flex-shrink-0 bg-[oklch(0.09_0.02_270)]">
            {TABS.map(tab => {
              const Icon = tab.icon
              const badge = tab.id === 'carpools' ? carpoolBadge : 0
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all duration-150 relative',
                    activeTab === tab.id
                      ? 'border-violet-500 text-violet-300'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {badge > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-pink-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow shadow-pink-900/50">
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Tab content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'schools' && (
              <SchoolsTab locations={locations} selected={selected} onSelect={setSelected} />
            )}
            {activeTab === 'carpools' && (
              <CarpoolsTab
                locations={locations}
                userLocation={userLocation}
                userId={userId}
                carpoolRequests={carpoolRequests}
                myRequest={myRequest}
                onMyRequestChange={setMyRequest}
                onRequestsChange={setCarpoolRequests}
                authHeaders={authHeaders}
              />
            )}
            {activeTab === 'friends' && (
              <FriendsTab
                myId={userId}
                authHeaders={authHeaders}
                onOpenChat={f => setActiveChat(f)}
                activeChatId={activeChat?.user_id}
              />
            )}
          </div>

          {/* Online peers strip */}
          <OnlinePeers otherUsers={otherUsers} />
        </aside>

        {/* Map */}
        <main className="flex-1 relative overflow-hidden">
          <MapComponent
            locations={locations}
            selectedLocation={selected}
            onSelectLocation={setSelected}
            onLocationChange={setUserLocation}
            otherUsers={otherUsers}
            carpoolRequests={carpoolRequests}
            userId={userId}
          />
        </main>

        {/* Chat panel (slides in from right) */}
        {activeChat && (
          <div className="w-80 flex-shrink-0 flex flex-col border-l border-white/8 overflow-hidden">
            <ChatPanel
              friend={activeChat}
              myId={userId}
              authHeaders={authHeaders}
              onClose={() => setActiveChat(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
