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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 text-white animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-slate-100 mb-5 flex items-center gap-2">
          {vehicle ? '✏️ Edit Vehicle Details' : '🚗 Add New Vehicle'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Make / Brand</label>
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
              placeholder="e.g. Tesla, Toyota"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
              placeholder="e.g. Model Y, RAV4"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
              placeholder="e.g. Electric, SUV, Sedan"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Price ($)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                placeholder="45000"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Stock Qty</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="0"
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                placeholder="5"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-bold border border-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/15 transition cursor-pointer"
            >
              {vehicle ? 'Update Details' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormModal;