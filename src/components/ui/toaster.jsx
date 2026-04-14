import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import React from 'react';


// Componente encargado de renderizar todos los toasts activos.
// Se monta una sola vez en la aplicación (ej: App o RootLayout).
// Conecta el estado global de los toasts con los componentes visuales.
export function Toaster() {
	// Obtiene la lista de toasts activos desde el store global
	const { toasts } = useToast();

	return (
		// Proveedor de contexto necesario para el funcionamiento de Radix Toast
		<ToastProvider>
			{toasts.map(({ id, title, description, action, ...props }) => {
				return (
					<Toast key={id} {...props}>
						<div className="grid gap-1">
							{title && <ToastTitle>{title}</ToastTitle>}
							{description && (
								<ToastDescription>{description}</ToastDescription>
							)}
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}