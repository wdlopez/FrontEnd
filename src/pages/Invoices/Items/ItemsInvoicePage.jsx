import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddItemInvoiceModal from '../../../components/organisms/Forms/AddItemInvoiceModal';
import Alerts from '../../../components/molecules/Alerts';
import ItemInvoiceService from '../../../services/Invoices/Items/invoice-item.service';
import { normalizeList } from '../../../utils/api-helpers';

const ItemsInvoicePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Facturas", url: "/invoices" },
    { name: "Detalle de Ítems", url: "/invoices/items" }
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await ItemInvoiceService.getAllItemsInvoice();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, index) => ({
        ...item,
        index: index + 1,
        desc_short: item.description?.substring(0, 30) + (item.description?.length > 30 ? '...' : ''),
        qty_display: Number(item.quantity).toFixed(2),
        price_display: `$${Number(item.unit_price).toLocaleString()}`,
        total_display: `$${(Number(item.quantity) * Number(item.unit_price)).toLocaleString()}`,
        invoice_ref: item.invoice_id?.substring(0, 8) + '...'
      }));

      setItems(formatted);
    } catch (error) {
        console.error("Error al obtener los ítems de factura:", error);
      setAlert({ open: true, message: "Error al obtener los ítems de factura.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Factura': 'invoice_ref',
    'Descripción': 'desc_short',
    'Cant.': 'qty_display',
    'P. Unitario': 'price_display',
    'Total': 'total_display'
  };

  return (
    <div className="p-6 space-y-6">
      <BreadCrumb paths={breadcrumbPaths} />
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert({ ...alert, open: val })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detalle de Facturación</h1>
          <p className="text-gray-500 text-sm">Listado global de conceptos cargados a las facturas.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">Cargando ítems...</div>
        ) : (
          <InteractiveTable 
            data={items}
            columnMapping={columnMapping}
            actions={true}
            onDelete={async (row) => {
              try {
                await ItemInvoiceService.deleteItemInvoice(row.id);
                fetchItems();
              } catch (e) {
                console.error("Error al eliminar ítem:", e);
                setAlert({ open: true, message: "No se pudo eliminar el ítem.", type: "error" });
              }
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Agregar Ítem"
                onRefresh={fetchItems}
              />
            }
          />
        )}
      </div>

      <AddItemInvoiceModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchItems} 
      />
    </div>
  );
};

export default ItemsInvoicePage;