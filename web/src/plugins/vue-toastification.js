import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const ToastOptions = {
  position: 'bottom-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.7,
}

export default function (app) {
  app.use(Toast, ToastOptions)
}
