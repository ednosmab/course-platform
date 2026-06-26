import { test, expect } from '@playwright/test';

const STORIES = [
  { name: 'button--primary', file: 'button-primary' },
  { name: 'button--secondary', file: 'button-secondary' },
  { name: 'button--ghost', file: 'button-ghost' },
  { name: 'card--default', file: 'card-default' },
  { name: 'card--interactive', file: 'card-interactive' },
  { name: 'icon--commonicons', file: 'icon-common-icons' },
  { name: 'icon--sizes', file: 'icon-sizes' },
  { name: 'icon--unknownicon', file: 'icon-unknown' },
  { name: 'text--variants', file: 'text-variants' },
  { name: 'text--customcolors', file: 'text-custom-colors' },
  { name: 'quoteblock--default', file: 'quoteblock-default' },
  { name: 'quoteblock--withauthor', file: 'quoteblock-with-author' },
  { name: 'quoteblock--styled', file: 'quoteblock-styled' },
  { name: 'textblock--default', file: 'textblock-default' },
  { name: 'textblock--withmarkdown', file: 'textblock-with-markdown' },
  { name: 'textblock--largetext', file: 'textblock-large-text' },
];

for (const story of STORIES) {
  test(`VRT: ${story.name}`, async ({ page }) => {
    await page.goto(`/?story=${story.name}`, { waitUntil: 'networkidle' });

    // Aguarda o conteúdo da story renderizar no DOM do Ladle
    // Ladle 5.x renderiza a story no elemento <main> principal
    await page.waitForTimeout(3000);

    // Screenshot do preview content — usa o viewport inteiro
    // para capturar o componente sem o sidebar do Ladle
    await expect(page).toHaveScreenshot(`${story.file}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
      timeout: 10000,
    });
  });
}
