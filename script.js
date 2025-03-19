// Variables globales para almacenar los datos del Excel
let dataDia1 = [];
let dataDia2 = [];
let dataDias = {};
const NUM_COLUMNS = 5;
let libroExcelOriginal; // libro Excel original

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
// 2. Evento de carga del archivo (reemplazar SOLO esta parte):
inputExcel.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  libroExcelOriginal = new ExcelJS.Workbook();
  await libroExcelOriginal.xlsx.load(arrayBuffer);

  // Reiniciamos dataDias
  dataDias = {};

  // Recorrer todas las hojas y guardar las que empiecen con "Dia"
  libroExcelOriginal.worksheets.forEach((ws) => {
    if (ws.name.startsWith("Dia")) {
      // Se omiten las primeras 3 filas (índice 0,1,2) tal como en el código original
      dataDias[ws.name] = ws.getSheetValues().slice(3);
    }
  });

  if (Object.keys(dataDias).length === 0) {
    alert("No se encontraron hojas con nombre 'Dia' en el archivo Excel.");
    return;
  }

  // Limpiar y poblar el select de días
  selectDia.innerHTML = '<option value="">Seleccione un día</option>';
  // Ordenamos los nombres de las hojas según el número que contengan
  const sortedSheetNames = Object.keys(dataDias).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });
  sortedSheetNames.forEach((sheetName) => {
    const option = document.createElement("option");
    option.value = sheetName;
    option.textContent = sheetName;
    selectDia.appendChild(option);
  });

  alert("Archivo Excel cargado correctamente con ExcelJS.");
  seleccionDiaDiv.classList.remove("oculto");
});

// ----------------------------------------------------------------------------------
// 2. SELECCIÓN DEL DÍA
// ----------------------------------------------------------------------------------

const selectDia = document.getElementById("selectDia");

selectDia.addEventListener("change", () => {
  const sheetName = selectDia.value;
  if (sheetName) {
    mostrarRutina(sheetName);
  }
});

