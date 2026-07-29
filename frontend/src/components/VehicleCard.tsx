interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (id: string) => void;
  isAdmin: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onRestock: (id: string) => void;
}

const VehicleCard = ({
  vehicle,
  onPurchase,
  isAdmin,
  onEdit,
  onDelete,
  onRestock,
}: VehicleCardProps) => {
  const isOutOfStock = vehicle.quantity === 0;

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/60 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 rounded-3xl p-5 flex flex-col justify-between backdrop-blur-sm">
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-slate-100 leading-tight">
            {vehicle.make} <span className="text-slate-300 font-semibold">{vehicle.model}</span>
          </h3>
          <span className="text-xs bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full font-bold border border-indigo-500/20 uppercase tracking-wider shrink-0">
            {vehicle.category}
          </span>
        </div>

        <p className="text-3xl font-extrabold tracking-tight text-white mt-4">
          ${vehicle.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>

        <div className="mt-3 flex items-center gap-1.5">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          <p className={`text-xs font-semibold uppercase tracking-wider ${isOutOfStock ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOutOfStock ? 'Out of Stock' : `${vehicle.quantity} available`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        <button
          onClick={() => onPurchase(vehicle.id)}
          disabled={isOutOfStock}
          className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition duration-200 cursor-pointer ${
            isOutOfStock
              ? 'bg-slate-800/60 text-slate-600 border border-slate-800 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15'
          }`}
        >
          {isOutOfStock ? 'SOLD OUT' : 'PURCHASE'}
        </button>

        {isAdmin && (
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => onEdit(vehicle)}
              className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center"
            >
              Edit
            </button>
            <button
              onClick={() => onRestock(vehicle.id)}
              className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center"
            >
              Restock
            </button>
            <button
              onClick={() => onDelete(vehicle.id)}
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;