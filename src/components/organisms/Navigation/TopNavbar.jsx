import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
//import image from "../../../assets/images/image.png";
import Form from "../Forms/form";
import SearchBar from "../../molecules/searchBar";
//import logoutService from "../../../services/user-services/logout";
//import darkModeImage from "../../../assets/images/freepik_br_e1d79d38-8918-400d-869e-4731634c668a.png";
import Modal from "../../molecules/modal";
import ClientService from "services/Clients/client.service";
import Toolbar from "./toolBar";
import DarkModeToggle from "../../atoms/darckModeBtn";
import useUnreadNotifications from "../../../hooks/useUnreadNotifications";
import { useAuth } from "../../../context/AuthContext";
//import { listContract } from "../../../pages/Deliverables/delLists";

function TopBar({ name, darkMode, setDarkMode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [contratsList, setContractList] = useState([]);
  const [modalContract, setModalContract] = useState(false);
  const [nameContract] = useState(null);
  const [selectedContracts, setSelectedContracts] = useState([]);
  const navigate = useNavigate();
  const profileButtonRef = useRef(null);
  const { unreadCount } = useUnreadNotifications();
  const { user, loading: authLoading } = useAuth();
  const userRol = user?.role;

  const handleClients = async () => {

    // Validar si el usuario tiene permiso para ver todos los clientes
    if (userRol === 'super_admin' || userRol === 'client_contract_admin' || userRol === 1 || userRol === "1") {
      try {
        const response = await ClientService.getAllClients();
        let clientsData = [];

        // Lógica robusta para extraer el array de clientes
        // Maneja diferentes formatos de respuesta: [], { data: [] }, { items: [] }, { data: { data: [] } }
        if (Array.isArray(response)) {
          clientsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          clientsData = response.data;
        } else if (response?.items && Array.isArray(response.items)) {
          clientsData = response.items;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          clientsData = response.data.data;
        }

        const clientsList = [
          { value: 0, label: "Ver todos los clientes" },
          // Ajustamos el mapeo basándonos en la respuesta del backend (ResponseDto: id, name)
          ...clientsData.map((c) => ({ value: c.id, label: c.name }))
        ];

        setClients(clientsList);

        const savedClientId = sessionStorage.getItem('selected_client_id');
        if (savedClientId) {
          // Comparación robusta convirtiendo ambos a string (para soportar UUIDs y números)
          const savedClient = clientsList.find(c => String(c.value) === String(savedClientId));
          if (savedClient) {
            setSelectedClient(savedClient.label);
          }
        }
      } catch (error) {
        console.error("Error al cargar clientes en TopBar:", error);
        setClients([]);
      }
    }

    try {
      const contracts = await listContract(userRol);
      const adjusted = contracts.length > 0
        ? [{ ...contracts[0], label: "Seleccionar todos" }, ...contracts.slice(1)]
        : [];
      setContractList(adjusted);
    } catch (error) {
      setContractList([]);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    handleClients();
  };

  const handleSubmit = (data) => {
    if (data.client === 0 || data.client === "0") {
      // Si selecciona "Ver todos los clientes"
      sessionStorage.removeItem('selected_client_id');
      sessionStorage.removeItem('selected_client_name');
      setSelectedClient(null);
      setIsModalOpen(false);
      navigate('/Contract/general');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      const selectedClientData = clients.find((c) => c.value === data.client);
      if (selectedClientData) {
        setSelectedClient(selectedClientData.label);
        // Guardar ID como string (UUID)
        sessionStorage.setItem('selected_client_id', data.client);
        sessionStorage.setItem('selected_client_name', selectedClientData.label);
        navigate(`/Contract/client/${data.client}`);
      }
      setIsModalOpen(false);
    }
  };
  // Modificamos el manejador de selección
  const handleContractSelect = (data) => {
    const contIds = data.cont.map(id => parseInt(id, 10));

    if (contIds.includes(0)) {
      // Seleccionar todos los contratos (excluyendo la opción 0)

      sessionStorage.removeItem('selected_contract_ids');
      sessionStorage.removeItem('selected_contract_names');
      setSelectedContracts([]);
    } else {
      // Filtrar contratos seleccionados
      const selected = contratsList.filter(c => contIds.includes(c.value));
      const selectedIds = selected.map(c => c.value);
      const selectedNames = selected.map(c => c.label);
      console.log(selectedIds);
      sessionStorage.setItem('selected_contract_ids', JSON.stringify(selectedIds));
      sessionStorage.setItem('selected_contract_names', JSON.stringify(selectedNames));
      setSelectedContracts(selectedNames);
    }

    setModalContract(false);
    // navigate('/Contract/deliverables');
    setTimeout(() => window.location.reload(), 100);
  };


  useEffect(() => {
    if (!authLoading && userRol) {
      handleClients();
    }
  }, [userRol, authLoading]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
        setProfileModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const savedClientName = sessionStorage.getItem('selected_client_name');
    // console.log(savedClientName)
    if (savedClientName) {

      setSelectedClient(savedClientName);
    }

    const savedNames = JSON.parse(sessionStorage.getItem('selected_contract_names')) || [];
    setSelectedContracts(savedNames);
  }, []);

  const handleCloseSession = () => {
    // Limpiar el client_id al cerrar sesión
    sessionStorage.removeItem('selected_client_id');
    sessionStorage.removeItem('selected_client_name');
    sessionStorage.removeItem('selected_contract_names');
    sessionStorage.removeItem('selected_contract_ids');
    //logoutService.logout();
    window.location.href = "/login";
  };

  return (
    <header className="w-full z-150 border-2 py-1 flex gap-11 items-center justify-between bg-blueTop text-white">
      <div className="flex items-center flex-none px-6">
        <Link to="/" className="text-xl font-bold text-white">
          <h1>ContractX</h1>
        </Link>
      </div>

      <div className="flex flex-1 justify-center">
        <SearchBar />
      </div>

      <div className="flex items-center justify-end space-x-4 text-nowrap">
        <div className="flex flex-col">
          <p>{user?.name || "Usuario"}</p>
          <Toolbar message={userRol} position="top">
            <p>{userRol === 'super_admin' ? 'Super Administrador' : userRol === 'client_contract_admin' ? 'Administrador de Contratos' : 'Usuario'}</p>
          </Toolbar>
        </div>

         {userRol === 'super_admin' || userRol === 'client_contract_admin' ? (
          <div className="flex flex-col justify-center">
            <p>Cliente:</p>
            {selectedClient === null ? (
              <button onClick={handleOpenModal} className="btn btn-primary">
                Seleccionar
              </button>
            ) : (
              <Toolbar message={'Doble clic para cambiar de cliente'} position="top">
                <div onDoubleClick={handleOpenModal} className="px-2 py-1 rounded-md hover:bg-gray-500">
                  <p className="rounded-md border-gray-600">{selectedClient}</p>
                </div>
              </Toolbar>
            )}
          </div>
        ) : (
          <div className="flex gap-4">
            {/* Cambiamos clientName por user?.client_name (o el campo que use tu API) */}
            {user?.client_name && (
              <div className="flex flex-col">
                <p className="text-xs opacity-70">Cliente:</p>
                <b className="text-sm">{user.client_name}</b>
              </div>
            )}
            {/* Cambiamos provider por user?.provider_name */}
            {user?.provider_name && (
              <div className="flex flex-col">
                <p className="text-xs opacity-70">Proveedor:</p>
                <b className="text-sm">{user.provider_name}</b>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col justify-center ml-6">
          <p>Contratos:</p>
          {selectedContracts.length > 0 ? (
            <Toolbar
              message={selectedContracts.join(', ')}
              position="top"
            >
              <div
                onDoubleClick={() => setModalContract(true)}
                className="px-2 py-1 rounded-md hover:bg-gray-500 cursor-pointer"
              >
                <p className="rounded-md border-gray-600">
                  {selectedContracts[0]}
                  {selectedContracts.length > 1 && ' ...'}
                </p>
              </div>
            </Toolbar>
          ) : (
            <button
              onClick={() => setModalContract(true)}
              className="btn btn-primary"
            >
              Seleccionar
            </button>
          )}
        </div>
        <div className="flex justify-center gap-5 px-2">
          <Link to="/perfil" className="relative">
            <span className="material-symbols-outlined">notifications</span>
            {/* RE-RENDERIZA DINÁMICAMENTE AL CAMBIAR unreadCount */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}

          </Link>
          <div className="relative" ref={profileButtonRef}>
            <button onClick={() => setProfileModalOpen((prev) => !prev)} >
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            {profileModalOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0C1F5B] border border-gray-500 rounded-md shadow-lg z-50">
                <ul>
                  <li className="px-4 py-2 hover:bg-gray-500 cursor-pointer" onClick={() => navigate("/perfil")}>
                    Perfil
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-500 cursor-pointer" onClick={() => navigate("/settings")}>
                    Ajustes
                  </li>
                  <li className="px-1 py-2 hover:bg-gray-500 cursor-pointer">
                    {nameContract ? (
                      <Toolbar message="Doble clic para cambiar contrato" position="top">
                        <div
                          onDoubleClick={() => setModalContract(true)}
                          className="px-2 py-1 rounded-md hover:bg-gray-500"
                        >
                          <p className="rounded-md border-gray-600 text-center">{nameContract}</p>
                        </div>
                      </Toolbar>
                    ) : (
                      <button
                        className="btn btn-primary w-full"
                        onClick={() => setModalContract(true)}
                      >
                        Seleccionar contrato
                      </button>
                    )}
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-500 cursor-pointer">
                    <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} type="toggle" />
                  </li>
                </ul>
              </div>
            )}
          </div>
          <button onClick={handleCloseSession}>
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>

      {/* Modal para seleccionar cliente */}
      <Modal open={isModalOpen} setOpen={setIsModalOpen}>
        <h2 className="mb-3"><b>Seleccione un Cliente</b></h2>
        <div>
          <Form
            sendMessage="Seleccionar"
            gridLayout={false}
            fields={[{ name: 'client', type: 'select', label: 'Lista de Clientes', options: clients }]}
            onSubmit={handleSubmit}
          />
        </div>
      </Modal>
      {/* modal de contrato */}
      <Modal setOpen={setModalContract} open={modalContract}>
        <h2 className="mb-3"><b>Seleccione Contratos</b></h2>
        <div>
          <Form
            sendMessage="Seleccionar"
            gridLayout={false}
            fields={[{
              name: 'cont',
              type: 'checkbox',
              label: 'Lista de Contratos',
              options: contratsList
            }]}
            onSubmit={handleContractSelect}
          />
        </div>
      </Modal>
    </header>
  );
}

export default TopBar;


