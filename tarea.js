const listaTareas = document.getElementById("listaTareas");
  const alarma = document.getElementById("alarma");
  const errorHora = document.getElementById("errorHora");
  const tareasGuardadas = localStorage.getItem("tareas");
  let tareas = tareasGuardadas ? JSON.parse(tareasGuardadas) : [];

  function mostrarFecha() {
    const hoy = new Date();
    const opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    document.getElementById("fecha").textContent = hoy.toLocaleDateString("es-MX", opciones);
    document.getElementById("fechaCreacion").textContent = hoy.toLocaleString();
  }

  function formato12Horas(hora24) {
    const [hora, minutos] = hora24.split(':');
    let h = parseInt(hora, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutos} ${ampm}`;
  }

  function agregarTarea() {
    errorHora.textContent = "";
    const texto = document.getElementById("nuevaTarea").value.trim();
    const hora = document.getElementById("horaTarea").value;
    if (!texto) {
      alert("⚠️ Escribe una tarea.");
      return;
    }
    if (!hora) {
      errorHora.textContent = "⚠️ Ingresa la hora (formato 24 hrs).";
      return;
    }

    tareas.push({ texto, hora, hecha: false, notificada: false });
    document.getElementById("nuevaTarea").value = "";
    document.getElementById("horaTarea").value = "";
    guardarYMostrar();
  }

  function guardarYMostrar() {
    localStorage.setItem("tareas", JSON.stringify(tareas));
    mostrarTareas();
  }

  function mostrarTareas(filtro = 'todas') {
    listaTareas.innerHTML = "";
    tareas.forEach((tarea, i) => {
      if (filtro === 'hechas' && !tarea.hecha) return;
      if (filtro === 'pendientes' && tarea.hecha) return;

      const div = document.createElement("div");
      div.className = "tarea" + (tarea.hecha ? " hecha" : "");
      div.innerHTML = `
        <span>${tarea.texto} - ${formato12Horas(tarea.hora)}</span>
        <div>
          <button onclick="marcarHecha(${i})">✔️</button>
          <button onclick="eliminarTarea(${i})">❌</button>
        </div>
      `;
      listaTareas.appendChild(div);
    });
  }

  function marcarHecha(i) {
    tareas[i].hecha = !tareas[i].hecha;
    guardarYMostrar();
  }

  function eliminarTarea(i) {
    tareas.splice(i, 1);
    guardarYMostrar();
  }

  function filtrarTareas(tipo) {
    mostrarTareas(tipo);
  }

  // 🚨 Verificación cada minuto para alarmas
  setInterval(() => {
    const ahora = new Date();
    const horaActual = ahora.toTimeString().slice(0,5);

    tareas.forEach((t, i) => {
      if (!t.hecha && !t.notificada && t.hora === horaActual) {
        alarma.play();
        mostrarNotificacion(t.texto);
        tareas[i].hecha = true;
        tareas[i].notificada = true;
        guardarYMostrar();
      }
    });
  }, 60000);

  function mostrarNotificacion(mensaje) {
    if (Notification.permission === "granted") {
      new Notification("📌 Recordatorio de tarea", {
        body: mensaje,
        icon: "./img/alarma.png"
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permiso) => {
        if (permiso === "granted") {
          mostrarNotificacion(mensaje);
        }
      });
    }
  }

  // 🚀 Inicial
  mostrarFecha();
  mostrarTareas();
  if ("Notification" in window) {
    Notification.requestPermission();
  }