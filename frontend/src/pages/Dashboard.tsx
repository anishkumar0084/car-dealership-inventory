import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VehicleCard from '../components/VehicleCard';
import VehicleFormModal from '../components/VehicleFormModal';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/filter state
  const [make, setMake] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Modern Alert/Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Custom Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Custom Restock Modal state
  const [restockModal, setRestockModal] = useState<{
    isOpen: boolean;
    vehicleId: string;
    make: string;
    model: string;
    currentQuantity: number;
  } | null>(null);

  const [restockAmount, setRestockAmount] = useState('');

  const isAdmin = user?.role === 'admin';

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.vehicles);
    } catch (err: any) {
      setError('Failed to load vehicles.');
      showToast('Failed to load vehicles from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (make) params.make = make;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const response = await api.get('/vehicles/search', { params });
      setVehicles(response.data.vehicles);
      showToast('Filters applied successfully!');
    } catch (err) {
      setError('Search failed.');
      showToast('Failed to search vehicles.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setMake('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    fetchVehicles();
    showToast('Filters cleared.');
  };

  const handlePurchase = async (id: string) => {
    try {
      const response = await api.post(`/vehicles/${id}/purchase`);
      showToast(`Successfully purchased ${response.data.vehicle.make} ${response.data.vehicle.model}!`);
      fetchVehicles();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Purchase failed.', 'error');
    }
  };

  const handleRestockClick = (id: string) => {
    const v = vehicles.find((vehicle) => vehicle.id === id);
    if (!v) return;
    setRestockAmount('');
    setRestockModal({
      isOpen: true,
      vehicleId: v.id,
      make: v.make,
      model: v.model,
      currentQuantity: v.quantity,
    });
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModal) return;

    const amount = parseInt(restockAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid positive integer amount.', 'error');
      return;
    }

    try {
      await api.post(`/vehicles/${restockModal.vehicleId}/restock`, { amount });
      showToast(`Successfully restocked ${amount} units for ${restockModal.make} ${restockModal.model}!`);
      setRestockModal(null);
      fetchVehicles();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Restock failed.', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    const v = vehicles.find((vehicle) => vehicle.id === id);
    if (!v) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Vehicle',
      message: `Are you sure you want to permanently delete the ${v.make} ${v.model} from inventory? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/vehicles/${id}`);
          showToast('Vehicle has been removed from inventory.');
          setConfirmDialog(null);
          fetchVehicles();
        } catch (err: any) {
          showToast(err.response?.data?.error || 'Delete failed.', 'error');
        }
      },
    });
  };

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: {
    make: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
  }) => {
    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, data);
        showToast('Vehicle updated successfully!');
      } else {
        await api.post('/vehicles', data);
        showToast('New vehicle added to inventory!');
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Operation failed.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-2xl transition duration-500 border ${
          toast.type === 'error'
            ? 'bg-red-950/80 border-red-500/50 text-red-200'
            : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
        } backdrop-blur-md`}>
          <div className="mr-3 font-semibold text-sm">
            {toast.type === 'error' ? '⚠️' : '✨'} {toast.message}
          </div>
          <button onClick={() => setToast(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/60 border-b border-slate-700/50 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚗</span>
          <h1 className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            DEALERSHIP INVENTORY
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-sm font-semibold text-slate-200">{user?.name}</span>
            {isAdmin && <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold">Admin</span>}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm bg-slate-800 hover:bg-slate-700 hover:text-red-400 border border-slate-700 px-4 py-2 rounded-xl transition duration-200 shadow-md font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search/Filter Bar */}
        <form
          onSubmit={handleSearch}
          className="bg-slate-900/40 border border-slate-700/40 p-5 rounded-3xl shadow-xl mb-8 flex flex-wrap gap-4 items-end backdrop-blur-sm"
        >
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Make</label>
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
              placeholder="Toyota"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
              placeholder="Sedan"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Min Price ($)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
              placeholder="0"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Max Price ($)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
              placeholder="100000"
            />
          </div>
          <div className="flex gap-2 min-w-[200px]">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all duration-200 cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-700 transition cursor-pointer"
            >
              Clear
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition duration-200 cursor-pointer"
            >
              + Add Vehicle
            </button>
          )}
        </form>

        {/* Content */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-slate-400">Loading vehicles...</p>
          </div>
        )}
        {error && <p className="text-center text-red-400 font-semibold bg-red-950/20 py-4 border border-red-500/20 rounded-xl">{error}</p>}
        {!loading && !error && vehicles.length === 0 && (
          <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-slate-400 font-medium">No vehicles found matching your criteria.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPurchase={handlePurchase}
              isAdmin={isAdmin}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteClick}
              onRestock={handleRestockClick}
            />
          ))}
        </div>
      </main>

      {/* Add/Edit Vehicle Modal */}
      {isModalOpen && (
        <VehicleFormModal
          vehicle={editingVehicle}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 text-white">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-3">
              ⚠️ {confirmDialog.title}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {confirmDialog.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-bold border border-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Restock Modal */}
      {restockModal?.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-white">
            <h3 className="text-lg font-bold text-slate-100 mb-2">
              📥 Restock Vehicle
            </h3>
            <p className="text-slate-400 text-xs mb-4">
              Restocking: <strong className="text-slate-200">{restockModal.make} {restockModal.model}</strong>
              <br />
              Current Stock: <strong className="text-slate-200">{restockModal.currentQuantity}</strong> units
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Restock Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                  placeholder="e.g. 5"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModal(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-bold border border-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;