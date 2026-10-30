import Swal from 'sweetalert2';

// Configuración global para SweetAlert2
Swal.mixin({
  customClass: {
    confirmButton: 'swal-confirm-button',
    cancelButton: 'swal-cancel-button'
  },
  buttonsStyling: false,
  showClass: {
    popup: 'swal2-show',
    backdrop: 'swal2-backdrop-show',
    icon: 'swal2-icon-show'
  },
  hideClass: {
    popup: 'swal2-hide',
    backdrop: 'swal2-backdrop-hide',
    icon: 'swal2-icon-hide'
  }
});

export default Swal;
