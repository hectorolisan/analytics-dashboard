import { expect, test } from '@playwright/test'

test('los filtros viven en la URL y sobreviven a recargar y navegar', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Resumen' })).toBeVisible()

  await page.getByLabel('Periodo').selectOption('7d')
  await page.getByLabel('Fuentes').selectOption('renewable')
  await expect(page).toHaveURL(/#\/resumen\?p=7d&f=renewable$/)

  await page.reload()
  await expect(page.getByLabel('Periodo')).toHaveValue('7d')
  await expect(page.getByLabel('Fuentes')).toHaveValue('renewable')

  await page.getByRole('link', { name: 'Evolución' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Evolución' })).toBeVisible()
  await expect(page).toHaveURL(/#\/evolucion\?p=7d&f=renewable$/)
})

test('rango de fechas personalizado', async ({ page }) => {
  await page.goto('/#/resumen?p=custom')
  await page.getByLabel('Desde').fill('2024-01-01')
  await page.getByLabel('Hasta').fill('2024-01-31')
  await expect(page).toHaveURL(/from=2024-01-01&to=2024-01-31/)
  await expect(page.getByText('1 ene 2024 – 31 ene 2024')).toBeVisible()
})

test('rango de años y comparativa en evolución', async ({ page }) => {
  await page.goto('/#/evolucion')
  await page.getByLabel('Desde').selectOption('2020')
  await expect(page).toHaveURL(/y0=2020/)
  await expect(page.getByRole('heading', { name: 'Comparativa anual' })).toBeVisible()
  await page.getByLabel('Año A').selectOption('2020')
  await expect(page).toHaveURL(/a=2020/)
})

test('exporta CSV de la pantalla y PNG de un gráfico', async ({ page }) => {
  await page.goto('/#/estacionalidad')
  await expect(page.getByRole('heading', { name: 'Calendario mensual' })).toBeVisible()

  const csv = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar' }).click()
  expect((await csv).suggestedFilename()).toMatch(/^ree-estacionalidad-.+\.csv$/)

  const png = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar imagen' }).first().click()
  expect((await png).suggestedFilename()).toBe('calendario-mensual.png')
})

test('cambia a modo oscuro y lo recuerda', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Activar modo oscuro' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('funciona sin conexión tras la primera visita', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await expect(page.getByRole('heading', { name: 'Demanda en el tiempo' })).toBeVisible()

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Demanda en el tiempo' })).toBeVisible()
})
