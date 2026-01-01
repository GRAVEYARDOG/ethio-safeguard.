
import React, { useState, useEffect } from 'react';
import { User, TruckStatus, AidRequest, RequestStatus, Notification, RegistrationStatus } from '../types';
import { store } from '../store';
import { ICONS as UI_ICONS, APP_NAME } from '../constants';
import { Footer } from '../components/Footer';
import { socket } from '../socket';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to auto-center map with smoothing
const RecenterMap = ({ locations }: { locations: Record<string, { lat: number; lng: number }> }) => {
  const map = useMap();
  const [lastCenter, setLastCenter] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    const driverIds = Object.keys(locations);
    if (driverIds.length > 0) {
      // Calculate average center of all drivers
      const lats = Object.values(locations).map(l => l.lat);
      const lngs = Object.values(locations).map(l => l.lng);
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

      // Only move map if center has changed by > 0.001 degrees (approx 100m) 
      // This prevents the map from shaking on tiny GPS jitters
      if (!lastCenter || Math.abs(avgLat - lastCenter.lat) > 0.001 || Math.abs(avgLng - lastCenter.lng) > 0.001) {
        map.flyTo([avgLat, avgLng], 15, { animate: true, duration: 1.5 });
        setLastCenter({ lat: avgLat, lng: avgLng });
      }
    }
  }, [locations, map]);

  return null;
};

interface SenderDashboardProps {
  user: User;
  onLogout: () => void;
}

