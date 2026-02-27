import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { useForm, Controller } from "react-hook-form"; // Importamos Controller
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/teal.css";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import Toolbar from "react-multi-date-picker/plugins/toolbar";

function Form(props, ref) {
  const {
    fields = [],
    onSubmit,
    title = "",
    gridLayout = true,
    onSelectChange,
    sendMessage = "Guardar",
    initialValues = {},
    resetOnSubmit = true,
    onCancel = null,
    onDelete = null,
    showDelete = false,
    checkboxSelectAllOptions = false,
    onSpecialSelectOption,
  } = props;

  // 1. Preparamos los valores iniciales igual que antes
  const initialFormState = fields.reduce((acc, field) => {
    if (field.type === "file")
      acc[field.name] = []; // File input en RHF suele ser array o FileList
    else if (field.type === "checkbox") acc[field.name] = [];
    else if (field.type === "multidate") acc[field.name] = [];
    else {
      // Usamos Object.prototype.hasOwnProperty.call para evitar el error del linter
      acc[field.name] = Object.prototype.hasOwnProperty.call(
        initialValues,
        field.name,
      )
        ? initialValues[field.name]
        : "";
    }
    return acc;
  }, {});

  // 2. Inicializamos react-hook-form
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: initialFormState,
    mode: "onChange", // Valida mientras el usuario escribe
  });

  const [openPickers, setOpenPickers] = useState({});
  const multipleCustomSelects = fields.filter((f) => f.customSelect).length > 1;

  // Estado para el modal de confirmación
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  // Si cambian los initialValues externos, reseteamos el formulario
  useEffect(() => {
    if (Object.keys(initialValues).length > 0 && !isDirty) {
      reset(initialFormState);
  }
  }, [initialValues, reset, isDirty]);

  // 3. Manejo Imperativo (desde el padre)
  useImperativeHandle(ref, () => ({
    requestClose: () => {
      // isDirty viene nativo de RHF
      if (isDirty) {
        setConfirm({
          open: true,
          title: "Salir sin guardar",
          message:
            "¿Estás seguro de que quieres salir? Se perderán los cambios no guardados",
          type: "confirm",
          onConfirm: () => {
            reset(); // Limpia el formulario
            if (onCancel) onCancel();
          },
        });
      } else {
        if (onCancel) onCancel();
      }
    },
  }));

  // 4. Función intermedia para manejar el envío
  // RHF valida antes de llamar a esta función. 'data' contiene los valores del formulario.
  const onSubmitHandler = (data) => {
    setConfirm({
      open: true,
      title: "Confirmar guardado",
      message: "¿Confirmas que deseas crear/guardar este registro?",
      type: "confirm",
      onConfirm: async () => {
        try {
          await onSubmit(data);
          if (resetOnSubmit) reset();
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  // Clases de estilo: bordes neutros (gris/blanco), botones se mantienen azules
  const inputBase =
    "w-full rounded-[8px] bg-white dark:bg-gray-700 border px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none";
  const inputClass = (name) =>
    errors[name]
      ? `${inputBase} border-red-500 ring-red-500`
      : `${inputBase} border-gray-200 dark:border-gray-600 focus:border-gray-400 focus:ring-1 focus:ring-gray-300 dark:focus:border-gray-500 dark:focus:ring-gray-500`;
  const textareaClass = (name) => `${inputClass(name)} min-h-[120px]`;
  const selectClass = (name) => `${inputClass(name)} appearance-none`;

  const genPlaceholder = (f) => {
    if (f.placeholder) return f.placeholder;
    // ... tu lógica de placeholders se mantiene igual ...
    const label = (f.label || f.name || "").toString();
    const key = (f.name + " " + label).toLowerCase();
    if (
      /name|nombre|usuario|cliente|proveedor|apellido|santiago|nombre/i.test(
        key,
      )
    )
      return "Santiago Pérez";
    if (/email|correo/i.test(key)) return "correo@ejemplo.com";
    if (/phone|cel|telefono|teléfono|movil/i.test(key)) return "912345678";
    if (/date|fecha|start|end|inicio|fin/i.test(key)) return "";
    if (f.type === "number") return "Ej: 1000";
    if (f.type === "textarea") return "Escribe aquí una descripción...";
    return `Ej: ${label.replace(/[:\n]/g, "")}`;
  };

  const formClass = `${gridLayout ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden max-h-[80vh] w-full">
      {/* RHF maneja el submit aquí */}
      <form
        onSubmit={handleSubmit(onSubmitHandler)}
        className="flex flex-col h-full"
      >
        {title && (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
        )}

        <div className="p-6 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          <div className={formClass}>
            {fields.map((f, idx) => {
              const isFull =
                f.fullWidth ||
                /(direccion|address)/i.test(f.name) ||
                f.type === "textarea" ||
                f.fullSpan;
              const span = isFull ? "col-span-full" : "";

              // Reglas de validación estándar para RHF
              const validationRules = {
                required: f.required ? "Este campo es obligatorio" : false,
              };

              // Agregar patrón (regex) si existe
              if (f.pattern) {
                validationRules.pattern = {
                  value: f.pattern,
                  message: f.patternMessage || `${f.label} tiene un formato inválido`
                };
              }

              return (
                <div key={idx} className={`${span} flex flex-col gap-0.5`}>
                  <label className="text-blue-900 dark:text-blue-300 font-medium mb-0.5 flex items-center gap-1 text-sm">
                    {f.label}{" "}
                    {f.required && <span className="text-red-500">*</span>}
                  </label>

                  {/* LOGICA DE RENDERIZADO POR TIPO */}
                  {f.type === "multidate" ? (
                    // Usamos Controller para librerías externas como DatePicker
                    <Controller
                      control={control}
                      name={f.name}
                      rules={validationRules}
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          multiple
                          value={value}
                          open={!!openPickers[f.name]}
                          onOpen={() =>
                            setOpenPickers((p) => ({ ...p, [f.name]: true }))
                          }
                          onClose={() =>
                            setOpenPickers((p) => ({ ...p, [f.name]: false }))
                          }
                          onClickOutside={() =>
                            setOpenPickers((p) => ({ ...p, [f.name]: false }))
                          }
                          onChange={(arr) =>
                            onChange(arr.map((d) => d.format("YYYY-MM-DD")))
                          } // Adaptamos el valor para RHF
                          format="YYYY-MM-DD"
                          plugins={[
                            <DatePanel key="dp" />,
                            <Toolbar key="tb" position="top" />,
                          ]}
                          render={
                            <input
                              type="date"
                              className={inputClass(f.name)}
                              placeholder={genPlaceholder(f)}
                            />
                          }
                        />
                      )}
                    />
                  ) : f.type === "file" ? (
                    // Los inputs de tipo file usan register normal, pero no pueden tener value controlado
                    <input
                      type="file"
                      disabled={f.disabled}
                      className={inputClass(f.name)}
                      {...register(f.name, validationRules)}
                    />
                  ) : f.type === "checkbox" ? (
                    // Controller para manejar lógica compleja de arrays de checkboxes
                    <Controller
                      name={f.name}
                      control={control}
                      rules={validationRules}
                      render={({ field: { value = [], onChange } }) => (
                        <div className="flex flex-col gap-2">
                          {checkboxSelectAllOptions && (
                            <div className="flex gap-2 mb-2">
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md text-gray-700 bg-white"
                                onClick={() =>
                                  onChange(f.options?.map((o) => o.value) || [])
                                }
                              >
                                Seleccionar todos
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md text-gray-700 bg-white"
                                onClick={() => onChange([])}
                              >
                                Deseleccionar todos
                              </button>
                            </div>
                          )}
                          {f.options?.map((opt, i) => (
                            <label key={i} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={opt.value}
                                checked={value.includes(opt.value)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  let arr = [...value];
                                  if (checked) arr.push(opt.value);
                                  else arr = arr.filter((v) => v !== opt.value);
                                  onChange(arr); // Actualiza el estado de RHF
                                }}
                                className="w-4 h-4 text-blue-800 border-gray-300 rounded focus:ring-blue-700"
                              />
                              <span className="text-blue-900 dark:text-blue-200">
                                {opt.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    />
                  ) : f.type === "select" ? (
                    // Select nativo
                    <select
                      className={selectClass(f.name)}
                      disabled={f.disabled}
                      {...register(f.name, {
                        ...validationRules,
                        onChange: (e) => {
                          const val = e.target.value;

                          // Opción especial: abrir modal (ej. "Crear proveedor")
                          if (onSpecialSelectOption && f.name === onSpecialSelectOption.field && val === onSpecialSelectOption.value) {
                            onSpecialSelectOption.callback();
                            setValue(f.name, "");
                            return;
                          }

                          // 1. Ejecutar el onChange específico del campo (EL QUE NECESITAMOS)
                          if (f.onChange) {
                            f.onChange(e);
                          }

                          // 2. Ejecutar la lógica vieja por si otros formularios la usan
                          if (f.customSelect && onSelectChange) {
                            if (multipleCustomSelects)
                              onSelectChange({ name: f.name, value: val });
                            else onSelectChange(val);
                          }
                        },
                      })}
                    >
                      <option value="" disabled>
                        Seleccione una opción
                      </option>
                      {f.options?.map((opt, i) => (
                        <option
                          key={i}
                          value={opt.value}
                          className={`dark:text-gray-100 ${opt.resalt ? "bg-blue-800 text-white" : "text-gray-900"}`}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    // Textarea nativo
                    <textarea
                      rows={4}
                      className={textareaClass(f.name)}
                      placeholder={genPlaceholder(f)}
                      {...register(f.name, validationRules)}
                      onInput={(e) => f.onInput && f.onInput(e)}
                    />
                  ) : (
                    // Inputs estándar (text, number, email, etc)
                    <input
                      type={f.type}
                      disabled={f.disabled}
                      className={inputClass(f.name)}
                      placeholder={genPlaceholder(f)}
                      {...register(f.name, {
                        ...validationRules,
                        onChange: (e) => {
        if (f.onChange) f.onChange(e); // React Hook Form usa onChange para capturar el valor
      },
                      })}
                      onInput={(e) => {
      if (f.onInput) f.onInput(e); // Esto ejecutará la prop onInput si existe en el objeto del campo
    }}
                    />
                  )}

                  {errors[f.name] && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors[f.name]?.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
          {showDelete && onDelete && (
            <button
              type="button"
              onClick={() =>
                setConfirm({
                  open: true,
                  title: "Confirmar borrado",
                  message:
                    "¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer",
                  type: "danger",
                  onConfirm: async () => {
                    try {
                      await onDelete();
                    } catch (err) {
                      console.error(err);
                    }
                  },
                })
              }
              className="inline-flex items-center px-4 py-2 border border-red-600 rounded-md text-red-600 bg-white hover:bg-red-50"
            >
              Borrar registro
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setConfirm({
                open: true,
                title: "Borrar datos ingresados",
                message:
                  "¿Estás seguro de borrar los datos ya ingresados? Se limpiará el formulario.",
                type: "confirm",
                onConfirm: () => {
                  reset();
                  setConfirm({ ...confirm, open: false });
                },
              })
            }
            className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 bg-white hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            Borrar
          </button>

          <button
            type="submit"
            disabled={!isValid}
            className={`inline-flex items-center px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 font-bold tracking-wide ${
              isValid
                ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70 focus:ring-gray-400"
            }`}
          >
            {sendMessage}
          </button>
        </div>

        {/* Modal de confirmación (Se mantiene igual, solo cambia el onClick del cancelar) */}
        {confirm.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black opacity-30"
              onClick={() => setConfirm({ ...confirm, open: false })}
            ></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 w-full max-w-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {confirm.title}
              </h4>
              <p
                className={`text-sm mb-4 ${confirm.type === "danger" ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}
              >
                {confirm.message}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white"
                  onClick={() => setConfirm({ ...confirm, open: false })}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md text-white ${confirm.type === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-blue-800 hover:bg-blue-900"}`}
                  onClick={async () => {
                    try {
                      if (confirm.onConfirm) await confirm.onConfirm();
                    } catch (err) {
                      console.error("Confirm action error", err);
                    } finally {
                      setConfirm({ ...confirm, open: false });
                    }
                  }}
                >
                  {confirm.type === "danger" ? "Eliminar" : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default forwardRef(Form);
