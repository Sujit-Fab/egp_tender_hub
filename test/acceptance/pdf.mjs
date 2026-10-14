export async function syntheticPdf(browser, records) {
  const page = await browser.newPage();
  await page.route('**/*', route => route.abort());
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  await page.setContent(`<!doctype html><html><head><style>
    body{font:10px Arial;margin:8px}table{border-collapse:collapse;width:100%;table-layout:fixed}
    th{background:#ddd;text-align:left;padding:4px;vertical-align:top}td{padding:4px;vertical-align:top}
    p{margin:0 0 3px}thead{display:table-header-group}
    </style></head><body><table><colgroup>
    ${[4, 15, 24, 25, 7, 20, 5].map(width => `<col style="width:${width}%">`).join('')}
    </colgroup><thead><tr>${['S.', 'Tender/Proposal ID,', 'Procurement Nature,', 'Ministry, Division,', 'Type,', 'Publishing', 'Dashboard']
      .map(label => `<th>${label}</th>`).join('')}</tr></thead><tbody>
    ${records.map((r, index) => `<tr><td>${index + 1}</td><td><p>${escape(r.id)},</p><p>SYNTHETIC-REF${r.amendment ? ', Amendment / Corrigendum issued : 1' : ''}</p></td>
    <td>Works, ${escape(r.title ?? 'Synthetic road maintenance')}</td>
    <td><p>Synthetic Ministry,</p><p>Synthetic Organization,</p><p>Synthetic Entity</p></td>
    <td>NCT, OTM</td><td><p>01-Oct-2026 10:00,</p><p>${escape(r.closing ?? '20-Oct-2026 10:00')}</p></td><td>View</td></tr>`).join('')}
    </tbody></table></body></html>`);
  const bytes = await page.pdf({ format: 'A4', landscape: true, tagged: true, printBackground: true,
    margin: { top: '10px', left: '25px', right: '25px', bottom: '50px' }, displayHeaderFooter: true,
    headerTemplate: '<div></div>', footerTemplate: '<div style="font-size:8px;">https://www.eprocure.gov.bd/synthetic-acceptance</div>' });
  await page.close();
  return bytes;
}
