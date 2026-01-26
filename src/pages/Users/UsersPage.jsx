import React, { useState, useEffect } from 'react';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import AddUserModal from '../../components/organisms/Forms/AddUserModal';
import UserService from '../../services/User/user.service';
import Swal from 'sweetalert2';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Breadcrumbs
  const paths = [
    { name: 'Inicio', url: '/dashboard' },
    { name: 'Configuración', url: '/settings' },
    { name: 'Usuarios', url: '/settings/users' }
  ];

  // Función para cargar usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await UserService.getAllUsers();
      console.log("📦 Estructura recibida:", response); // Para confirmar
      
      let usersArray = [];

      if (response?.data?.data && Array.isArray(response.data.data)) {
         usersArray = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
         usersArray = response.data;
      } else if (Array.isArray(response)) {
         usersArray = response;
      } else {
         console.warn("⚠️ No se encontró el array de usuarios. Estructura desconocida.");
         usersArray = [];
      }
      const formattedData = usersArray.map((u, i) => ({
        "N°": i + 1,
        nombre: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        email: u.email,
        estado: u.isActive ? 'Activo' : 'Inactivo',
        id: u.id // Se usa para la key y acciones, pero se oculta en la tabla
      }));
      
      setUsers(formattedData);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No tienes permiso para ver esta seccion de usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // Manejo de eliminación
  const handleDelete = (row) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await UserService.deleteUser(row.id);
          Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
          fetchUsers();
        } catch (error) {
          Swal.fire('Error', 'Hubo un problema al eliminar.', 'error');
          console.error(error);
        }
      }
    });
  };

  // Manejo de Edición (Opcional por ahora)
  const handleEdit = (row) => {
    console.log("Editar usuario:", row);
    // Aquí podrías abrir otro modal con los datos precargados
  };

  return (
    <div className="p-4">
      <BreadCrumb paths={paths} />
      
      <div className="mt-4 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        
        {/* Componente de Acciones de Cabecera */}
        <HeaderActions 
          onAdd={() => setIsModalOpen(true)} // Abre el modal
          onRefresh={fetchUsers}
          // Si tienes componente de exportar: ExportComponent={<ExportUser ... />}
        />
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando usuarios...</div>
      ) : (
        <InteractiveTable 
          data={users}
          hiddenColumns={['id']}
          columnWidths={[{ column: 'N°', width: '50px' }]}
          parameterId="id"
          columns={[
            { header: 'N°', accessor: 'N°' },
            { header: 'Nombre', accessor: 'nombre' },
            { header: 'Email', accessor: 'email' },
            { header: 'Estado', accessor: 'estado' },
          ]}
          onDelete={handleDelete}
          onEdit={handleEdit}
          // Si tu InteractiveTable soporta paginación interna, configúrala aquí
        />
      )}

      {/* Modal de Agregar Usuario */}
      <AddUserModal 
        open={isModalOpen} 
        setOpen={setIsModalOpen} 
        onSuccess={fetchUsers} 
      />
    </div>
  );
};

export default UsersPage;