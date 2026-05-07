import { ref, onMounted, computed } from 'vue'
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

  const showRegionsMenu = ref(false)

  function setRegion(region) {
    selectedRegion.value = region
    showRegionsMenu.value = false
  }

  function clearRegion() {
    selectedRegion.value = null
    showRegionsMenu.value = false
  }

  async function fetchRows() {
    try {
      const res = await api.get('/order-detail-views')
      rows.value = res.data
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
    filteredRows,
    regions,
    selectedRegion,
    setRegion(r) {
      selectedRegion.value = r
    },
    clearRegion() {
      selectedRegion.value = null
    },
    getInitials,
    onPaginationChange,
  }
}
