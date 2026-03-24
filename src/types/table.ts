export interface TableAction {
  key: string
  label: string
  type?: 'primary' | 'danger' | 'info' | 'warning' | 'success'
}

export interface TableColumn {
  prop?: string
  label: string
  width?: number | string
  type?: 'actions'
  actions?: TableAction[]
}