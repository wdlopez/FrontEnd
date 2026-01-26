// import api from '../../config/api'; 

const DashboardService = {
  // Obtener resumen para SuperAdmin
  getSuperAdminSummary: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      clientsCount: 1, // Cambia a 0 si quieres ver el WelcomeWidget
      usersCount: 5,
      contracts: [
        {
          cont_id: 'sa-001',
          cont_name: 'Contrato Global SuperAdmin',
          total_value: 120000000,
          start_date: '2024-01-01',
          end_date: '2025-12-31',
          status: 1,
          provider: { prov_name: 'Tech Solutions Global' },
          client: { client_name: 'Corporación Alpha' }
        }
      ],
      slas: []
    };
  },

  // Obtener resumen para Admin de Contratos
  getContractAdminSummary: async (role, userId) => {
    console.log(`Cargando datos para el usuario: ${userId} con rol: ${role}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      contractsCount: 1,
      contracts: [
        {
          cont_id: 101,
          cont_name: 'Contrato de Prueba Operativo',
          total_value: 50000000,
          start_date: '2023-01-01',
          end_date: '2024-12-31',
          status: 1,
          provider: { prov_name: 'Proveedor de Prueba S.A.' },
          client: { client_name: 'Cliente Test' }
        }
      ],
      slas: [
        {
          sla_id: 1,
          cont_id: 101,
          // Asegúrate que estos nombres coincidan con los de tus componentes hijos
          servicelevels: { 
            cont_id: 101, 
            sla_minimun_target: 90, 
            sla_expect_target: 95,
            services: { service_tower: 'Infraestructura' }
          },
          sla_credit_pachieve: [98, 92, 85] 
        }
      ]
    };
  }
};

export default DashboardService;