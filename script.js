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
    const repeticiones = fila.slice(2,2+NUM_COLUMNS);

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
  document.getElementById("btnExportar").addEventListener("click", exportarDatos);
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

function exportarDatos() {
  // Recuperar valores de hora de inicio y de finalización
  const horaInicioInput = document.getElementById("horaInicio").value;
  const horaFinInput = document.getElementById("horaFin").value;
  
  if (!horaInicioInput || !horaFinInput) {
    alert("Por favor, asegúrate de haber registrado la hora de inicio y de finalización.");
    return;
  }
  
  // Se asume formato "dd/mm/yyyy hh:mm"
  const [fechaInicio, tiempoInicio] = horaInicioInput.split(" ");
  const [fechaFin, tiempoFin] = horaFinInput.split(" ");
  
  // Separar día, mes, año y horas/minutos
  const [dia, mes, anio] = fechaInicio.split("/");
  const [horaIni, minIni] = tiempoInicio.split(":");
  const [diaF, mesF, anioF] = fechaFin.split("/");
  const [horaFin, minFin] = tiempoFin.split(":");
  
  // Convertir a objetos Date (recordando que en JS el mes es 0-indexado)
  const inicioDate = new Date(anio, mes - 1, dia, horaIni, minIni);
  const finDate = new Date(anioF, mesF - 1, diaF, horaFin, minFin);
  
  // Calcular la diferencia en milisegundos y convertir a horas y minutos
  const diffMs = finDate - inicioDate;
  if (diffMs < 0) {
    alert("La hora de finalización es anterior a la de inicio.");
    return;
  }
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const duracionStr = `${diffHoras} horas y ${diffMinutos} minutos`;
  
  // Extraer datos de clima de los elementos (se asume que tienen textos como "Temperatura: xx °C")
  const tempText = document.getElementById("temp").textContent;
  const humedadText = document.getElementById("humedad").textContent;
  const presionText = document.getElementById("presion").textContent;
  
  // Usamos expresiones regulares para obtener los valores numéricos
  const tempMatch = tempText.match(/([-]?\d+(\.\d+)?)/);
  const humedadMatch = humedadText.match(/(\d+(\.\d+)?)/);
  const presionMatch = presionText.match(/(\d+(\.\d+)?)/);
  
  const temperatura = tempMatch ? tempMatch[0] : "";
  const humedad = humedadMatch ? humedadMatch[0] : "";
  const presion = presionMatch ? presionMatch[0] : "";
  
  // Crear un nuevo libro de Excel y definir una hoja de resumen
  const wb = XLSX.utils.book_new();
  const ws = {};
  
  // Ubicar los datos en las celdas especificadas:
  // B1: día de hoy (tomado de la parte de fecha de horaInicio)
  ws["B1"] = { v: fechaInicio };
  // B2: hora de inicio (solo la parte de la hora)
  ws["B2"] = { v: tiempoInicio };
  // B3: hora de finalización (solo la hora)
  ws["B3"] = { v: tiempoFin };
  // B4: duración del entrenamiento
  ws["B4"] = { v: duracionStr };
  
  // E2: temperatura, E3: humedad, E4: presión
  ws["E2"] = { v: temperatura };
  ws["E3"] = { v: humedad };
  ws["E4"] = { v: presion };
  
  // Definir el rango de la hoja (se amplía para incluir las celdas que usamos)
  ws["!ref"] = "A1:F10";
  
  // Agregar la hoja al libro y generar el archivo Excel
  XLSX.utils.book_append_sheet(wb, ws, "Resumen");
  XLSX.writeFile(wb, "DatosEntrenamiento.xlsx");
}

document.getElementById("btnExportar").addEventListener("click", exportarDatos);
