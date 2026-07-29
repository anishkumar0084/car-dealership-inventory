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
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-5 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {vehicle.category}
          </span>
        </div>

        <p className="text-2xl font-bold text-gray-900 mt-3">
          ${vehicle.price.toLocaleString()}
        </p>

        <p className={`text-sm mt-1 ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
          {isOutOfStock ? 'Out of Stock' : `${vehicle.quantity} in stock`}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => onPurchase(vehicle.id)}
          disabled={isOutOfStock}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isOutOfStock ? 'Unavailable' : 'Purchase'}
        </button>

        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(vehicle)}
              className="flex-1 bg-yellow-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-600 transition"
            >
              Edit
            </button>
            <button
              onClick={() => onRestock(vehicle.id)}
              className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Restock
            </button>
            <button
              onClick={() => onDelete(vehicle.id)}
              className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition"
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