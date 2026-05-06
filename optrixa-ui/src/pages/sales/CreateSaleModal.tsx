import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesApi } from '../../api/salesApi';
import { productsApi } from '../../api/productsApi';
import { formatCurrency } from '../../utils/formatters';
import type { CreateSaleItemDto } from '../../types/sale.types';

interface Props {
  onClose: () => void;
}

const CreateSaleModal = ({ onClose }: Props) => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CreateSaleItemDto[]>([
    { productId: 0, quantity: 1, unitPrice: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productsApi.getAll({ page: 1, pageSize: 100 }),
  });

  const products = productsData?.data?.items ?? [];

  const subTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subTotal * (taxRate / 100);
  const totalAmount = subTotal + taxAmount - discount;

  const handleProductChange = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId,
      unitPrice: product?.sellingPrice ?? 0,
    };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { productId: 0, quantity: 1, unitPrice: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const createMutation = useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      toast.success('Sale created successfully!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? 'Failed to create sale.');
    },
  });

  const handleSubmit = () => {
    if (items.some(i => i.productId === 0)) {
      toast.error('Please select a product for all items.');
      return;
    }
    createMutation.mutate({
      items,
      taxRate: taxRate / 100,
      discount,
      paymentMethod,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Create New Sale</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Items</label>
              <button onClick={addItem} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <select
                      className="input text-sm"
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, Number(e.target.value))}
                    >
                      <option value={0}>Select product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      className="input text-sm"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].quantity = Number(e.target.value);
                        setItems(newItems);
                      }}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      className="input text-sm"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].unitPrice = Number(e.target.value);
                        setItems(newItems);
                      }}
                    />
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium text-gray-700">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {items.length > 1 && (
                      <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Tax Rate (%)</label>
              <input
                type="number"
                className="input"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Discount ($)</label>
              <input
                type="number"
                className="input"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option>Cash</option>
                <option>Card</option>
                <option>Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {createMutation.isPending && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Create Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSaleModal;