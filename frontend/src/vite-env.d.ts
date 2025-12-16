/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_DR_API_URL?: string
  readonly VITE_BALANCE_API_URL?: string
  readonly VITE_BARCODE_API_URL?: string
  readonly VITE_DR_BARCODE_API_URL?: string
  readonly VITE_FORCE_DR_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