function mostrarRutina(sheetName) {
  const dataDia = dataDias[sheetName];
  if (!dataDia || dataDia.length === 0) {
    alert(`No hay datos para la hoja ${sheetName}. Verifica que exista en el Excel.`);
    return;
  }

  // Ocultar secciones de carga y selección
  document.getElementById("subir-archivo").classList.add("oculto");
  document.getElementById("seleccion-dia").classList.add("oculto");

  // Mostrar la sección "¿Eres mujer?" y el contenedor de la rutina
  preguntaMujerDiv.classList.remove("oculto");
  rutinaContainer.classList.remove("oculto");

  // Limpiar el contenido previo de la tabla
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
    const nombreEjercicio = fila[2] || "Sin nombre";
    const repeticiones = fila.slice(4, 4 + NUM_COLUMNS);

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

    // repeticiones es un array con 5 elementos (por ej. 4 con números y 1 vacío)
    repeticiones.forEach((rep) => {
      const tdInput = document.createElement("td");

      // SOLO si rep no está vacío, insertamos el <input>
      if (rep !== "") {
        const inputP = document.createElement("input");
        inputP.type = "number";
        inputP.placeholder = "kg";
        tdInput.appendChild(inputP);
      }

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
    document.getElementById("exportar-datos").classList.remove("oculto");
  });

  document.getElementById("btnExportar").onclick = exportarDatosExcelJS;

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
  if (!libroExcelOriginal) {
    alert("Primero carga un archivo Excel.");
    return;
  }

  // 1) OBTENER DATOS DE HORA
  const horaInicioInput = document.getElementById("horaInicio").value;
  const horaFinInput = document.getElementById("horaFin").value;
  if (!horaInicioInput || !horaFinInput) {
    alert("Falta la hora de inicio o la hora de finalización.");
    return;
  }

  const [fechaInicio, horaInicioPart] = horaInicioInput.split(" ");
  const [fechaFin, horaFinPart] = horaFinInput.split(" ");

  const partesInicio = horaInicioPart.split(":");
  if (partesInicio.length === 2) partesInicio.push("00");
  const [hI, mI, sI] = partesInicio;

  const partesFin = horaFinPart.split(":");
  if (partesFin.length === 2) partesFin.push("00");
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

  // 2) DATOS DEL CLIMA
  const temperatura = document.getElementById("temp").textContent.match(/([-]?\d+(\.\d+)?)/)?.[0] || "";
  const humedad = document.getElementById("humedad").textContent.match(/(\d+(\.\d+)?)/)?.[0] || "";
  const presion = document.getElementById("presion").textContent.match(/(\d+(\.\d+)?)/)?.[0] || "";

  // 3) FASE CICLO
  const cicloSeleccionado = document.getElementById("faseCiclo").value || "";

  // 4) EXTRAER DATOS TABLA
  const filasTabla = document.querySelectorAll("#tablaRutina tr");
  const datosEntrenamiento = [];
  for (let i = 1; i < filasTabla.length - 1; i++) {
    const celdas = filasTabla[i].querySelectorAll("td");
    const fila = Array.from(celdas).map(celda => {
      const input = celda.querySelector("input");
      return input ? input.value : celda.textContent.trim();
    });
    datosEntrenamiento.push(fila);
  }

  // 5) MATRIZ PARA EXCEL
  const sheetData = [
    ["Día:", fechaInicio, null, null, "Temperatura:", temperatura],
    ["Hora Inicio:", horaInicioPart, null, null, "Humedad:", humedad],
    ["Hora Final:", horaFinPart, null, null, "Presión:", presion],
    ["Tiempo Total:", timeFraction, null, null, "Ciclo:", cicloSeleccionado],
    [],
    ["Entrenamiento:"],
    []
  ];

  sheetData.push(...datosEntrenamiento);

  // 6) USAR DIRECTAMENTE EL LIBRO ORIGINAL (sin pasar por XLSX)
  const workbook = libroExcelOriginal;

  const nombreHoja = `${fechaInicio.replace(/\//g, "-")}`;
  const worksheet = workbook.addWorksheet(nombreHoja);

  // Insertar los datos en la hoja
  sheetData.forEach((rowData, idx) => {
    const row = worksheet.getRow(idx + 1);
    rowData.forEach((value, colIndex) => {
      row.getCell(colIndex + 1).value = value;
    });
  });

// 7) FORMATO CLARO Y COMPLETO (aplicar explícitamente)

// Combinar celda A6:F6 para "Entrenamiento:"
worksheet.mergeCells("A6:F6");
worksheet.getCell("A6").alignment = { horizontal: "center", vertical: "middle" };
worksheet.getCell("A6").font = { bold: true, size: 14 };

// Formato de hora hh:mm:ss para Tiempo total (B4)
worksheet.getCell("B4").numFmt = "hh:mm:ss";

// Bordes finos generales
worksheet.eachRow({ includeEmpty: false }, (row) => {
  row.eachCell({ includeEmpty: false }, (cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
});

// Aplicar bordes gruesos específicamente en los rangos A1:B4 y E1:F4
function aplicarBordeGrueso(hoja, inicioFila, inicioCol, finFila, finCol) {
  for (let rowNum = inicioFila; rowNum <= finFila; rowNum++) {
    const row = hoja.getRow(rowNum);
    for (let colNum = inicioCol; colNum <= finCol; colNum++) {
      const cell = row.getCell(colNum);
      cell.border = {
        top: { style: rowNum === inicioFila ? 'medium' : 'thin' },
        left: { style: colNum === inicioCol ? 'medium' : 'thin' },
        bottom: { style: rowNum === finFila ? 'medium' : 'thin' },
        right: { style: colNum === finCol ? 'medium' : 'thin' },
      };
    }
  }
}

aplicarBordeGrueso(worksheet, 1, 1, 4, 2);  // A1:B4
aplicarBordeGrueso(worksheet, 1, 5, 4, 6);  // E1:F4

// Establecer ancho fijo para columnas
worksheet.columns.forEach(column => column.width = 15);

// Opcional: Formato específico para títulos o encabezados
["A1", "A2", "A3", "A4", "E1", "E2", "E3", "E4"].forEach(cellRef => {
  worksheet.getCell(cellRef).font = { bold: true };
});

  // 8) DESCARGAR EXCEL
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "Parametros.xlsx");
}

// Evento para mostrar el botón Exportar al presionar "Terminar"
btnTerminar.addEventListener("click", () => {
  horaFin.value = formatearFecha(new Date());
  const exportarContainer = document.getElementById("exportar-datos");
  exportarContainer.classList.remove("oculto");

  const btnExportar = document.getElementById("btnExportar");
  btnExportar.onclick = null;  // elimina cualquier evento previo
  btnExportar.onclick = exportarDatosExcelJS;  // asigna correctamente el evento
});

