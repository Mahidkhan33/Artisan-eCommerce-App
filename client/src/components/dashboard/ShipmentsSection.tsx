import React, { useState } from "react";
import { Search, Calendar, MapPin, Truck, Plus, X } from "lucide-react";
import type { Shipment, ShipmentStatus, Order } from "@/types/dashboard.types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCreateShipment, useUpdateShipmentStatus } from "@/hooks/useShipments";
import { Button } from "@/components/ui/button";
import { useDashboardOrders } from "@/hooks/useDashboard";
interface ShipmentsSectionProps {
  shipments: Shipment[];
  isLoading?: boolean;
  className?: string;
}
const ShipmentsSection: React.FC<ShipmentsSectionProps> = ({
  shipments,
  isLoading = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [updatingShipmentId, setUpdatingShipmentId] = useState<string | null>(null);
  const createShipment = useCreateShipment();
  const updateShipmentStatus = useUpdateShipmentStatus();
  const { data: ordersData } = useDashboardOrders(undefined, { enabled: true });
  
  // Get orders that don't have shipments yet
  const ordersWithoutShipments = React.useMemo(() => {
    if (!ordersData?.orders) return [];
    const shipmentOrderIds = new Set(shipments.map(s => s.orderId));
    return ordersData.orders.filter(
      order => 
        !shipmentOrderIds.has(order.orderId) && 
        (order.status === "confirmed" || order.status === "processing" || order.status === "shipped")
    );
  }, [ordersData?.orders, shipments]);
  const getStatusColor = (status: ShipmentStatus): string => {
    const colors: Record<ShipmentStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      in_transit: "bg-indigo-100 text-indigo-800",
      out_for_delivery: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };
  const getStatusLabel = (status: ShipmentStatus): string => {
    return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStatusChange = async (shipmentId: string, newStatus: ShipmentStatus) => {
    setUpdatingShipmentId(shipmentId);
    try {
      await updateShipmentStatus.mutateAsync({
        shipmentId,
        data: { status: newStatus },
      });
    } finally {
      setUpdatingShipmentId(null);
    }
  };

  const getNextStatuses = (currentStatus: ShipmentStatus): ShipmentStatus[] => {
    const statusFlow: Record<ShipmentStatus, ShipmentStatus[]> = {
      pending: ["preparing", "cancelled"],
      preparing: ["in_transit", "cancelled"],
      in_transit: ["out_for_delivery", "cancelled"],
      out_for_delivery: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  const handleCreateShipment = async () => {
    if (!selectedOrder || !expectedDeliveryDate) {
      return;
    }
    
    try {
      await createShipment.mutateAsync({
        orderId: selectedOrder._id,
        expectedDeliveryDate,
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
      });
      setShowCreateModal(false);
      setSelectedOrder(null);
      setExpectedDeliveryDate("");
      setTrackingNumber("");
      setCarrier("");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const openCreateModal = (order: Order) => {
    setSelectedOrder(order);
    // Set default expected delivery date to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setExpectedDeliveryDate(defaultDate.toISOString().split('T')[0]);
    setTrackingNumber("");
    setCarrier("");
    setShowCreateModal(true);
  };
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shipments...</p>
        </div>
      </div>
    );
  }
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shipments</h2>
          <p className="text-gray-600 mt-1">Track and manage all deliveries</p>
        </div>
        {ordersWithoutShipments.length > 0 && (
          <Button
            onClick={() => openCreateModal(ordersWithoutShipments[0])}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Shipment
          </Button>
        )}
      </div>
      
      {/* Orders without shipments section */}
      {ordersWithoutShipments.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Orders Ready for Shipment</h3>
          <div className="space-y-2">
            {ordersWithoutShipments.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Order #{order.orderId}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.customerName} • {order.items.length} item(s) • Rs. {order.totalAmount.toFixed(2)}
                  </div>
                </div>
                <Button
                  onClick={() => openCreateModal(order)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Create Shipment
                </Button>
              </div>
            ))}
            {ordersWithoutShipments.length > 5 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                And {ordersWithoutShipments.length - 5} more order(s)...
              </p>
            )}
          </div>
        </div>
      )}
      {}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by shipment ID, order ID, customer, or tracking number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | "all")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      {}
      {filteredShipments.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <Truck className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600">
            {searchQuery || statusFilter !== "all"
              ? "No shipments found matching your filters."
              : "No shipments yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipment ID
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Delivery
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShipments.map((shipment) => (
                  <tr
                    key={shipment._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        #{shipment.shipmentId}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">#{shipment.orderId}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 min-w-[180px]">
                      <div className="text-xs sm:text-sm text-gray-900 truncate">
                        {shipment.customerName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {shipment.customerAddress.city}, {shipment.customerAddress.country}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("capitalize text-xs", getStatusColor(shipment.status))}>
                          {getStatusLabel(shipment.status)}
                        </Badge>
                        {getNextStatuses(shipment.status).length > 0 && (
                          <select
                            value={shipment.status}
                            onChange={(e) => handleStatusChange(shipment._id, e.target.value as ShipmentStatus)}
                            disabled={updatingShipmentId === shipment._id || updateShipmentStatus.isPending}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value={shipment.status}>{getStatusLabel(shipment.status)}</option>
                            {getNextStatuses(shipment.status).map((status) => (
                              <option key={status} value={status}>
                                {getStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                        <span className="hidden sm:inline">
                          {formatDate(shipment.expectedDeliveryDate)}
                        </span>
                        <span className="sm:hidden">
                          {new Date(shipment.expectedDeliveryDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {shipment.actualDeliveryDate && (
                        <div className="text-xs text-green-600 mt-1">
                          Delivered: {formatDate(shipment.actualDeliveryDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      {shipment.trackingNumber ? (
                        <div className="text-xs sm:text-sm text-gray-900 font-mono">
                          {shipment.trackingNumber}
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-gray-400">-</div>
                      )}
                      {shipment.carrier && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {shipment.carrier}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Shipment Modal */}
      {showCreateModal && selectedOrder && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Create Shipment</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  #{selectedOrder.orderId}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {selectedOrder.customerName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier (Optional)
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g., DHL, FedEx, UPS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedOrder(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateShipment}
                disabled={!expectedDeliveryDate || createShipment.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {createShipment.isPending ? "Creating..." : "Create Shipment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ShipmentsSection;
