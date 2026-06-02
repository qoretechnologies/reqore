import http from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const port = Number(process.env.STORYBOOK_PORT || 6007);
const baseUrl = process.env.STORYBOOK_URL || `http://127.0.0.1:${port}`;
const ownsServer = !process.env.STORYBOOK_URL;
const chromeCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const stories = [
  {
    id: 'collections-table-stories--grouped-columns',
    viewports: [
      { width: 1200, height: 720 },
      { width: 860, height: 640 },
    ],
  },
  {
    id: 'collections-table-stories--compact-centered-runtime-columns',
    viewports: [
      { width: 1000, height: 520 },
      { width: 720, height: 520 },
    ],
    expectNoHorizontalOverflow: true,
  },
  {
    id: 'collections-table-stories--pinned-columns',
    viewports: [{ width: 1200, height: 720 }],
  },
  {
    id: 'collections-table-stories--hidden-columns',
    viewports: [{ width: 860, height: 640 }],
  },
];

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const canConnect = (url) =>
  new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });

const waitForStorybook = async () => {
  const started = Date.now();

  while (Date.now() - started < 120000) {
    if (await canConnect(baseUrl)) {
      return;
    }
    await timeout(1000);
  }

  throw new Error(`Storybook did not become ready at ${baseUrl}`);
};

const startStorybook = async () => {
  if (!ownsServer || (await canConnect(baseUrl))) {
    return undefined;
  }

  const child = spawn(
    './node_modules/.bin/storybook',
    ['dev', '-p', String(port), '--ci', '--no-open', '--quiet'],
    {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  child.stdout.on('data', (data) => process.stdout.write(data));
  child.stderr.on('data', (data) => process.stderr.write(data));

  await waitForStorybook();
  return child;
};

const rectData = (rect) => ({
  left: rect.left,
  right: rect.right,
  width: rect.width,
});

const assertClose = (actual, expected, message, tolerance = 1) => {
  const delta = Math.abs(actual - expected);
  if (delta > tolerance) {
    throw new Error(`${message}: expected ${expected}, got ${actual} (delta ${delta})`);
  }
};

const runStoryCheck = async (page, story, viewport) => {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/iframe.html?id=${story.id}&viewMode=story`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('.reqore-table-row', { timeout: 120000 });

  const layout = await page.evaluate(() => {
    const columnAttr = 'data-reqore-table-column-id';
    const groupAttr = 'data-reqore-table-column-group-id';
    const wrapper = document.querySelector('.reqore-table-wrapper');
    const body = document.querySelector('.reqore-table-body');
    const header = document.querySelector('.reqore-table-header-wrapper');
    const row = document.querySelector('.reqore-table-row');
    const rect = (el) => {
      const bounds = el.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, width: bounds.width };
    };

    return {
      headers: Array.from(header?.querySelectorAll(`[${columnAttr}]`) ?? []).map((el) => ({
        id: el.getAttribute(columnAttr),
        rect: rect(el),
      })),
      cells: Array.from(row?.children ?? [])
        .filter((el) => el.hasAttribute(columnAttr))
        .map((el) => ({
          id: el.getAttribute(columnAttr),
          rect: rect(el),
        })),
      groups: Array.from(header?.querySelectorAll(`[${groupAttr}]`) ?? []).map((group) => ({
        id: group.getAttribute(groupAttr),
        rect: rect(group),
        leaves: Array.from(group.querySelectorAll(`[${columnAttr}]`)).map((leaf) => ({
          id: leaf.getAttribute(columnAttr),
          rect: rect(leaf),
        })),
      })),
      wrapperRadius: wrapper ? parseFloat(getComputedStyle(wrapper).borderTopRightRadius) : 0,
      headerRadius: header ? parseFloat(getComputedStyle(header).borderTopRightRadius) : 0,
      bodyClientWidth: body?.clientWidth ?? 0,
      bodyScrollWidth: body?.scrollWidth ?? 0,
    };
  });

  if (!layout.headers.length || !layout.cells.length) {
    throw new Error(`${story.id}: table headers or body cells were not rendered`);
  }

  if (layout.wrapperRadius <= 0 || layout.headerRadius <= 0) {
    throw new Error(`${story.id}: table top-right border radius is missing`);
  }

  const cellsById = new Map(layout.cells.map((cell) => [cell.id, cell]));

  for (const header of layout.headers) {
    const cell = cellsById.get(header.id);
    if (!cell) {
      throw new Error(`${story.id}: no body cell found for header column ${header.id}`);
    }

    assertClose(
      rectData(cell.rect).left,
      rectData(header.rect).left,
      `${story.id}/${viewport.width}: ${header.id} left edge`
    );
    assertClose(
      rectData(cell.rect).width,
      rectData(header.rect).width,
      `${story.id}/${viewport.width}: ${header.id} width`
    );
  }

  for (const group of layout.groups) {
    const leavesWidth = group.leaves.reduce((total, leaf) => total + leaf.rect.width, 0);
    assertClose(
      leavesWidth,
      group.rect.width,
      `${story.id}/${viewport.width}: group ${group.id} span`
    );
  }

  if (
    story.expectNoHorizontalOverflow &&
    layout.bodyScrollWidth > layout.bodyClientWidth + 1
  ) {
    throw new Error(
      `${story.id}/${viewport.width}: unexpected horizontal overflow (${layout.bodyScrollWidth} > ${layout.bodyClientWidth})`
    );
  }
};

let server;
let browser;

try {
  server = await startStorybook();
  const executablePath = chromeCandidates.find((candidate) => existsSync(candidate));
  browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage();

  for (const story of stories) {
    for (const viewport of story.viewports) {
      await runStoryCheck(page, story, viewport);
    }
  }
} finally {
  await browser?.close();
  server?.kill('SIGTERM');
}
