// Variables globales para almacenar los datos del Excel
let dataDia1 = [];
let dataDia2 = [];
const NUM_COLUMNS = 5;

// Elementos del DOM
const inputExcel = document.getElementById("inputExcel");
const seleccionDiaDiv = document.getElementById("seleccion-dia");
const botonDia1 = document.getElementById("botonDia1");
const botonDia2 = document.getElementById("botonDia2");
const rutinaContainer = document.getElementById("rutina-container");
const tbodyRutina = document.getElementById("tbodyRutina");

// NUEVAS REFERENCIAS para la pregunta de si es mujer y el select de fase del ciclo
const preguntaMujerDiv = document.getElementById("preguntaMujer");
const esMujerCheckbox = document.getElementById("esMujer");
const faseCicloSelect = document.getElementById("faseCiclo");

// Cuando el usuario marca/desmarca el checkbox:
esMujerCheckbox.addEventListener("change", () => {
  if (esMujerCheckbox.checked) {
    // Mostrar el <select>
    faseCicloSelect.classList.remove("oculto");
  } else {
    // Ocultarlo de nuevo
    faseCicloSelect.classList.add("oculto");
  }
});


// ----------------------------------------------------------------------------------
// 1. LECTURA DEL ARCHIVO EXCEL
// ----------------------------------------------------------------------------------
inputExcel.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    // Nombres de las hojas
    const sheetNames = workbook.SheetNames;

    // Procesar "Dia 1"
    if (sheetNames.includes("Dia 1")) {
      const wsDia1 = workbook.Sheets["Dia 1"];
      dataDia1 = XLSX.utils.sheet_to_json(wsDia1, {
        header: 1,
        range: 2
      });
    }

    // Procesar "Dia 2"
    if (sheetNames.includes("Dia 2")) {
      const wsDia2 = workbook.Sheets["Dia 2"];
      dataDia2 = XLSX.utils.sheet_to_json(wsDia2, {
        header: 1,
        range: 2
      });
    }

    alert("Archivo Excel cargado. Ahora selecciona el Día.");

    // Se muestra la sección para elegir el día
    seleccionDiaDiv.classList.remove("oculto");
  };

  reader.readAsArrayBuffer(file);
});

// ----------------------------------------------------------------------------------
// 2. SELECCIÓN DEL DÍA
// ----------------------------------------------------------------------------------
botonDia1.addEventListener("click", () => {
  mostrarRutina(1);
});
botonDia2.addEventListener("click", () => {
  mostrarRutina(2);
});

