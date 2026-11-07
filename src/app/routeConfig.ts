export const pageRoutes = [
  { path: '/menu', title: 'Bembos | Menú' },
  { path: '/productos/:productId/personalizar', title: 'Bembos | Personaliza tu pedido' },
  { path: '/pedido', title: 'Bembos | Tu pedido' },
  { path: '/pedido/:itemId/editar', title: 'Bembos | Editar producto' },
  { path: '/pagar', title: 'Bembos | Entrega y resumen del pedido' },
  { path: '/confirmacion/:pedidoId', title: 'Bembos | Confirmación del pedido' },
] as const
