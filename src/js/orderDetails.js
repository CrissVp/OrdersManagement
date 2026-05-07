import { ref, onMounted, watch } from 'vue'
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
  const allRows = ref([])

  const pagination = ref({
    page: 1,
    rowsPerPage: 5,
  })

  const isMonthFilterActive = ref(false)
  const selectedRegions = ref([])
  const regionOptions = ref([])
  const isRegionFilterActive = ref(false)

  function isCurrentMonth(dateString) {
    const date = new Date(dateString)
    const now = new Date()

    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }

  function applyFilters() {
    const source = allRows.value

    const filtered = source.filter((row) => {
      if (isMonthFilterActive.value && !isCurrentMonth(row.orderDate)) {
        return false
      }

      if (selectedRegions.value.length > 0 && !selectedRegions.value.includes(row.region)) {
        return false
      }

      return true
    })

    rows.value = filtered
    pagination.value.page = 1
  }

  function toggleCurrentMonthFilter() {
    isMonthFilterActive.value = !isMonthFilterActive.value
    applyFilters()
  }

  watch(
    selectedRegions,
    () => {
      applyFilters()
    },
    { deep: true },
  )

  // ID GENERATOR
  function generateRowId(index, row) {
    return (
      row.orderID ??
      row.orderId ??
      row._id ??
      row.id ??
      `${row.customerName ?? 'order'}-${row.orderDate ?? ''}-${index}`
    )
  }

  async function fetchRows() {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/order-detail-views'),
        api.get('/products').catch(() => ({ data: [] })),
      ])

      const productsList = productsRes.data || []

      const productMap = new Map(
        productsList.map((p) => [p.productID ?? p.id ?? p.productId, p.productName ?? p.name]),
      )

      const formattedRows = (ordersRes.data || []).map((r, index) => {
        const rawProducts = Array.isArray(r.products) ? r.products : []

        const displayProducts = rawProducts.map((p) => {
          if (typeof p === 'string' || typeof p === 'number') {
            return productMap.get(p) || String(p)
          }
          return p.productName || p.name || ''
        })

        const generatedId = generateRowId(index, r)

        return {
          ...r,

          // Stable unique key
          _id: generatedId,

          // preserve backend-provided order id explicitly for links
          orderID: r.orderID ?? r.orderId ?? r._id ?? r.id ?? generatedId,

          products: displayProducts,
          totalAmount: r.totalAmount || 0,
          status: r.status || 'Unknown',
          region: r.region || 'Unknown',
        }
      })

      allRows.value = formattedRows
      rows.value = formattedRows

      regionOptions.value = [...new Set(formattedRows.map((r) => r.region).filter(Boolean))]
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

  onMounted(fetchRows)

  return {
    columns,
    rows,
    getInitials,

    pagination,

    isMonthFilterActive,
    toggleCurrentMonthFilter,

    selectedRegions,
    regionOptions,
    isRegionFilterActive,
  }
}