export const SenderDashboard: React.FC<SenderDashboardProps> = ({ user, onLogout }) => {
  const [availableTrucks, setAvailableTrucks] = useState<User[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<User | null>(null);
  const [activeRequests, setActiveRequests] = useState<AidRequest[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    aidType: '',
    quantity: '',
    destination: '',
    urgency: 'Medium' as const
  });

  // Track real-time driver locations
  const [driverLocations, setDriverLocations] = useState<Record<string, { lat: number; lng: number }>>({});

  useEffect(() => {
    socket.connect();

    // Re-join dashboard room whenever we connect/reconnect
    const onConnect = () => {
      console.log('Socket connecting... joining dashboard room');
      socket.emit('join-dashboard');
    };

    socket.on('connect', onConnect);

    // If already connected when this runs (rare race condition), emit immediately
    if (socket.connected) {
      onConnect();
    }

    socket.on('location-update', (data: { driverId: string; lat: number; lng: number }) => {
      setDriverLocations(prev => ({
        ...prev,
        [data.driverId]: { lat: data.lat, lng: data.lng }
      }));
    });

    socket.on('driver-action', (data: { type: 'MILESTONE' | 'COMPLETED', driverId: string, requestId: string, payload?: any }) => {
      console.log('Received driver action:', data);

      if (data.type === 'MILESTONE') {
        store.addNotification({
          userId: user.id,
          title: 'Driver Update',
          message: 'A driver just reported a milestone!',
          type: 'INFO',
          requestId: data.requestId
        });
        // Optional: Trigger a browser alert or toast if we had a toast library
        // For now, the notification system (bell icon) will pick it up
        alert(`Driver reported a milestone for request #${data.requestId}`);
      } else if (data.type === 'COMPLETED') {
        // Update local request store to reflect completion
        const allRequests = store.getRequests();

        // Try to match by requestId first, but fallback to driverId for recovered sessions
        let updated = allRequests.map(r => r.id === data.requestId ? { ...r, status: RequestStatus.COMPLETED } : r);

        // If no match by requestId (e.g., recovered session), complete ANY active request for this driver
        const wasUpdated = updated.some(r => r.id === data.requestId && r.status === RequestStatus.COMPLETED);
        if (!wasUpdated) {
          updated = allRequests.map(r =>
            (r.driverId === data.driverId && r.status === RequestStatus.ACCEPTED)
              ? { ...r, status: RequestStatus.COMPLETED }
              : r
          );
        }

        store.saveRequests(updated);

        // Update UI immediately
        fetchData();

        store.addNotification({
          userId: user.id,
          title: 'Mission Success',
          message: `Driver has marked the mission COMPLETED.`,
          type: 'SUCCESS',
          requestId: data.requestId
        });
        alert(`Mission Completed by Driver!`);
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('location-update');
      socket.disconnect();
    };
  }, []);


  const fetchData = async () => {
    const allUsers = await store.fetchUsers();
    setAvailableTrucks(allUsers.filter(u => u.role === 'DRIVER' && u.truckDetails?.currentStatus === TruckStatus.READY));
    const allRequests = store.getRequests(); // Keeping requests local for now as per plan
    setActiveRequests(allRequests.filter(r => r.senderId === user.id));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleSubmitAid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTruck) return;

    const newRequest: AidRequest = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      driverId: selectedTruck.id,
      aidType: form.aidType,
      quantity: form.quantity,
      destination: form.destination,
      urgency: form.urgency,
      status: RequestStatus.PENDING,
      createdAt: Date.now()
    };

    const currentRequests = store.getRequests();
    store.saveRequests([newRequest, ...currentRequests]);

    // Emit mission assignment to backend (which relays to driver)
    socket.emit('assign-mission', newRequest);

    store.addNotification({
      userId: selectedTruck.id,
      title: 'High Priority Deployment!',
      message: `${user.organizationDetails?.name} assigned a mission: ${form.aidType}.`,
      type: 'INFO'
    });

    setShowForm(false);
    setSelectedTruck(null);
    setForm({ aidType: '', quantity: '', destination: '', urgency: 'Medium' });
    fetchData();
  };

  return (
    <div className="min-h-screen flex flex-col mesh-gradient">
      <header className="glass-card border-b border-white/50 px-10 py-6 flex justify-between items-center sticky top-0 z-40 mx-6 mt-6 rounded-[2.5rem] shadow-2xl shadow-indigo-900/5">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-200">
            <UI_ICONS.Box className="w-7 h-7" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tighter text-slate-900 block">{APP_NAME} Sender</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 opacity-60">Operations Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {/* DEBUG INDICATOR */}
          <div className="flex flex-col items-end text-[9px] font-mono text-slate-400">
            <span className={socket.connected ? "text-green-500" : "text-red-500"}>
              {socket.connected ? "SOCKET CONNECTED" : "SOCKET DISCONNECTED"}
            </span>
            <span>TRACKING: {Object.keys(driverLocations).length} UNITS</span>
          </div>

          <div className="text-right hidden sm:block border-r border-slate-200 pr-8">
            <p className="text-lg font-black text-slate-900 leading-tight">{user.organizationDetails?.name}</p>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{user.organizationDetails?.type}</p>
          </div>
          <button onClick={onLogout} className="text-slate-400 hover:text-red-600 transition-all p-3 rounded-2xl hover:bg-red-50 active:scale-90">
            <UI_ICONS.LogOut className="w-7 h-7" />
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto w-full p-10 md:p-14 flex-grow grid lg:grid-cols-12 gap-12 animate-entrance">

        {/* Available Trucks List (Radar) */}
        <div className="lg:col-span-4 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
              <div className="p-2 bg-indigo-100 rounded-2xl">
                <UI_ICONS.Truck className="w-6 h-6 text-indigo-600" />
              </div>
              Fleet Radar
            </h2>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="bg-emerald-600 rounded-full h-2 w-2"></span>
              </span>
              {availableTrucks.length} Online
            </div>
          </div>

          <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {availableTrucks.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-slate-100 text-center animate-entrance">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <UI_ICONS.Truck className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-xl font-black text-slate-400 mb-2">No Signal Detected</p>
                <p className="text-sm text-slate-400 font-medium">Listening for active transponders in your region...</p>
              </div>
            ) : (
              availableTrucks.map((truck, idx) => (
                <div
                  key={truck.id}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-900/5 hover:shadow-indigo-500/10 transition-all cursor-pointer group animate-entrance relative overflow-hidden"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => {
                    setSelectedTruck(truck);
                    setShowForm(true);
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-600 font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all shadow-sm">
                      {truck.name[0]}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-3 uppercase tracking-widest">Available</span>
                      <p className="text-xs text-slate-400 font-black font-mono tracking-tighter">{truck.truckDetails?.licensePlate}</p>
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 tracking-tight">{truck.name}</h4>
                  <p className="text-sm text-slate-500 mb-8 font-medium flex items-center gap-2">
                    <UI_ICONS.Settings className="w-4 h-4 text-indigo-400" />
                    {truck.truckDetails?.model} • 10 Ton Load Cap
                  </p>
                  <button className="w-full py-4.5 bg-slate-50 text-slate-900 text-xs font-black uppercase tracking-[0.3em] rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all active:scale-95 shadow-sm border border-slate-100 group-hover:border-indigo-600 group-hover:shadow-xl group-hover:shadow-indigo-500/20">
                    Deploy Unit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Missions Area */}
        <div className="lg:col-span-8 space-y-12">
          {/* Real-Time Driver Map - Always Visible */}
          <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-3xl animate-entrance duration-700 glow-blue">
            <div className="flex justify-between items-start mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="bg-blue-500 rounded-full h-2 w-2"></span>
                  </span>
                  Live Tracking Active
                </div>
                <h3 className="text-5xl font-black text-white tracking-tighter">Driver Location Map</h3>
                <p className="text-blue-400 text-sm font-medium mt-2">{Object.keys(driverLocations).length} active driver{Object.keys(driverLocations).length !== 1 ? 's' : ''} broadcasting</p>
              </div>
            </div>

            <div className="bg-black h-[500px] rounded-[3rem] relative mb-12 overflow-hidden flex items-center justify-center shadow-2xl group border border-white/5 z-0">
              <MapContainer
                center={[9.0192, 38.7525]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Markers for all active drivers */}
                {Object.entries(driverLocations).map(([driverId, loc]: [string, any]) => (
                  <Marker key={driverId} position={[loc.lat, loc.lng]}>
                    <Popup>Driver: {driverId}</Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Overlay message when no drivers are broadcasting */}
              {Object.keys(driverLocations).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                      <UI_ICONS.Map className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-xl font-black text-white mb-2">Awaiting Driver Signals</p>
                    <p className="text-blue-400 text-sm font-medium">Start driver simulation to see live tracking</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Active Drivers</p>
                <p className="text-2xl font-black text-blue-400 uppercase tracking-tight">{Object.keys(driverLocations).length} Online</p>
              </div>
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Fleet Status</p>
                <p className="text-2xl font-black text-white uppercase tracking-tight">{availableTrucks.length} Ready</p>
              </div>
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Active Missions</p>
                <p className="text-2xl font-black text-white uppercase tracking-tight">{activeRequests.filter(r => r.status === RequestStatus.ACCEPTED).length} In Transit</p>
              </div>
            </div>
          </div>

          {/* Shipment Log */}
          <div className="bg-white p-16 rounded-[4rem] shadow-2xl shadow-indigo-900/5 border border-slate-50">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-black mb-4 tracking-tighter text-slate-900">Shipment Log</h2>
                <p className="text-lg text-slate-500 font-medium">Monitoring your ongoing aid deployments.</p>
              </div>
              <div className="flex -space-x-4 mb-2">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i + 40}`} className="w-12 h-12 rounded-full border-4 border-white shadow-lg" />
                ))}
              </div>
            </div>

            {activeRequests.length === 0 ? (
              <div className="py-32 text-center animate-entrance">
                <div className="w-28 h-28 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <UI_ICONS.Map className="w-12 h-12 text-slate-200" />
                </div>
                <p className="text-2xl font-black text-slate-400 mb-2">Registry Inactive</p>
                <p className="text-slate-400 font-medium text-lg">Initialize a deployment from the Fleet Radar to start tracking.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {activeRequests.map((req, idx) => (
                  <div
                    key={req.id}
                    className="flex flex-col xl:flex-row xl:items-center justify-between p-10 rounded-[3rem] border border-slate-50 bg-slate-50/40 hover:bg-white hover:shadow-3xl hover:shadow-indigo-500/10 transition-all group animate-entrance"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <div className="flex gap-8 items-center">
                      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 ${req.status === RequestStatus.COMPLETED ? 'bg-emerald-600 text-white shadow-emerald-200' :
                        req.status === RequestStatus.ACCEPTED ? 'bg-indigo-600 text-white shadow-indigo-200' :
                          'bg-slate-200 text-slate-500 shadow-slate-100'
                        }`}>
                        <UI_ICONS.Truck className="w-10 h-10" />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                          <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${req.status === RequestStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            req.status === RequestStatus.ACCEPTED ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              'bg-slate-100 text-slate-400 border-slate-200'
                            }`}>
                            {req.status}
                          </span>
                          <span className="text-xs font-black font-mono text-slate-300 tracking-tighter uppercase">ID: {req.id}</span>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">{req.aidType}</h4>
                        <p className="text-lg text-slate-500 font-bold flex items-center gap-3">
                          <div className="p-1 bg-slate-100 rounded-lg"><UI_ICONS.Box className="w-4 h-4 text-indigo-400" /></div>
                          {req.quantity} <span className="text-slate-200">/</span> {req.destination}
                        </p>
                      </div>
                    </div>
                    <div className="mt-8 xl:mt-0">
                      <div className={`flex items-center justify-center gap-4 px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] border ${req.status === RequestStatus.COMPLETED
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : req.status === RequestStatus.ACCEPTED
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                        {req.status === RequestStatus.COMPLETED ? '✓ Mission Complete' : req.status === RequestStatus.ACCEPTED ? 'In Transit' : 'Dispatch Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Modern High-End Aid Form Modal */}
      {showForm && selectedTruck && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-50 flex items-center justify-center p-8">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] overflow-hidden animate-entrance duration-500">
            <div className="bg-slate-900 p-12 text-white relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-10 right-10 text-white/30 hover:text-white transition-all text-4xl leading-none active:scale-90"
              >
                ✕
              </button>
              <div className="flex items-center gap-6 mb-8">
                <div className="p-4 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-500/50 rotate-3">
                  <UI_ICONS.Box className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-5xl font-black tracking-tighter">Strategic Deployment</h3>
                  <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.2em] mt-1">Confirmed Unit: {selectedTruck.name}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitAid} className="p-16 space-y-10">
              <div className="space-y-10">
                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">AID Cargo Specification</label>
                  <input
                    required
                    type="text"
                    value={form.aidType}
                    onChange={e => setForm({ ...form, aidType: e.target.value })}
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-2xl text-slate-900 placeholder:text-slate-200"
                    placeholder="e.g., PHARMA CONVOY 01"
                  />
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Volume / Units</label>
                    <input
                      required
                      type="text"
                      value={form.quantity}
                      onChange={e => setForm({ ...form, quantity: e.target.value })}
                      className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-2xl text-slate-900 placeholder:text-slate-200"
                      placeholder="500 KG"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Mission Priority</label>
                    <div className="relative">
                      <select
                        value={form.urgency}
                        onChange={e => setForm({ ...form, urgency: e.target.value as any })}
                        className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-2xl text-slate-900 appearance-none cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Standard</option>
                        <option value="High">Emergency</option>
                      </select>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                        <UI_ICONS.ChevronRight className="w-8 h-8 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Destination Target</label>
                  <input
                    required
                    type="text"
                    value={form.destination}
                    onChange={e => setForm({ ...form, destination: e.target.value })}
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-2xl text-slate-900 placeholder:text-slate-200"
                    placeholder="e.g., ADAMA REGIONAL HUB"
                  />
                </div>
              </div>

              <div className="pt-10">
                <button
                  type="submit"
                  className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xl hover:bg-indigo-700 transition-all shadow-3xl shadow-indigo-500/40 flex items-center justify-center gap-6 active:scale-95 group"
                >
                  Confirm Deployment
                  <UI_ICONS.ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scanning animation for the map */}
      <style>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(400%); }
        }
      `}</style>
    </div>
  );
};
