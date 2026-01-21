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
    { name: 'Inicio', url: '/home' },
    { name: 'Configuración', url: '/settings' },
    { name: 'Usuarios', url: '/settings/users' }
  ];

  // Función para cargar usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await UserService.getAllUsers();
      // Mapeamos los datos para que coincidan con lo que espera InteractiveTable
      // Ajusta las keys según venga tu backend nuevo
      const formattedData = data.map(u => ({
        id: u.id, // ID único para la tabla
        nombre: `${u.firstName} ${u.lastName}`,
        email: u.email,
        usuario: u.username,
        rol: u.role?.name || 'Sin Rol', // Asumiendo relación
        entidad: u.client?.name || u.provider?.name || 'N/A',
        estado: u.isActive ? 'Activo' : 'Inactivo',
        // Guardamos el objeto original por si necesitamos editar
        originalData: u 
      }));
      
      setUsers(formattedData);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
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
          columns={[
            { header: 'Nombre', accessor: 'nombre' },
            { header: 'Usuario', accessor: 'usuario' },
            { header: 'Email', accessor: 'email' },
            { header: 'Rol', accessor: 'rol' },
            { header: 'Entidad', accessor: 'entidad' },
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