function mostrarRutina(dia) {
  let dataDia = (dia === 1) ? dataDia1 : dataDia2;

  if (!dataDia || dataDia.length === 0) {
    alert(`No hay datos para Día ${dia}. Verifica que la hoja 'Dia ${dia}' exista en el Excel.`);
    return;
  }

  // Ocultar la sección para subir archivo y la de selección de día
  document.getElementById("subir-archivo").classList.add("oculto");
  document.getElementById("seleccion-dia").classList.add("oculto");

  // Mostrar la sección de la pregunta "¿Eres mujer?"
  preguntaMujerDiv.classList.remove("oculto");

  // Mostramos el contenedor de la rutina
  rutinaContainer.classList.remove("oculto");

  // Limpiar contenido previo de la tabla
  tbodyRutina.innerHTML = "";

  // ------------------------------------------------
  // Fila superior: Hora Inicio + Botón "Arrancar"
  // ------------------------------------------------
  const filaInicio = document.createElement("tr");
  const celdaInicio = document.createElement("td");
  celdaInicio.colSpan = 6;
  celdaInicio.innerHTML = `
    Hora Inicio:
    <input type="text" id="horaInicio" style="width:130px;" readonly />
    <button id="btnIniciar" class="boton-gris">Arrancar</button>
  `;
  filaInicio.appendChild(celdaInicio);
  tbodyRutina.appendChild(filaInicio);

  // ------------------------------------------------
  // CREAR FILAS POR CADA REGISTRO DEL EXCEL
  // ------------------------------------------------
  dataDia.forEach((fila) => {
    const nombreEjercicio = fila[1] || "Sin nombre";
    const repeticiones = fila.slice(3, 3 + NUM_COLUMNS);

    while (repeticiones.length < NUM_COLUMNS) {
      repeticiones.push("");
    }

    // Fila: "Ejercicio" + nombre
    const trEjercicio = document.createElement("tr");
    const tdEtiquetaEj = document.createElement("td");
    tdEtiquetaEj.textContent = "Ejercicio";
    trEjercicio.appendChild(tdEtiquetaEj);

    const tdNombre = document.createElement("td");
    tdNombre.colSpan = repeticiones.length;
    tdNombre.textContent = nombreEjercicio;
    trEjercicio.appendChild(tdNombre);
    tbodyRutina.appendChild(trEjercicio);

    // Fila: "Repeticiones" + valores
    const trReps = document.createElement("tr");
    const tdEtiquetaReps = document.createElement("td");
    tdEtiquetaReps.textContent = "Repeticiones";
    trReps.appendChild(tdEtiquetaReps);

    repeticiones.forEach((rep) => {
      const tdRep = document.createElement("td");
      tdRep.textContent = rep;
      trReps.appendChild(tdRep);
    });
    tbodyRutina.appendChild(trReps);

    // Fila: "Peso" + inputs para cada set
    const trPeso = document.createElement("tr");
    const tdEtiquetaPeso = document.createElement("td");
    tdEtiquetaPeso.textContent = "Peso";
    trPeso.appendChild(tdEtiquetaPeso);

    repeticiones.forEach(() => {
      const tdInput = document.createElement("td");
      const inputP = document.createElement("input");
      inputP.type = "number";
      inputP.placeholder = "kg";
      tdInput.appendChild(inputP);
      trPeso.appendChild(tdInput);
    });
    tbodyRutina.appendChild(trPeso);

    // Fila vacía para separar ejercicios
    const trVacio = document.createElement("tr");
    const tdVacio = document.createElement("td");
    tdVacio.colSpan = repeticiones.length + 1;
    tdVacio.innerHTML = "&nbsp;";
    trVacio.appendChild(tdVacio);
    tbodyRutina.appendChild(trVacio);
  });

  // ------------------------------------------------
  // Fila inferior: Hora Final + Botón "Terminar"
  // ------------------------------------------------
  const filaFinal = document.createElement("tr");
  const celdaFinal = document.createElement("td");
  celdaFinal.colSpan = 6;
  celdaFinal.innerHTML = `
    Hora Final:
    <input type="text" id="horaFin" style="width:130px;" readonly />
    <button id="btnTerminar" class="boton-gris">Terminar</button>
  `;
  filaFinal.appendChild(celdaFinal);
  tbodyRutina.appendChild(filaFinal);

  // Asignar eventos a los botones "Arrancar" / "Terminar"
  const btnIniciar = document.getElementById("btnIniciar");
  const btnTerminar = document.getElementById("btnTerminar");
  const horaInicio = document.getElementById("horaInicio");
  const horaFin = document.getElementById("horaFin");

  btnIniciar.addEventListener("click", () => {
    horaInicio.value = formatearFecha(new Date());
  });

  btnTerminar.addEventListener("click", () => {
    horaFin.value = formatearFecha(new Date());
    const exportarContainer = document.getElementById("exportar-datos");
    exportarContainer.classList.remove("oculto");

    document.getElementById("btnExportar").addEventListener("click", exportarDatosExcelJS);
  });
}

// Función para formatear fecha/hora (dd/mm/yyyy HH:MM)
function formatearFecha(fecha) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

// ----------------------------------------------------------------------------------
// 3. OBTENER DATOS DEL CLIMA (OpenWeatherMap)
// ----------------------------------------------------------------------------------
const btnActualizarClima = document.getElementById("btnActualizarClima");
const tempP = document.getElementById("temp");
const humedadP = document.getElementById("humedad");
const presionP = document.getElementById("presion");

if (btnActualizarClima) {
  btnActualizarClima.addEventListener("click", () => {
    const apiKey = "4924704172a54640e12d553024517ad4";
    const ciudad = "Buenos Aires,AR";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener datos del clima");
        }
        return response.json();
      })
      .then((data) => {
        const temperatura = data.main.temp;
        const humedad = data.main.humidity;
        const presion = data.main.pressure;

        tempP.textContent = `Temperatura: ${temperatura} °C`;
        humedadP.textContent = `Humedad: ${humedad} %`;
        presionP.textContent = `Presión: ${presion} hPa`;
      })
      .catch((error) => {
        console.error(error);
        alert("No se pudo obtener la información del clima.");
      });
  });
}

