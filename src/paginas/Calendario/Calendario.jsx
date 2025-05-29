import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import es from "date-fns/locale/es";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendario.css";
import Header from "../../componentes/Header/Header";

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Calendario() {
  const [events, setEvents] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carga usuario de localStorage
  useEffect(() => {
    const usuarioLS = localStorage.getItem("user");
    if (usuarioLS) {
      setUsuario(JSON.parse(usuarioLS));
    }
  }, []);

  // Conexión socket y carga chats
  useEffect(() => {
    if (!usuario) return;

    const socketInstance = io("http://localhost:4000");
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      socketInstance.emit("get_user_chats", usuario.id);
    });

    socketInstance.on("user_chats", (data) => {
      setChats(data);
    });

    socketInstance.on("chat_error", (errorMessage) => {
      Swal.fire("Error", errorMessage, "error");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [usuario]);

  // Obtener nombres de usuarios relacionados a los chats
  useEffect(() => {
    if (chats.length === 0) return;

    chats.forEach((chat) => {
      const otroUsuarioId = chat.user1_id === usuario.id ? chat.user2_id : chat.user1_id;
      if (otroUsuarioId && !usuarios[otroUsuarioId]) {
        fetch(`http://localhost:4000/api/users/${otroUsuarioId}`)
          .then((res) => res.json())
          .then((data) => {
            setUsuarios((prev) => ({ ...prev, [otroUsuarioId]: data.name }));
          })
          .catch(() => {
            setUsuarios((prev) => ({ ...prev, [otroUsuarioId]: "Nombre no disponible" }));
          });
      }
    });
  }, [chats, usuarios, usuario]);

  const estudiantes = chats.map((chat) => {
    const id = chat.user1_id === usuario?.id ? chat.user2_id : chat.user1_id;
    return { id, name: usuarios[id] || "Cargando..." };
  });

  // Cargar eventos desde backend al iniciar o cambiar usuario
  useEffect(() => {
    if (!usuario) return;

    setLoading(true);
    fetch("http://localhost:4000/api/calendar", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar eventos');
        return res.json();
      })
      .then((data) => {
        const userId = usuario.id;
        const eventosFormateados = data
          .filter(evento => evento.participants.some(p => p.id === userId))
          .map((e) => ({
            id: e.id,
            start: new Date(e.start_time),
            end: new Date(e.end_time),
            title: e.title,
            desc: e.comment,
            status: e.status,
            participants: e.participants,
            idLlamada: e.idLlamada,
            calendarTitle: `${e.title} (${e.participants.filter(p => p.id !== userId).map(p => p.name).join(', ')})`
          }));
        setEvents(eventosFormateados);
        setError(null);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError("No se pudieron cargar los eventos");
        Swal.fire("Error", "No se pudieron cargar los eventos", "error");
      })
      .finally(() => setLoading(false));
  }, [usuario]);

  // Manejador para mostrar detalles del evento
  const handleEventClick = (event) => {
    Swal.fire({
      title: event.title,
      html: `
        <div style="text-align: left;">
          <p><strong>Inicio:</strong> ${event.start.toLocaleString()}</p>
          <p><strong>Fin:</strong> ${event.end.toLocaleString()}</p>
          ${event.desc ? `<p><strong>Descripción:</strong> ${event.desc}</p>` : ''}
          <p><strong>Participantes:</strong> ${event.participants?.map(p => p.name).join(', ') || 'Ninguno'}</p>
          <p><strong>Estado:</strong> ${event.status || 'No especificado'}</p>

          <div style="margin-top: 20px; text-align: right;">
            <button id="call-button" class="swal2-confirm swal2-styled" style="background-color:#28a745; margin-left: 10px;">
              Hacer llamada
            </button>
          </div>
        </div>
      `,

            didOpen: () => {
        const callButton = Swal.getPopup().querySelector("#call-button");
        if (callButton) {
          callButton.addEventListener("click", () => {
            iniciarLlamada(event.idLlamada);
            Swal.close();
          });
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Editar',
      cancelButtonText: 'Eliminar',
      showDenyButton: true,
      denyButtonText: 'Cerrar',
      confirmButtonColor: '#72a0c1',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        handleEditEvent(event);
      } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
        handleDeleteEvent(event.id);
      }
    });
  };

  const iniciarLlamada = (event) => {
    console.log(event);
  const popupWidth = 1200;
  const popupHeight = 800;
  const left = window.screenX + (window.innerWidth - popupWidth) / 2;
  const top = window.screenY + (window.innerHeight - popupHeight) / 2;

  window.open(
    `http://localhost:4000/call/${event}`, 
    'popup_llamada',
    `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
};
  const cargarEventos = () => {
  if (!usuario) return;

  setLoading(true);
  fetch("http://localhost:4000/api/calendar", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error('Error al cargar eventos');
      return res.json();
    })
    .then((data) => {
      const userId = usuario.id;
      const eventosFormateados = data
        .filter(evento => evento.participants.some(p => p.id === userId))
        .map((e) => ({
          id: e.id,
          start: new Date(e.start_time),
          end: new Date(e.end_time),
          title: e.title,
          desc: e.comment,
          status: e.status,
          participants: e.participants,
          calendarTitle: `${e.title} (${e.participants.filter(p => p.id !== userId).map(p => p.name).join(', ')})`
        }));
      setEvents(eventosFormateados);
      setError(null);
    })
    .catch((err) => {
      console.error("Error:", err);
      setError("No se pudieron cargar los eventos");
      Swal.fire("Error", "No se pudieron cargar los eventos", "error");
    })
    .finally(() => setLoading(false));
};

  // Manejador para editar evento
  const handleEditEvent = async (event) => {
    const { value: formValues } = await Swal.fire({
      title: `Editar Evento`,
      html:
        `<label>Título:</label><br/>` +
        `<input id="titulo" class="swal2-input" value="${event.title || ''}"><br/>` +
        `<label>Comentario:</label><br/>` +
        `<textarea id="comentario" class="swal2-textarea">${event.desc || ''}</textarea><br/>` +
        `<label>Fecha:</label><br/>` +
        `<input type="date" id="fecha" class="swal2-input" value="${event.start.toISOString().split('T')[0]}"><br/>` +
        `<label>Hora inicio:</label><br/>` +
        `<input type="time" id="horaInicio" class="swal2-input" value="${event.start.toTimeString().substring(0, 5)}"><br/>` +
        `<label>Hora fin:</label><br/>` +
        `<input type="time" id="horaFin" class="swal2-input" value="${event.end.toTimeString().substring(0, 5)}">`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          titulo: document.getElementById('titulo').value.trim(),
          comentario: document.getElementById('comentario').value.trim(),
          fecha: document.getElementById('fecha').value,
          horaInicio: document.getElementById('horaInicio').value,
          horaFin: document.getElementById('horaFin').value
        };
      }
    });

    if (formValues) {
      const { titulo, comentario, fecha, horaInicio, horaFin } = formValues;

      if (!titulo || !fecha || !horaInicio || !horaFin) {
        return Swal.fire('Error', 'Completa todos los campos obligatorios', 'error');
      }

      if (horaInicio >= horaFin) {
        return Swal.fire('Error', 'La hora de inicio debe ser antes que la hora de fin', 'error');
      }

      const fechaInicio = new Date(`${fecha}T${horaInicio}`);
      const fechaFin = new Date(`${fecha}T${horaFin}`);

      try {
        const response = await fetch(`http://localhost:4000/api/calendar/${event.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            title: titulo,
            comment: comentario,
            start_time: fechaInicio.toISOString(),
            end_time: fechaFin.toISOString(),
          }),
        });

        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error("Error al parsear JSON:", e);
        }

        if (!response.ok) {
          return Swal.fire('Error', data.error || 'Error al actualizar el evento', 'error');
        }

        Swal.fire('¡Actualizado!', 'El evento ha sido modificado', 'success');
        cargarEventos();

        
        setEvents(prev => prev.map(ev => 
          ev.id === event.id ? { 
            ...ev, 
            title: titulo,
            desc: comentario,
            start: fechaInicio,
            end: fechaFin,
            calendarTitle: `${titulo} (${event.participants.filter(p => p.id !== usuario.id).map(p => p.name).join(', ')})`
          } : ev
        ));
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Manejador para eliminar evento
  const handleDeleteEvent = async (eventId) => {
    const result = await Swal.fire({
      title: '¿Eliminar evento?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:4000/api/calendar/${eventId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el evento');
        }

        Swal.fire('¡Eliminado!', 'El evento ha sido eliminado', 'success');
        cargarEventos();

        
        setEvents(prev => prev.filter(ev => ev.id !== eventId));
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo eliminar el evento', 'error');

      }
    }
  };

  // Crear evento al seleccionar rango en el calendario
  const handleSelectSlot = async (slotInfo) => {
    const fecha = slotInfo.start;

    const { value: formValues } = await Swal.fire({
      title: `Nuevo Evento – ${fecha.toLocaleDateString()}`,
      html:
        `<label>Estudiante:</label><br/>` +
        `<select id="estudiante" class="swal2-select" style="width:100%">` +
        estudiantes.map((e) => `<option value="${e.id}">${e.name}</option>`).join("") +
        `</select><br/><br/>` +
        `<label>Título:</label><br/>` +
        `<input id="titulo" class="swal2-input" placeholder="Título del evento"><br/>` +
        `<label>Comentario:</label><br/>` +
        `<textarea id="comentario" class="swal2-textarea" placeholder="Información extra"></textarea><br/>` +
        `<label>Hora inicio:</label><br/>` +
        `<input type="time" id="horaInicio" class="swal2-input" value="09:00"><br/>` +
        `<label>Hora fin:</label><br/>` +
        `<input type="time" id="horaFin" class="swal2-input" value="10:00">`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => ({
        estudianteId: document.getElementById("estudiante").value,
        titulo: document.getElementById("titulo").value.trim(),
        comentario: document.getElementById("comentario").value.trim(),
        horaInicio: document.getElementById("horaInicio").value,
        horaFin: document.getElementById("horaFin").value,
      }),
    });

    if (formValues) {
      const { estudianteId, titulo, comentario, horaInicio, horaFin } = formValues;

      if (!estudianteId || !titulo || !horaInicio || !horaFin) {
        return Swal.fire("Error", "Completa todos los campos obligatorios", "error");
      }

      if (horaInicio >= horaFin) {
        return Swal.fire("Error", "La hora de inicio debe ser antes que la hora de fin", "error");
      }

      const fechaInicio = new Date(fecha);
      const [hInicio, mInicio] = horaInicio.split(":");
      fechaInicio.setHours(parseInt(hInicio), parseInt(mInicio), 0, 0);

      const fechaFin = new Date(fecha);
      const [hFin, mFin] = horaFin.split(":");
      fechaFin.setHours(parseInt(hFin), parseInt(mFin), 0, 0);

      try {
        const response = await fetch("http://localhost:4000/api/calendar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: titulo,
            comment: comentario,
            start_time: fechaInicio.toISOString(),
            end_time: fechaFin.toISOString(),
            participants: [
              { user_id: usuario.id, role: "teacher" },
              { user_id: parseInt(estudianteId), role: "student" },
            ],
            repeatWeekly: false,
          }),
        });

        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error("Error al parsear JSON:", e);
        }

        console.log("Response status:", response.status);
        console.log("Response OK:", response.ok);
        console.log("Datos recibidos:", data);

        if (!response.ok) {
          return Swal.fire("Error", data.error || "Error al crear el evento", "error");
        }

        Swal.fire("¡Creado!", "El evento ha sido creado con éxito", "success");
        cargarEventos();


        const evento = data.events[0];

        const otrosParticipantes = evento.participants
          .filter(p => p.id !== usuario.id)
          .map(p => p.name)
          .join(', ');

        setEvents((prev) => [...prev, {
          id: evento.id,
          start: new Date(evento.start_time),
          end: new Date(evento.end_time),
          title: evento.title,
          desc: evento.comment,
          status: evento.status,
          participants: evento.participants,
          calendarTitle: `${evento.title} (${otrosParticipantes})`
        }]);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="calendario-container">
      <Header />
      <div className="calendario-body">
        {loading && <div className="loading-message">Cargando eventos...</div>}
        {error && <div className="error-message">{error}</div>}
        
        <Calendar
          localizer={localizer}
          events={events.map(e => ({
            ...e,
            title: e.calendarTitle || e.title
          }))}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleEventClick}
          culture="es"
          messages={{
            today: 'Hoy',
            previous: 'Anterior',
            next: 'Siguiente',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'No hay eventos en este rango.'
          }}
        />
      </div>
    </div>
  );
}

export default Calendario;