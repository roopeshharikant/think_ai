import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, Video, VideoOff, Volume2, VolumeX, MessageSquare, Users, BarChart2, 
  Hand, Share2, PhoneOff, Send, Plus, Award, Loader2, Sparkles, 
  Smile, CheckCircle, Menu, X, Monitor, MonitorOff 
} from "lucide-react";
import { toast } from "react-toastify";
import { useStudioSocket } from "../../hooks/useStudioSocket";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`;

export default function LiveClassStudio() {
  const { sessionId = "room-java-101" } = useParams();
  const navigate = useNavigate();

  const user = { 
    id: localStorage.getItem("userId") || "demo-user-1", 
    role: localStorage.getItem("role") || "admin", 
    name: localStorage.getItem("name") || "Instructor" 
  };

  const { mode, subscribe, emit, events } = useStudioSocket({ sessionId, user });

  // Media States
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // UI & Drawer States
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'attendees' | 'polls'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Media Streams Ref
  const userVideoRef = useRef(null);
  const screenStreamRef = useRef(null);

  // Studio Data States
  const [attendees, setAttendees] = useState([
    { userId: user.id, name: user.name, online: true, muted: isMuted, cameraOn: isCameraOn, raisedHand: false, role: user.role }
  ]);
  const [messages, setMessages] = useState([
    { messageId: 1, userId: "system", text: "Connected to Live Class Studio real-time stream.", sentAt: new Date().toISOString() }
  ]);
  const [chatInput, setChatInput] = useState("");
  
  // Poll States
  const [activePoll, setActivePoll] = useState(null);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [showPollCreator, setShowPollCreator] = useState(false);

  // Floating Reactions
  const [reactions, setReactions] = useState([]);

  // Socket Subscriptions
  useEffect(() => {
    if (mode !== "connected") return;

    emit(events.ROOM_JOIN, sessionId, (ack) => {
      if (ack?.ok) {
        toast.success(`Joined room: ${sessionId}`, { theme: "dark" });
      }
    });

    const unsubChat = subscribe(events.CHAT_MESSAGE, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    const unsubJoined = subscribe(events.ROOM_USER_JOINED, (data) => {
      setAttendees((prev) => {
        if (prev.some(a => a.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, name: `User ${data.userId.slice(0,5)}`, online: true, muted: true, cameraOn: false, raisedHand: false }];
      });
    });

    const unsubLeft = subscribe(events.ROOM_USER_LEFT, (data) => {
      setAttendees((prev) => prev.filter(a => a.userId !== data.userId));
    });

    const unsubPollStarted = subscribe(events.POLL_STARTED, (poll) => {
      setActivePoll(poll);
      toast.info(`New Poll Started: ${poll.question}`, { theme: "dark" });
    });

    const unsubPollResults = subscribe(events.POLL_RESULTS, (poll) => {
      setActivePoll(poll);
    });

    const unsubPollEnded = subscribe(events.POLL_ENDED, () => {
      setActivePoll(null);
      toast.warn("Active poll has ended.", { theme: "dark" });
    });

    const unsubActivity = subscribe(events.USER_ACTIVITY, (data) => {
      if (data.action === "raise_hand") {
        setAttendees(prev => prev.map(a => a.userId === data.userId ? { ...a, raisedHand: true } : a));
      } else if (data.action === "lower_hand") {
        setAttendees(prev => prev.map(a => a.userId === data.userId ? { ...a, raisedHand: false } : a));
      } else if (data.action?.startsWith("reaction:")) {
        triggerFloatingReaction(data.action.split(":")[1]);
      } else if (data.action?.startsWith("media:")) {
        const [_, mediaType, state] = data.action.split(":");
        setAttendees(prev => prev.map(a => {
          if (a.userId === data.userId) {
            return { ...a, [mediaType]: state === "true" };
          }
          return a;
        }));
      }
    });

    return () => {
      unsubChat();
      unsubJoined();
      unsubLeft();
      unsubPollStarted();
      unsubPollResults();
      unsubPollEnded();
      unsubActivity();
    };
  }, [mode, sessionId, emit, subscribe, events]);

  // Media Controls Implementation
  const toggleMicrophone = async () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    emit(events.USER_ACTIVITY, { roomName: sessionId, action: `media:muted:${nextState}` });
    toast.info(nextState ? "Microphone Muted" : "Microphone Active", { theme: "dark" });
  };

  const toggleCamera = async () => {
    try {
      if (!isCameraOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
        emit(events.USER_ACTIVITY, { roomName: sessionId, action: "media:cameraOn:true" });
        toast.success("Camera Enabled", { theme: "dark" });
      } else {
        const stream = userVideoRef.current?.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (userVideoRef.current) userVideoRef.current.srcObject = null;
        setIsCameraOn(false);
        emit(events.USER_ACTIVITY, { roomName: sessionId, action: "media:cameraOn:false" });
        toast.info("Camera Disabled", { theme: "dark" });
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Unable to access camera device.", { theme: "dark" });
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.info(!isSpeakerOn ? "Audio Output Enabled" : "Audio Output Muted", { theme: "dark" });
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);
        toast.success("Screen Sharing Started", { theme: "dark" });

        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Screen share error:", err);
      toast.error("Screen sharing cancelled or unavailable.", { theme: "dark" });
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    if (userVideoRef.current && isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
        userVideoRef.current.srcObject = s;
      });
    } else if (userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }
    toast.info("Screen Sharing Stopped", { theme: "dark" });
  };

  const toggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    emit(events.USER_ACTIVITY, { roomName: sessionId, action: nextState ? "raise_hand" : "lower_hand" });
  };

  const triggerFloatingReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setReactions((prev) => [...prev, { id, emoji, left: Math.floor(Math.random() * 80) + 10 }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter(r => r.id !== id));
    }, 3000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    emit(events.CHAT_MESSAGE, { roomName: sessionId, text: chatInput.trim() }, (ack) => {
      if (ack?.ok) setChatInput("");
    });
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) {
      toast.error("Provide a question and at least 2 options.", { theme: "dark" });
      return;
    }
    emit(events.POLL_CREATE, { roomName: sessionId, question: pollQuestion, options: pollOptions.filter(o => o.trim()) }, (ack) => {
      if (ack?.ok) {
        setShowPollCreator(false);
        setPollQuestion("");
        setPollOptions(["", ""]);
        toast.success("Poll published successfully!", { theme: "dark" });
      }
    });
  };

  const handleVote = (optionIndex) => {
    emit(events.POLL_VOTE, { roomName: sessionId, optionIndex }, (ack) => {
      if (ack?.ok) toast.success("Vote recorded!", { theme: "dark" });
    });
  };

  const handleLeaveSession = () => {
    emit(events.ROOM_LEAVE, sessionId, () => {
      navigate("/learner");
    });
  };

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-[#0b0f17] via-[#111827] to-[#0f172a] text-slate-100 font-sans flex flex-col overflow-hidden relative"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <style>{FONT_IMPORT}</style>

      {/* Floating Reactions Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {reactions.map((r) => (
          <div 
            key={r.id} 
            className="absolute bottom-20 text-3xl animate-bounce transition-all duration-1000 opacity-90"
            style={{ left: `${r.left}%`, transform: 'translateY(-200px)' }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Header Bar */}
      <header className="h-16 px-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-sm font-bold tracking-tight font-fraunces flex items-center gap-2">
            Live Studio: <span className="text-purple-400 font-mono text-xs">{sessionId}</span>
          </h1>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono uppercase">
            Status: {mode}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <button
            onClick={handleLeaveSession}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneOff size={14} /> Leave
          </button>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        
        {/* Center Main Area: Video Matrix & Toolbar */}
        <main className="lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between gap-4 overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-[350px]">
            {attendees.map((attendee, idx) => (
              <div 
                key={attendee.userId || idx}
                className="relative rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl group aspect-video sm:aspect-auto"
              >
                {attendee.userId === user.id && (isCameraOn || isScreenSharing) ? (
                  <video 
                    ref={userVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl font-mono">
                    {attendee.name.charAt(0)}
                  </div>
                )}

                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="truncate max-w-[120px]">{attendee.name} {attendee.userId === user.id && "(You)"}</span>
                  {attendee.muted ? <MicOff size={12} className="text-rose-400" /> : <Mic size={12} className="text-emerald-400" />}
                </div>

                {attendee.raisedHand && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg animate-bounce">
                    <Hand size={14} /> Raised Hand
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Control Toolbar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-center gap-2 sm:gap-3 shadow-2xl">
            
            {/* Mic Button */}
            <button
              onClick={toggleMicrophone}
              className={`p-3 rounded-2xl transition cursor-pointer flex items-center gap-2 text-xs font-semibold ${
                isMuted ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              title="Toggle Microphone"
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
            </button>

            {/* Camera Button */}
            <button
              onClick={toggleCamera}
              className={`p-3 rounded-2xl transition cursor-pointer flex items-center gap-2 text-xs font-semibold ${
                !isCameraOn ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              title="Toggle Camera"
            >
              {!isCameraOn ? <VideoOff size={18} /> : <Video size={18} />}
              <span className="hidden sm:inline">{isCameraOn ? "Stop Cam" : "Start Cam"}</span>
            </button>

            {/* Speaker Button */}
            <button
              onClick={toggleSpeaker}
              className={`p-3 rounded-2xl transition cursor-pointer flex items-center gap-2 text-xs font-semibold ${
                !isSpeakerOn ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              title="Toggle Speaker Output"
            >
              {!isSpeakerOn ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="hidden sm:inline">{isSpeakerOn ? "Speaker" : "Muted"}</span>
            </button>

            {/* Screen Share Button */}
            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-2xl transition cursor-pointer flex items-center gap-2 text-xs font-semibold ${
                isScreenSharing ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              title="Share Screen"
            >
              {isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
              <span className="hidden sm:inline">{isScreenSharing ? "Stop Share" : "Share"}</span>
            </button>

            {/* Hand Raise Button */}
            <button
              onClick={toggleHandRaise}
              className={`p-3 rounded-2xl transition cursor-pointer flex items-center gap-2 text-xs font-semibold ${
                isHandRaised ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              title="Raise/Lower Hand"
            >
              <Hand size={18} />
              <span className="hidden sm:inline">{isHandRaised ? "Lower Hand" : "Raise Hand"}</span>
            </button>

            {/* Emoji Reactions */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60">
              {["👏", "🔥", "❤️", "💡", "🚀"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    triggerFloatingReaction(emoji);
                    emit(events.USER_ACTIVITY, { roomName: sessionId, action: `reaction:${emoji}` });
                  }}
                  className="w-7 h-7 rounded-xl hover:bg-slate-700 flex items-center justify-center text-sm transition cursor-pointer"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {user.role === "admin" && (
              <button
                onClick={() => setShowPollCreator(true)}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-purple-500/25 flex items-center gap-2 cursor-pointer"
              >
                <BarChart2 size={16} /> Poll
              </button>
            )}
          </div>
        </main>

        {/* Right Sidebar: Chat, Attendees & Polls */}
        <aside className={`
          absolute inset-y-0 right-0 z-30 w-full sm:w-96 lg:static lg:w-auto lg:col-span-4 
          bg-slate-900/95 lg:bg-slate-900/60 border-l border-slate-800 flex flex-col p-4 sm:p-6 backdrop-blur-xl transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}>
          
          <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-800 mb-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "chat" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare size={13} /> Chat
            </button>
            <button
              onClick={() => setActiveTab("attendees")}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "attendees" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Users size={13} /> Users ({attendees.length})
            </button>
            <button
              onClick={() => setActiveTab("polls")}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "polls" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart2 size={13} /> Polls
            </button>
          </div>

          {/* TAB 1: CHAT */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {messages.map((m, idx) => (
                  <div key={m.messageId || idx} className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-purple-400 font-bold">{m.userId === user.id ? "You" : m.userId}</span>
                      <span>{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-200">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  type="submit"
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer shadow-md"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ATTENDEES */}
          {activeTab === "attendees" && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {attendees.map((a, idx) => (
                <div key={a.userId || idx} className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center font-mono">
                      {a.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200">{a.name}</h4>
                      <span className="text-[10px] font-mono text-emerald-400">Online</span>
                    </div>
                  </div>
                  {a.raisedHand && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px]">Hand Raised</span>}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: POLLS */}
          {activeTab === "polls" && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {activePoll ? (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Live Poll Active</span>
                  <h4 className="text-sm font-bold text-slate-100">{activePoll.question}</h4>
                  
                  <div className="space-y-2 pt-2">
                    {activePoll.options.map((opt, optIdx) => {
                      const totalVotes = activePoll.options.reduce((sum, o) => sum + (o.votes || 0), 0);
                      const percent = totalVotes === 0 ? 0 : Math.round(((opt.votes || 0) / totalVotes) * 100);
                      
                      return (
                        <button
                          key={opt.id || optIdx}
                          onClick={() => handleVote(opt.id || optIdx)}
                          className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 transition relative overflow-hidden cursor-pointer group"
                        >
                          <div 
                            className="absolute inset-y-0 left-0 bg-purple-600/20 transition-all duration-500" 
                            style={{ width: `${percent}%` }} 
                          />
                          <div className="relative z-10 flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-200">{opt.text}</span>
                            <span className="font-mono text-purple-400 font-bold">{percent}%</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl p-6">
                  <BarChart2 size={28} className="mb-2 opacity-50" />
                  <p className="text-xs">No active poll running right now.</p>
                </div>
              )}
            </div>
          )}

        </aside>

      </div>

      {/* POLL CREATOR MODAL */}
      {showPollCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleCreatePoll} className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-fraunces">Launch Live Interactive Poll</h3>
              <button type="button" onClick={() => setShowPollCreator(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400 uppercase">Poll Question</label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="e.g. What is the output of System.out.println(1 + 2);"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase">Options</label>
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[idx] = e.target.value;
                    setPollOptions(next);
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                />
              ))}
              {pollOptions.length < 5 && (
                <button 
                  type="button" 
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="text-[11px] font-mono text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} /> Add Option
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowPollCreator(false)} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20">Publish Poll</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}