// ----------------------------------------------------------------------------------
// 4. EXPORTAR DATOS A EXCEL CON EXCELJS
// ----------------------------------------------------------------------------------
async function exportarDatosExcelJS() {
  // 1) Obtener horas de inicio y fin
  const horaInicioInput = document.getElementById("horaInicio").value;
  const horaFinInput = document.getElementById("horaFin").value;
  if (!horaInicioInput || !horaFinInput) {
    alert("Falta la hora de inicio o la hora de finalización.");
    return;
  }

  const [fechaInicio, horaInicioPart] = horaInicioInput.split(" ");
  const [fechaFin, horaFinPart] = horaFinInput.split(" ");
  const partesInicio = horaInicioPart.split(":");
  if (partesInicio.length === 2) {
    partesInicio.push("00");
  }
  const [hI, mI, sI] = partesInicio;
  const partesFin = horaFinPart.split(":");
  if (partesFin.length === 2) {
    partesFin.push("00");
  }
  const [hF, mF, sF] = partesFin;
  const [diaI, mesI, anioI] = fechaInicio.split("/");
  const [diaF, mesF, anioF] = fechaFin.split("/");

  const dateInicio = new Date(anioI, mesI - 1, diaI, hI, mI, sI);
  const dateFin = new Date(anioF, mesF - 1, diaF, hF, mF, sF);
  const diffMs = dateFin - dateInicio;
  if (diffMs < 0) {
    alert("La hora de finalización es anterior a la de inicio.");
    return;
  }
  const timeFraction = diffMs / (24 * 3600 * 1000);

  // 2) Obtener datos del clima
  const tempText = document.getElementById("temp").textContent;
  const humedadText = document.getElementById("humedad").textContent;
  const presionText = document.getElementById("presion").textContent;

  const tempMatch = tempText.match(/([-]?\d+(\.\d+)?)/);
  const humedadMatch = humedadText.match(/(\d+(\.\d+)?)/);
  const presionMatch = presionText.match(/(\d+(\.\d+)?)/);

  const temperatura = tempMatch ? tempMatch[0] : "";
  const humedad = humedadMatch ? humedadMatch[0] : "";
  const presion = presionMatch ? presionMatch[0] : "";

  // 3) Extraer datos de la tabla (excepto la primera y última fila)
  const filasTabla = document.querySelectorAll("#tablaRutina tr");
  const datosEntrenamiento = [];
  for (let i = 1; i < filasTabla.length - 1; i++) {
    const celdas = filasTabla[i].querySelectorAll("td");
    const fila = [];
    celdas.forEach((celda) => {
      const input = celda.querySelector("input");
      if (input) {
        fila.push(input.value);
      } else {
        fila.push(celda.textContent.trim());
      }
    });
    datosEntrenamiento.push(fila);
  }

  // 4) Construir la matriz para la parte superior del Excel
  const sheetData = [
    ["Día:", fechaInicio, null, null, "Temperatura:", temperatura],
    ["Hora Inicio:", horaInicioInput.split(" ")[1], null, null, "Humedad:", humedad],
    ["Hora Final:", horaFinInput.split(" ")[1], null, null, "Presión:", presion],
    ["Tiempo Total:", timeFraction],
    [],
    ["Entrenamiento:"],
    []
  ];

  // Agregar la tabla de entrenamiento a partir de la fila 8
  sheetData.push(...datosEntrenamiento);

  // 5) Crear libro y hoja con ExcelJS
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Resumen");

  sheetData.forEach((rowData, idx) => {
    const row = worksheet.getRow(idx + 1);
    rowData.forEach((value, colIndex) => {
      row.getCell(colIndex + 1).value = value;
    });
  });

  // 6) Aplicar formato: combinar celdas, bordes, etc.
  worksheet.mergeCells("A6:F6");
  const cellA6 = worksheet.getCell("A6");
  cellA6.alignment = { horizontal: "center", vertical: "middle" };
  cellA6.font = { bold: true };
  worksheet.getCell("B4").numFmt = "hh:mm:ss";

  function applyAllThinBorders(ws, startRow, startCol, endRow, endCol) {
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = ws.getCell(r, c);
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } }
        };
      }
    }
  }

  function applyThickOutside(ws, startRow, startCol, endRow, endCol) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getCell(startRow, c);
      cell.border = { ...cell.border, top: { style: "medium", color: { argb: "FF000000" } } };
    }
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getCell(endRow, c);
      cell.border = { ...cell.border, bottom: { style: "medium", color: { argb: "FF000000" } } };
    }
    for (let r = startRow; r <= endRow; r++) {
      const cell = ws.getCell(r, startCol);
      cell.border = { ...cell.border, left: { style: "medium", color: { argb: "FF000000" } } };
    }
    for (let r = startRow; r <= endRow; r++) {
      const cell = ws.getCell(r, endCol);
      cell.border = { ...cell.border, right: { style: "medium", color: { argb: "FF000000" } } };
    }
  }

  applyAllThinBorders(worksheet, 1, 1, 4, 2);
  applyThickOutside(worksheet, 1, 1, 4, 2);
  applyAllThinBorders(worksheet, 1, 5, 3, 6);
  applyThickOutside(worksheet, 1, 5, 3, 6);

  for (let i = 0; i < datosEntrenamiento.length; i += 4) {
    const blockTop = 8 + i;
    const blockBottom = blockTop + 2;
    let maxCols = 1;
    for (let r = i; r < i + 3 && r < datosEntrenamiento.length; r++) {
      if (datosEntrenamiento[r].length > maxCols) {
        maxCols = datosEntrenamiento[r].length;
      }
    }
    applyAllThinBorders(worksheet, blockTop, 1, blockBottom, maxCols);
    applyThickOutside(worksheet, blockTop, 1, blockBottom, maxCols);
  }

  worksheet.columns.forEach((column) => {
    column.width = 12.3;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "DatosEntrenamiento.xlsx");
}

// Evento para mostrar el botón Exportar al presionar "Terminar"
btnTerminar.addEventListener("click", () => {
  horaFin.value = formatearFecha(new Date());
  const exportarContainer = document.getElementById("exportar-datos");
  exportarContainer.classList.remove("oculto");
  document.getElementById("btnExportar").addEventListener("click", exportarDatosExcelJS);
});
