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
      // Saltamos las primeras 2 filas (encabezados hasta la fila 2),
      // de modo que la fila 3 es dataDia1[0].
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

  // Mostramos el contenedor de la rutina
  rutinaContainer.classList.remove("oculto");

  // Limpiamos el contenido previo
  tbodyRutina.innerHTML = "";

  // ------------------------------------------------
  // Fila superior: Hora Inicio + Botón "Arrancar"
  // ------------------------------------------------
  const filaInicio = document.createElement("tr");
  const celdaInicio = document.createElement("td");
  // Ajusta el colspan según cuántas columnas uses
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
    // fila[1] -> Columna B (nombre del ejercicio)
    // fila.slice(2) -> Columnas C en adelante (repeticiones)
    const nombreEjercicio = fila[1] || "Sin nombre";
    const repeticiones = fila.slice(3,3+NUM_COLUMNS);

    // Si el Excel tiene menos de 5 columnas, rellenamos con vacío
    while (repeticiones.length < NUM_COLUMNS) {
      repeticiones.push("");
    }

    // 1) Fila: "Ejercicio" + nombre
    const trEjercicio = document.createElement("tr");
    const tdEtiquetaEj = document.createElement("td");
    tdEtiquetaEj.textContent = "Ejercicio";
    trEjercicio.appendChild(tdEtiquetaEj);

    const tdNombre = document.createElement("td");
    tdNombre.colSpan = repeticiones.length;
    tdNombre.textContent = nombreEjercicio;
    trEjercicio.appendChild(tdNombre);
    tbodyRutina.appendChild(trEjercicio);

    // 2) Fila: "Repeticiones" + valores
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

    // 3) Fila: "Peso" + inputs para cada set
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

    // Fila vacía opcional para separar ejercicios
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

  // ------------------------------------------------
  // Asignar eventos a los botones "Arrancar" / "Terminar"
  // ------------------------------------------------
  const btnIniciar = document.getElementById("btnIniciar");
  const btnTerminar = document.getElementById("btnTerminar");
  const horaInicio = document.getElementById("horaInicio");
  const horaFin = document.getElementById("horaFin");

  btnIniciar.addEventListener("click", () => {
    horaInicio.value = formatearFecha(new Date());
  });

  btnTerminar.addEventListener("click", () => {
    horaFin.value = formatearFecha(new Date());
  // Mostrar el botón Exportar al terminar
  const exportarContainer = document.getElementById("exportar-datos");
  exportarContainer.classList.remove("oculto");
  
  // Asignar el evento si no se asignó previamente
  document.getElementById("btnExportar").addEventListener("click", exportarDatosExcelJS);
});
}

// Función para formatear fecha/hora (día/mes/año HH:MM)
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
    // Pon tu API key de OpenWeatherMap
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

/*****************************************************************************
 *  FUNCIÓN PRINCIPAL PARA EXPORTAR DATOS A EXCEL
 *****************************************************************************/
