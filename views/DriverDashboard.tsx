
import React, { useState, useEffect } from 'react';
import { User, TruckStatus, AidRequest, RequestStatus, Notification as AppNotification } from '../types';
import { store } from '../store';
import { ICONS as UI_ICONS, APP_NAME } from '../constants';
import { Footer } from '../components/Footer';
import { socket } from '../socket';


interface DriverDashboardProps {
  user: User;
  onLogout: () => void;
  refreshNotifications: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, onLogout, refreshNotifications }) => {
  const [status, setStatus] = useState<TruckStatus>(user.truckDetails?.currentStatus || TruckStatus.IDLE);
  const [activeRequest, setActiveRequest] = useState<AidRequest | null>(null);
  const [pendingRequests, setPendingRequests] = useState<AidRequest[]>([]);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // DEBUG STATE
  const [lastDebugEvent, setLastDebugEvent] = useState<string>("Waiting for events...");

  useEffect(() => {
    const fetchRequests = async () => {
      // 1. Fetch latest requests/missions (local loop)
      const all = store.getRequests();
      const pending = all.filter(r => r.driverId === user.id && r.status === RequestStatus.PENDING);
      let active = all.find(r => r.driverId === user.id && r.status === RequestStatus.ACCEPTED);

      // 2. Fetch latest status from Backend Source of Truth to avoid stale "IDLE" state
      try {
        const users = await store.fetchUsers();
        const me = users.find(u => u.id === user.id);
        if (me && me.truckDetails) {
          // Only update if changed prevents infinite loops/jitters, though React handles basic equality
          if (me.truckDetails.currentStatus !== status) {
            console.log(`Syncing status from DB: ${status} -> ${me.truckDetails.currentStatus}`);
            setStatus(me.truckDetails.currentStatus);
          }

          // Re-check recovery logic with FRESH DB status
          if (!active && me.truckDetails.currentStatus === TruckStatus.BUSY) {
            // ... same recovery block
            active = {
              id: 'RECOVERED-001',
              driverId: user.id,
              senderId: 'system-recovery',
              aidType: 'Active Deployment (Restored)',
              quantity: 'N/A',
              destination: 'Designated Target',
              urgency: 'High',
              status: RequestStatus.ACCEPTED,
              createdAt: Date.now()
            };
            setStatus(TruckStatus.BUSY);
          }
        }
      } catch (err) {
        console.error("Failed to sync driver status:", err);
      }

      setPendingRequests(pending);
      setActiveRequest(active || null);
      if (active) setStatus(TruckStatus.BUSY);
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [user.id]); // Removed status dependency to avoid loops, relying on internal checks

  // Request Notification Permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // REAL-TIME GPS TRACKING
  useEffect(() => {
    // Only track if status is NOT IDLE (i.e. READY or BUSY)
    if (status === TruckStatus.IDLE) return;

    socket.connect();

    const onConnect = () => {
      console.log('Socket connected, registering driver...');
      socket.emit('register-driver', user.id);
    };

    socket.on('connect', onConnect);

    if (socket.connected) {
      onConnect();
    }

    let watchId: number | null = null;
    if ('geolocation' in navigator) {
      console.log('Starting GPS tracking...');
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 GPS Update:', latitude, longitude);
          setLastUpdate(new Date().toLocaleTimeString());
          setGpsError(null);

          // Send to server
          socket.emit('update-location', {
            driverId: user.id,
            lat: latitude,
            lng: longitude
          });
        },
        (error) => {
          console.error('GPS Error:', error);
          setGpsError(error.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }

    socket.on('mission-assigned', (newRequest: AidRequest) => {
      setLastDebugEvent(`Rx: ${newRequest.aidType} for ${newRequest.driverId}`);
      console.log('socket event "mission-assigned" received!');
      console.log('payload:', newRequest);
      console.log('Current user.id:', user.id);
      console.log('Comparison string:', `"${newRequest.driverId}" === "${user.id}"`);

      if (String(newRequest.driverId) === String(user.id)) {
        console.log('MATCH! Saving to store...');
        // 1. Persist to Driver's LocalStorage so it survives refresh
        const current = store.getRequests();
        // Avoid duplicates if multiple events received
        if (!current.find(r => r.id === newRequest.id)) {
          console.log('Request is new, adding to list.');
          store.saveRequests([newRequest, ...current]);

          // 2. Update Local State
          setPendingRequests(prev => [newRequest, ...prev]);

          // 3. Notify
          store.addNotification({
            userId: user.id,
            title: 'New Mission Received!',
            message: `Priority: ${newRequest.urgency} | Cargo: ${newRequest.aidType}`,
            type: 'INFO',
            requestId: newRequest.id
          });

          // Browser alert for visibility
          alert(`NEW MISSION RECEIVED: ${newRequest.aidType}`);
        } else {
          console.log('Request already exists locally.');
        }
      } else {
        console.log('NO MATCH. Ignoring request.');
      }
    });

    socket.on('mission-debug', (data: any) => {
      console.log('DEBUG: Received global packet', data);
      setLastDebugEvent(`DEBUG GLOBAL: ${data.target}`);
    });


    return () => {
      socket.off('mission-assigned');
      socket.disconnect();
    };
  }, [status, user.id]);




  const toggleAvailability = async () => {
    const newStatus = status === TruckStatus.IDLE ? TruckStatus.READY : TruckStatus.IDLE;
    setStatus(newStatus);

    // Update in Mongo
    await store.updateTruckStatus(user.id, newStatus);
  };

  const handleAccept = async (requestId: string) => {
    const all = store.getRequests();
    const updated = all.map(r => r.id === requestId ? { ...r, status: RequestStatus.ACCEPTED } : r);
    store.saveRequests(updated);

    const request = updated.find(r => r.id === requestId);
    if (request) {
      store.addNotification({
        userId: request.senderId,
        title: 'Truck Ready!',
        message: `${user.name} has accepted your aid request. Tracking active.`,
        type: 'SUCCESS',
        requestId: request.id
      });
    }

    setStatus(TruckStatus.BUSY);
    setStatus(TruckStatus.BUSY);
    // Update status in Mongo
    await store.updateTruckStatus(user.id, TruckStatus.BUSY);

    refreshNotifications();

    refreshNotifications();
  };

  const reportMilestone = () => {
    if (!activeRequest) return;

    // Emit to server
    socket.emit('driver-action', {
      type: 'MILESTONE',
      driverId: user.id,
      requestId: activeRequest.id
    });

    alert('Milestone reported via Radio Link!');
  };

  const handleComplete = async () => {
    if (!activeRequest) return;

    // 1. Update Request Status locally and in 'store' (mock DB for requests)
    const all = store.getRequests();
    const updated = all.map(r => r.id === activeRequest.id ? { ...r, status: RequestStatus.COMPLETED } : r);
    store.saveRequests(updated);

    // 2. Notify Sender
    store.addNotification({
      userId: activeRequest.senderId,
      title: 'Mission Accomplished!',
      message: `${user.name} has completed the delivery to ${activeRequest.destination}.`,
      type: 'SUCCESS',
      requestId: activeRequest.id
    });

    // 3. Emit Socket Event for real-time update
    socket.emit('driver-action', {
      type: 'COMPLETED',
      driverId: user.id,
      requestId: activeRequest.id
    });

    // 4. Set Driver back to IDLE
    setStatus(TruckStatus.IDLE);
    await store.updateTruckStatus(user.id, TruckStatus.IDLE);

    // 5. Clear active request
    setActiveRequest(null);
    refreshNotifications();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-panel border-b px-8 py-5 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <UI_ICONS.Truck className="w-6 h-6" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-800">{APP_NAME} Driver</span>
        </div>
        <div className="flex items-center gap-6">
          {/* DEBUG INDICATOR */}
          <div className="flex flex-col items-end text-[9px] font-mono text-slate-400">
            <span className={socket.connected ? "text-green-500" : "text-red-500"}>
              {socket.connected ? "SOCKET CONNECTED" : "SOCKET DISCONNECTED"}
            </span>
            <span className={gpsError ? "text-red-500" : "text-slate-400"}>
              GPS: {gpsError ? "ERROR" : (lastUpdate ? "SENDING..." : "WAITING")}
            </span>
            {lastUpdate && <span className="text-blue-400">LAST: {lastUpdate}</span>}
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm">
            <div className={`w-3 h-3 rounded-full ${status === TruckStatus.READY ? 'bg-green-500 animate-pulse' : status === TruckStatus.BUSY ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{status}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <button onClick={onLogout} className="text-slate-400 hover:text-red-600 transition-all p-2 rounded-lg hover:bg-red-50">
            <UI_ICONS.LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-8 md:p-12 flex-grow animate-fade-in">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Status Section */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Deployment Ready?</h2>
                <p className="text-slate-500 mb-10 max-w-md font-medium">Broadcast your availability to aid organizations. Your GPS will be tracked upon task acceptance.</p>

                <button
                  onClick={toggleAvailability}
                  disabled={status === TruckStatus.BUSY}
                  className={`w-full py-7 rounded-[1.5rem] font-black text-xl transition-all shadow-xl flex items-center justify-center gap-4 ${status === TruckStatus.READY
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 shadow-red-100'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-300 active:scale-95'
                    } disabled:opacity-50 disabled:grayscale`}
                >
                  {status === TruckStatus.READY ? 'Go Offline' : 'Set as Available'}
                  {status !== TruckStatus.READY && <UI_ICONS.ChevronRight className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Active Task Card */}
            {activeRequest ? (
              <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <UI_ICONS.Box className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 text-blue-400">Current Mission</span>
                    <span className="text-white/30 text-xs font-mono">#{activeRequest.id}</span>
                  </div>
                  <h3 className="text-4xl font-black mb-2 tracking-tight">{activeRequest.aidType}</h3>
                  <p className="text-slate-400 text-xl mb-12 flex items-center gap-2">
                    <UI_ICONS.Map className="w-5 h-5 text-blue-500" />
                    Delivering to {activeRequest.destination}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button onClick={reportMilestone} className="py-5 bg-white text-slate-900 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95">Report Milestone</button>
                    <button onClick={handleComplete} className="py-5 bg-white/10 text-white rounded-2xl font-black hover:bg-white/20 transition-all border border-white/10 active:scale-95">Mark Completed</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100/50 border-4 border-dashed border-slate-200 p-20 rounded-[2.5rem] text-center">
                <div className="w-20 h-20 bg-slate-200/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UI_ICONS.Box className="w-10 h-10 text-slate-400" />
                </div>
                <p className="font-black text-slate-400 text-lg">No Active Shipments</p>
                <p className="text-slate-400 text-sm mt-1 mb-6">Pending your availability status...</p>

                {status === TruckStatus.BUSY && (
                  <div className="bg-amber-50 p-4 rounded-2xl max-w-sm mx-auto border border-amber-100 animate-pulse">
                    <p className="text-amber-800 font-bold text-xs uppercase tracking-widest mb-2">Sync Consistency Warning</p>
                    <p className="text-amber-700 text-xs mb-4">Status matches "BUSY" but no local mission data found. This usually happens if you switched browsers.</p>
                    <button
                      onClick={async () => {
                        await store.updateTruckStatus(user.id, TruckStatus.READY);
                        setStatus(TruckStatus.READY);
                      }}
                      className="bg-amber-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors"
                    >
                      Force Reset Status
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <UI_ICONS.Bell className="w-5 h-5 text-blue-600" />
                </div>
                Broadcasts
              </h3>
              <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-[10px] font-black">{pendingRequests.length} New</span>
            </div>

            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="bg-white/50 p-8 rounded-3xl border border-slate-200 border-dashed text-center">
                  <p className="text-sm text-slate-400 font-medium">Listening for radio calls...</p>
                </div>
              ) : (
                pendingRequests.map((r, idx) => (
                  <div
                    key={r.id}
                    className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:border-blue-500 transition-all animate-fade-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${r.urgency === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {r.urgency} Priority
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-lg mb-1">{r.aidType}</h4>
                    <p className="text-sm text-slate-500 mb-8 font-medium">{r.quantity} • To {r.destination}</p>
                    <button
                      onClick={() => handleAccept(r.id)}
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-black hover:bg-blue-600 transition-all text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95"
                    >
                      Accept Call
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2rem] text-white shadow-2xl shadow-blue-900/20">
              <h4 className="font-black text-lg mb-6 tracking-tight">Driver Scorecard</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest mb-1">Delivered</p>
                  <p className="text-3xl font-black">24</p>
                </div>
                <div>
                  <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest mb-1">Reliability</p>
                  <p className="text-3xl font-black text-teal-400">98%</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <button className="text-xs font-black text-blue-100 hover:text-white transition-colors flex items-center gap-2">
                  View Full History <UI_ICONS.ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      {/* VISUAL DEBUGGER */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-green-400 p-4 rounded-xl font-mono text-xs z-50 pointer-events-none">
        <p className="font-bold border-b border-green-400/30 mb-2">DEBUG CONSOLE</p>
        <p>User ID: {user.id}</p>
        <p>Socket ID: {socket.id}</p>
        <p>Status: {status}</p>
        <p>Connection: {socket.connected ? "CONNECTED" : "DISCONNECTED"}</p>
        <p>Last Event: {lastDebugEvent}</p>
        <button
          className="mt-2 bg-green-500/20 text-green-400 px-2 py-1 rounded w-full border border-green-500/30 pointer-events-auto hover:bg-green-500/40"
          onClick={() => {
            const mockMission: AidRequest = {
              id: 'TEST-' + Math.random(),
              driverId: user.id,
              senderId: 'TEST-SENDER',
              aidType: 'TEST MISSION',
              quantity: '100',
              destination: 'TEST LOC',
              urgency: 'High',
              status: RequestStatus.PENDING,
              createdAt: Date.now()
            };
            // Manually trigger the listener logic by simulating the event handling
            // We can't easily emit to ourself via socket.io-client without roundtrip
            // So we'll just call the handler logic directly or emit on the local socket object
            (socket as any).listeners('mission-assigned').forEach((fn: any) => fn(mockMission));
          }}
        >
          Simulate Incoming Mission
        </button>
      </div>
    </div>
  );
};
