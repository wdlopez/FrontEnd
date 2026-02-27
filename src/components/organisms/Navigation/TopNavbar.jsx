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
import { useSelectedClient } from "../../../context/ClientSelectionContext";
//import { listContract } from "../../../pages/Deliverables/delLists";

function TopBar({ darkMode, setDarkMode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  // Estado reservado para futuras funcionalidades de filtrado de contratos
  // const [contratsList, setContractList] = useState([]);
  const [modalContract, setModalContract] = useState(false);
  const [nameContract] = useState(null);
  const [selectedContracts, setSelectedContracts] = useState([]);
  const navigate = useNavigate();
  const profileButtonRef = useRef(null);
  const { unreadCount } = useUnreadNotifications();
  const { user, loading: authLoading, currentKeyClient } = useAuth();
  const { selectedClient, setSelectedClient, clearSelection } =
    useSelectedClient();
  const userRol = user?.role;
  const isSuperAdmin =
    userRol === "super_admin" || userRol === 1 || userRol === "1";

  const isClientScopedRole =
    typeof userRol === "string" && userRol.startsWith("client_");

  // Normaliza el nombre del esquema para alinearlo con la convención del backend.
  // Ejemplos:
  //  - "Microsoft"        -> "schema_microsoft"
  //  - "Andrea fashion"   -> "schema_andrea_fashion"
  //  - "Schema_ACME PROD" -> "schema_acme_prod"
  const buildSchemaNameForClient = (client) => {
    if (!client) return null;

    // 1) Tomamos un valor base que pueda representar el esquema,
    //    priorizando campos específicos si existen.
    const rawBase =
      client.schema ||
      client.schema_name ||
      client.key_client ||
      client.slug ||
      client.name ||
      client.legal_name ||
      client.company_name;

    if (!rawBase) return null;

    // 2) Normalizamos: quitamos tildes, pasamos a minúsculas y
    //    convertimos espacios/símbolos en "_".
    let normalized = String(rawBase)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // elimina acentos
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_") // todo lo que no sea [a-z0-9] -> "_"
      .replace(/^_+|_+$/g, ""); // sin guiones bajos al inicio/fin

    if (!normalized) return null;

    // 3) Aseguramos el prefijo "schema_" sin duplicarlo
    normalized = normalized.replace(/^schema_+/, "");

    return `schema_${normalized}`;
  };

  const handleClients = async () => {
    // Solo el super_admin global puede cambiar de cliente desde el topbar
    if (isSuperAdmin) {
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
          { value: 0, label: "Ver todos los clientes", schema: null },
          // Ajustamos el mapeo basándonos en la respuesta del backend.
          // Intentamos inferir el campo de esquema a partir de varias propiedades posibles
          // y, si no existe, lo normalizamos a la convención "schema_{cliente}".
          ...clientsData.map((c) => ({
            value: c.id,
            label: c.name,
            schema: buildSchemaNameForClient(c),
          })),
        ];

        setClients(clientsList);
      } catch (error) {
        console.error("Error al cargar clientes en TopBar:", error);
        setClients([]);
      }
    }

    // TODO: si en el futuro se reactiva el listado de contratos desde aquí,
    // este bloque deberá rehacerse usando servicios tipados.
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    handleClients();
  };

  const handleSubmit = (data) => {
    if (data.client === 0 || data.client === "0") {
      // Si selecciona "Ver todos los clientes"
      clearSelection();
      setIsModalOpen(false);
      navigate("/contract/general");
    } else {
      const selectedClientData = clients.find((c) => c.value === data.client);
      if (selectedClientData) {
        setSelectedClient({
          id: selectedClientData.value,
          name: selectedClientData.label,
          schema: selectedClientData.schema ?? null,
        });
        navigate(`/contract/client/${data.client}`);
      }
      setIsModalOpen(false);
    }
  };
  // Modificamos el manejador de selección
  const handleContractSelect = (data) => {
    const contIds = data.cont.map((id) => parseInt(id, 10));

    if (contIds.includes(0)) {
      // Seleccionar todos los contratos (excluyendo la opción 0)
      sessionStorage.removeItem("selected_contract_ids");
      sessionStorage.removeItem("selected_contract_names");
      setSelectedContracts([]);
    } else {
      // Persistimos solo los IDs seleccionados; los nombres se resolverán
      // en las pantallas específicas de contratos.
      sessionStorage.setItem(
        "selected_contract_ids",
        JSON.stringify(contIds),
      );
    }

    setModalContract(false);
    setTimeout(() => window.location.reload(), 100);
  };


  useEffect(() => {
    if (!authLoading && userRol && isSuperAdmin) {
      // Cargamos la lista de clientes disponible para el super_admin
      handleClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, userRol, isSuperAdmin]);

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
    const raw = sessionStorage.getItem("selected_contract_names");
    if (!raw) return;
    try {
      const savedNames = JSON.parse(raw) || [];
      setSelectedContracts(savedNames);
    } catch {
      setSelectedContracts([]);
    }
  }, []);

  const handleCloseSession = () => {
    // Limpiar el client_id y contratos seleccionados al cerrar sesión
    clearSelection();
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
          <p>
            {user?.fullName ||
              [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
              user?.email ||
              "Usuario"}
          </p>
          <Toolbar message={userRol} position="top">
            <p>
              {userRol === "super_admin"
                ? "Super Administrador Global"
                : userRol === "client_superadmin"
                  ? "Administrador de Cliente"
                  : userRol === "client_contract_admin"
                    ? "Administrador de Contratos"
                    : "Usuario"}
            </p>
          </Toolbar>
        </div>

        {/* Selector de cliente */}
        {isSuperAdmin ? (
          // Super admin global: puede seleccionar y cambiar cliente
          <div className="flex flex-col justify-center">
            <p>Cliente:</p>
            {!selectedClient || !selectedClient.name ? (
              <button onClick={handleOpenModal} className="btn btn-primary">
                Seleccionar
              </button>
            ) : (
              <Toolbar
                message={"Doble clic para cambiar de cliente"}
                position="top"
              >
                <div
                  onDoubleClick={handleOpenModal}
                  className="px-2 py-1 rounded-md hover:bg-gray-500 cursor-pointer"
                >
                  <p className="rounded-md border-gray-600">
                    {selectedClient?.name || "Seleccionar"}
                  </p>
                </div>
              </Toolbar>
            )}
          </div>
        ) : isClientScopedRole ? (
          // Roles client_* (ej. client_superadmin, client_contract_admin, etc.):
          // muestran solo el cliente asociado y NO se puede modificar.
          <div className="flex flex-col justify-center">
            <p className="text-xs opacity-70">Cliente:</p>
            <b className="text-sm">
              {currentKeyClient || selectedClient || "Asociado por token"}
            </b>
          </div>
        ) : (
          // Otros roles (por ejemplo, proveedores u otros tipos)
          <div className="flex gap-4">
            {user?.client_name && (
              <div className="flex flex-col">
                <p className="text-xs opacity-70">Cliente:</p>
                <b className="text-sm">{user.client_name}</b>
              </div>
            )}
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
        <h2 className="mb-3">
          <b>Seleccione un Cliente</b>
        </h2>
        <div className="mt-2 flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">
            Lista de Clientes
          </label>
          <select
            className="border p-2 rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none"
            defaultValue=""
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;
              const parsedValue = Number.isNaN(Number(value))
                ? value
                : Number(value);
              handleSubmit({ client: parsedValue });
            }}
          >
            <option value="">Seleccione un cliente...</option>
            {clients.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
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
              options: []
            }]}
            onSubmit={handleContractSelect}
          />
        </div>
      </Modal>
    </header>
  );
}

export default TopBar;


