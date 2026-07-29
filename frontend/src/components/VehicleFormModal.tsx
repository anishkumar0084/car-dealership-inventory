import { useState, useEffect } from 'react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

interface VehicleFormModalProps {
  vehicle: Vehicle | null; // null = adding new, otherwise editing
  onClose: () => void;
  onSubmit: (data: {
    make: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
  }) => void;
}

const VehicleFormModal = ({ vehicle, onClose, onSubmit }: VehicleFormModalProps) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setCategory(vehicle.category);
      setPrice(String(vehicle.price));
      setQuantity(String(vehicle.quantity));
    }
  }, [vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      make,
      model,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sedan, SUV, Truck..."
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {vehicle ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormModal;