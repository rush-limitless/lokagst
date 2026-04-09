const { chromium } = require('playwright');
const path = require('path');

const BASE = 'https://lokagst.vercel.app';
const DIR = path.join(__dirname, 'screenshots');

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });
  const page = await ctx.newPage();

  // Login page
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${DIR}/01-login.png`, fullPage: false });
  console.log('01-login OK');

  // Login as admin
  await page.fill('input[type="email"]', 'admin@immostar.cm');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/02-dashboard.png`, fullPage: true });
  console.log('02-dashboard OK');

  // Immeubles
  await page.goto(`${BASE}/immeubles`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/03-immeubles.png`, fullPage: true });
  console.log('03-immeubles OK');

  // Appartements
  await page.goto(`${BASE}/appartements`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/04-appartements.png`, fullPage: true });
  console.log('04-appartements OK');

  // Locataires
  await page.goto(`${BASE}/locataires`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/05-locataires.png`, fullPage: true });
  console.log('05-locataires OK');

  // Profil locataire (first active one)
  const locLinks = await page.$$('a[href*="/locataires/"]');
  let profiled = false;
  for (const l of locLinks) {
    const href = await l.getAttribute('href');
    if (href && href.match(/\/locataires\/[a-z0-9]/)) {
      await page.goto(`${BASE}${href}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${DIR}/06-profil-locataire.png`, fullPage: true });
      console.log('06-profil-locataire OK');
      profiled = true;
      break;
    }
  }
  if (!profiled) console.log('06-profil-locataire SKIPPED');

  // Situation
  await page.goto(`${BASE}/situation`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/07-situation.png`, fullPage: true });
  console.log('07-situation OK');

  // Baux
  await page.goto(`${BASE}/baux`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/08-baux.png`, fullPage: true });
  console.log('08-baux OK');

  // Finances
  await page.goto(`${BASE}/finances`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/09-finances.png`, fullPage: true });
  console.log('09-finances OK');

  // Paiements
  await page.goto(`${BASE}/paiements`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/10-paiements.png`, fullPage: true });
  console.log('10-paiements OK');

  // Calendrier
  await page.goto(`${BASE}/calendrier`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/11-calendrier.png`, fullPage: true });
  console.log('11-calendrier OK');

  // Maintenance
  await page.goto(`${BASE}/maintenance`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/12-maintenance.png`, fullPage: true });
  console.log('12-maintenance OK');

  // Messagerie
  await page.goto(`${BASE}/messagerie`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/13-messagerie.png`, fullPage: true });
  console.log('13-messagerie OK');

  // Reporting
  await page.goto(`${BASE}/reporting`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/14-reporting.png`, fullPage: true });
  console.log('14-reporting OK');

  // Parametres
  await page.goto(`${BASE}/parametres`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/15-parametres.png`, fullPage: true });
  console.log('15-parametres OK');

  // Logout and login as locataire
  await ctx.clearCookies();
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'paul.mbarga@email.cm');
  await page.fill('input[type="password"]', 'locataire123');
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL('**/mon-espace', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${DIR}/16-portail-accueil.png`, fullPage: true });
    console.log('16-portail-accueil OK');

    await page.goto(`${BASE}/mon-espace/bail`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/17-portail-bail.png`, fullPage: true });
    console.log('17-portail-bail OK');

    await page.goto(`${BASE}/mon-espace/paiements`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/18-portail-paiements.png`, fullPage: true });
    console.log('18-portail-paiements OK');

    await page.goto(`${BASE}/mon-espace/maintenance`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/19-portail-maintenance.png`, fullPage: true });
    console.log('19-portail-maintenance OK');
  } catch (e) {
    console.log('Locataire login failed (no test account in prod DB), skipping portal screenshots');
  }

  await browser.close();
  console.log('DONE - all screenshots captured');
}

main().catch(e => { console.error(e); process.exit(1); });
