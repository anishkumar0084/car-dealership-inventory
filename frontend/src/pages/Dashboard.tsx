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

  const isAdmin = user?.role === 'admin';

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.vehicles);
    } catch (err) {
      setError('Failed to load vehicles.');
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
    } catch (err) {
      setError('Search failed.');
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
  };

  const handlePurchase = async (id: string) => {
    try {
      await api.post(`/vehicles/${id}/purchase`);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Purchase failed.');
    }
  };

  const handleRestock = async (id: string) => {
    const amountStr = prompt('Enter restock amount:');
    if (!amountStr) return;
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number.');
      return;
    }
    try {
      await api.post(`/vehicles/${id}/restock`, { amount });
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Restock failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Delete failed.');
    }
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
      } else {
        await api.post('/vehicles', data);
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">🚗 Car Dealership Inventory</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.name} {isAdmin && <span className="text-blue-600 font-semibold">(Admin)</span>}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search/Filter Bar */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-4 rounded-2xl shadow-sm mb-8 flex flex-wrap gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Make</label>
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32"
              placeholder="Toyota"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32"
              placeholder="Sedan"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
              placeholder="100000"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
          >
            Clear
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="ml-auto bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              + Add Vehicle
            </button>
          )}
        </form>

        {/* Content */}
        {loading && <p className="text-center text-gray-500">Loading vehicles...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && vehicles.length === 0 && (
          <p className="text-center text-gray-500">No vehicles found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPurchase={handlePurchase}
              isAdmin={isAdmin}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
              onRestock={handleRestock}
            />
          ))}
        </div>
      </main>

      {isModalOpen && (
        <VehicleFormModal
          vehicle={editingVehicle}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;