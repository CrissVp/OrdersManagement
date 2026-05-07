import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'

export default function useOrderDetails() {
  const columns = ref([
    { name: 'customer', label: 'CUSTOMER', field: 'customerName', align: 'left' },
    { name: 'orderDate', label: 'ORDER DATE', field: 'orderDate', align: 'left' },
    { name: 'products', label: 'PRODUCTS', field: 'products', align: 'left' },
    { name: 'region', label: 'REGION', field: 'region', align: 'left' },
    { name: 'status', label: 'STATUS', field: 'status', align: 'left' },
    { name: 'total', label: 'TOTALS', field: 'totalAmount', align: 'right' },
    { name: 'action', label: '', field: 'action', align: 'right' },
  ])

  const rows = ref([])

  async function fetchRows() {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/order-detail-views'),
        api.get('/products').catch(() => ({ data: [] })),
      ])

      const productsList = productsRes.data || []
      const productMap = new Map(
        (productsList || []).map((p) => [
          p.productID ?? p.id ?? p.productId,
          p.productName ?? p.name,
        ]),
      )

      rows.value = (ordersRes.data || []).map((r) => {
        const row = { ...r }

        const rawProducts = Array.isArray(r.products) ? r.products : []

        // compute total if not provided
        let total = row.totalAmount || 0
        if (!row.totalAmount) {
          if (rawProducts.length && typeof rawProducts[0] === 'object') {
            total = rawProducts.reduce(
              (s, it) => s + (it.qty || it.quantity || 0) * (it.price || it.unitPrice || 0),
              0,
            )
          } else {
            total = 0
          }
        }

        // build display products array (strings)
        const displayProducts = rawProducts.map((p) => {
          if (p == null) return ''
          if (typeof p === 'string' || typeof p === 'number') {
            return productMap.get(p) || String(p)
          }
          // object
          return p.productName || p.name || productMap.get(p.productID || p.productId) || ''
        })

        row.products = displayProducts
        row.totalAmount = total
        row.status = row.status || 'Unknown'
        row.region = row.region || 'Unknown'

        return row
      })
    } catch (err) {
      console.error('Failed to load order details', err)
    }
  }

  function getInitials(name) {
    if (!name) return ''
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  function onPaginationChange(props) {
    return props.pagination
  }

  onMounted(() => {
    fetchRows()
  })

  return {
    columns,
    rows,
    getInitials,
    onPaginationChange,
  }
}