async function exportarDatosExcelJS() {
  // 1) OBTENER DATOS DE HORA
  const horaInicioInput = document.getElementById("horaInicio").value;
  const horaFinInput = document.getElementById("horaFin").value;
  if (!horaInicioInput || !horaFinInput) {
    alert("Falta la hora de inicio o la hora de finalización.");
    return;
  }

  // Formato "dd/mm/yyyy hh:mm(:ss)"
  const [fechaInicio, horaInicioPart] = horaInicioInput.split(" ");
  const [fechaFin, horaFinPart] = horaFinInput.split(" ");
  
  // Si solo se incluyen horas y minutos, agregamos segundos "00"
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
  // En Excel se guarda el tiempo como fracción de un día
  const timeFraction = diffMs / (24 * 3600 * 1000);

  // 2) DATOS DEL CLIMA
  const tempText = document.getElementById("temp").textContent;
  const humedadText = document.getElementById("humedad").textContent;
  const presionText = document.getElementById("presion").textContent;

  const tempMatch = tempText.match(/([-]?\d+(\.\d+)?)/);
  const humedadMatch = humedadText.match(/(\d+(\.\d+)?)/);
  const presionMatch = presionText.match(/(\d+(\.\d+)?)/);

  const temperatura = tempMatch ? tempMatch[0] : "";
  const humedad = humedadMatch ? humedadMatch[0] : "";
  const presion = presionMatch ? presionMatch[0] : "";

  // 3) EXTRAER LA TABLA DE ENTRENAMIENTO (omitiendo la 1ª y la última fila)
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
        // Incluso si está vacío, guardamos el texto (puede ser "")
        fila.push(celda.textContent.trim());
      }
    });
    // No descartamos filas vacías para conservar la fila separadora
    datosEntrenamiento.push(fila);
  }

  // 4) CONSTRUIR LA MATRIZ PARA LA PARTE SUPERIOR
  // Se crean las filas con la información del día, horas y clima.
  const sheetData = [
    ["Día:", fechaInicio, null, null, "Temperatura:", temperatura],
    ["Hora Inicio:", horaInicioInput.split(" ")[1], null, null, "Humedad:", humedad],
    ["Hora Final:", horaFinInput.split(" ")[1], null, null, "Presión:", presion],
    // Se asigna el valor numérico para "Tiempo Total"
    ["Tiempo Total:", timeFraction],
    [],
    ["Entrenamiento:"],  // Esta fila se combinará (A6:F6)
    []
  ];

  // Agregar la tabla de entrenamiento a partir de la fila 8
  sheetData.push(...datosEntrenamiento);

  // 5) CREAR LIBRO Y HOJA CON EXCELJS
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Resumen");

  // Insertar cada fila en la hoja
  sheetData.forEach((rowData, idx) => {
    const row = worksheet.getRow(idx + 1);
    rowData.forEach((value, colIndex) => {
      row.getCell(colIndex + 1).value = value;
    });
  });

  // 6) APLICAR FORMATO ESPECÍFICO

  // 6a) Combinar la celda A6:F6 (fila 6, columnas 1 a 6)
  worksheet.mergeCells("A6:F6");
  const cellA6 = worksheet.getCell("A6");
  cellA6.alignment = { horizontal: "center", vertical: "middle" };
  cellA6.font = { bold: true };

  // 6b) Formatear "Tiempo Total" (celda B4) para que se muestre como "hh:mm:ss"
  worksheet.getCell("B4").numFmt = "hh:mm:ss";

  // --- Helpers para aplicar bordes ---
  function applyAllThinBorders(ws, startRow, startCol, endRow, endCol) {
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = ws.getCell(r, c);
        cell.border = {
          top:    { style: "thin", color: { argb: "FF000000" } },
          left:   { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right:  { style: "thin", color: { argb: "FF000000" } }
        };
      }
    }
  }

  function applyThickOutside(ws, startRow, startCol, endRow, endCol) {
    // Borde superior
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getCell(startRow, c);
      cell.border = {
        ...cell.border,
        top: { style: "medium", color: { argb: "FF000000" } }
      };
    }
    // Borde inferior
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getCell(endRow, c);
      cell.border = {
        ...cell.border,
        bottom: { style: "medium", color: { argb: "FF000000" } }
      };
    }
    // Borde izquierdo
    for (let r = startRow; r <= endRow; r++) {
      const cell = ws.getCell(r, startCol);
      cell.border = {
        ...cell.border,
        left: { style: "medium", color: { argb: "FF000000" } }
      };
    }
    // Borde derecho
    for (let r = startRow; r <= endRow; r++) {
      const cell = ws.getCell(r, endCol);
      cell.border = {
        ...cell.border,
        right: { style: "medium", color: { argb: "FF000000" } }
      };
    }
  }

  // Bordes en la sección A1:B4 (filas 1 a 4, columnas 1 a 2)
  applyAllThinBorders(worksheet, 1, 1, 4, 2);
  applyThickOutside(worksheet, 1, 1, 4, 2);

  // Bordes en la sección E1:F3 (filas 1 a 3, columnas 5 a 6)
  applyAllThinBorders(worksheet, 1, 5, 3, 6);
  applyThickOutside(worksheet, 1, 5, 3, 6);

  // 6c) Aplicar bordes para cada bloque de ejercicios (cada bloque = 3 filas con datos + 1 fila vacía)
  // Los datos de entrenamiento comienzan en la fila 8 (sheet row 8)
  for (let i = 0; i < datosEntrenamiento.length; i += 4) {
    const blockTop = 8 + i;          // Fila "Ejercicio"
    const blockBottom = blockTop + 2;  // Fila "Peso"
    let maxCols = 1;
    for (let r = i; r < i + 3 && r < datosEntrenamiento.length; r++) {
      if (datosEntrenamiento[r].length > maxCols) {
        maxCols = datosEntrenamiento[r].length;
      }
    }
    applyAllThinBorders(worksheet, blockTop, 1, blockBottom, maxCols);
    applyThickOutside(worksheet, blockTop, 1, blockBottom, maxCols);
    // La fila i+3 queda sin bordes, actuando como separación
  }

  // 7) ASIGNAR ANCHO FIJO A TODAS LAS COLUMNAS (12.3)
  worksheet.columns.forEach((column) => {
    column.width = 12.3;
  });

  // 8) DESCARGAR EL ARCHIVO
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "DatosEntrenamiento.xlsx");
}



/*****************************************************************************
 *  MOSTRAR BOTÓN EXPORTAR AL PRESIONAR "TERMINAR" Y ASIGNAR EVENTO
 *****************************************************************************/
// Dentro de tu función donde manejas el evento del botón "Terminar":
// (asegúrate de que esté en la misma parte donde se define btnTerminar)

btnTerminar.addEventListener("click", () => {
  horaFin.value = formatearFecha(new Date());

  // Mostrar botón "Exportar Datos"
  const exportarContainer = document.getElementById("exportar-datos");
  exportarContainer.classList.remove("oculto");

  // Asignar el evento para exportar
  const btnExportar = document.getElementById("btnExportar");
  btnExportar.addEventListener("click", exportarDatosExcelJS);
});
