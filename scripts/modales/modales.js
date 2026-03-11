function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

function editarMateria(id, nombre, codigo, descripcion, nivel, activo) {
    const form = document.getElementById('formEditarMateria');

    form.action = '/admin/materias/editar/' + id;

    document.getElementById('editNombre').value = nombre;
    document.getElementById('editCodigo').value = codigo;
    document.getElementById('editDescripcion').value = descripcion;
    document.getElementById('editNivel').value = nivel;
    document.getElementById('editActivo').checked = activo;

    abrirModal('modalEditarMateria');
}

function confirmarEliminar(mensaje, url) {
    if (confirm(mensaje)) {
        window.location.href = url;
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal-fondo')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}