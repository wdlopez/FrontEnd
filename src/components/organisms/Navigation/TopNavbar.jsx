import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
//import image from "../../../assets/images/image.png";
import Form from "../Forms/form";
import SearchBar from "../../molecules/searchBar";
import logoutService from "../../../services/user-services/logout";
//import darkModeImage from "../../../assets/images/freepik_br_e1d79d38-8918-400d-869e-4731634c668a.png";
import Modal from "../../molecules/modal";
import getClientSInService from "../../../services/clients-service/getClientA";
import Toolbar from "./toolBar";
import DarkModeToggle from "../../atoms/darckModeBtn";
import useUnreadNotifications from "../../../hooks/useUnreadNotifications";
import { listContract } from "../../../pages/Deliverables/delLists";

function TopBar({ name, darkMode, rolName,rol ,clientName, provider, userRol, setDarkMode }) {
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

  const handleClients = async () => {
    if (userRol === 1) {
      const clients = await getClientSInService.getClientA();
      const clientsList = [
        { value: 0, label: "Ver todos los clientes" }, // Nueva opción
        ...clients.data.map((c) => ({ value: c.client_id, label: c.client_name }))
      ];
      setClients(clientsList);
      const savedClientId = sessionStorage.getItem('selected_client_id');
      if (savedClientId) {
        const savedClient = clientsList.find(c => c.value === parseInt(savedClientId));
        if (savedClient) {
          setSelectedClient(savedClient.label);
        }
      }
    }
    try {
      const contracts = await listContract(userRol);
      // console.log(userRol);
      // console.log(contracts);
      const adjusted = contracts.length > 0
        ? [{ ...contracts[0], label: "Seleccionar todos" }, ...contracts.slice(1)]
        : [];
      setContractList(adjusted);
    } catch (error) {
      setContractList([]);
    }

    // Verificar si hay un cliente seleccionado en el SessionStorage
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    handleClients();
  };

  const handleSubmit = (data) => {
    if (parseInt(data.client) === 0) {
      // Si selecciona "Ver todos los clientes"
      sessionStorage.removeItem('selected_client_id');
      sessionStorage.removeItem('selected_client_name');
      setSelectedClient(null);
      setIsModalOpen(false);
      navigate('/Contract/general');
      // Recargar la página después de un breve delay para asegurar que la navegación se complete
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      const selectedClientData = clients.find((c) => c.value === parseInt(data.client));
      if (selectedClientData) {
        setSelectedClient(selectedClientData.label);
        // Guardar tanto el ID como el nombre del cliente
        sessionStorage.setItem('selected_client_id', JSON.stringify([parseInt(data.client)]));
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
    // Cargar la lista de clientes y el cliente seleccionado al montar el componente
    handleClients();
  }, [userRol]);

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
    logoutService.logout();
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
          <p>{name}</p>
        <Toolbar message={rol} position="top" ><p>{rolName}</p></Toolbar>
        </div>

        {userRol === 1 ? (
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
          <div>
            {clientName && (<div className="flex flex-col">
              <p>Cliente:</p>
              <b>{clientName}</b>
            </div>)}
            {provider && (<div className="flex flex-col">
              <p>Proveedor:</p>
              <b>{provider}</b>
            </div>)}
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


