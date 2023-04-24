const formId = '';
const sheetId = '';

const form = FormApp.openById(formId);
const wsPeriod = SpreadsheetApp.openById(sheetId).getSheetByName('Period');
const questionTitle = 'Silakan Pilih Jadwal:';
const itemId = getIdByTitle(questionTitle);

function onOpen(e) {
  updatePeriods();
}

function onFormSubmit(e) {
  const formResponses = form.getResponses();
  const count = formResponses.length;
  const formReseponse = formResponses[count - 1];
  const email = formReseponse.getRespondentEmail();
  const itemResponses = formReseponse.getItemResponses();
  const answers = itemResponses.map((itemResponse) => { return itemResponse.getResponse(); });
  const selectedPeriod = answers[0];
  const capacity = parseInt(getCapacity(selectedPeriod));
  const name = answers[1];
  const noWa = answers[2];

  if (capacity >= 0) {
    const html = `
      <p>Bapak/Ibu ${name}</p>
      <p>Pendaftaran untuk tanggal ${selectedPeriod} berhasil</p>
      <p>Mohon hadir tepat waktu</p>
      <p>Silakan tunjukkan barcode di bawah ini kepada petugas</p>
    `;
    MailApp.sendEmail({
      to: email,
      subject: 'Pendaftaran ' + name,
      htmlBody: html,
    })
  }
  else {
    const html = `
      <p>Bapak/Ibu ${name}</p>
      <p>Mohon maaf, pendaftaran untuk tanggal ${selectedPeriod} sudah tidak tersedia</p>
      <p>Silakan memilih periode lainnya</p>
    `;
    MailApp.sendEmail({
      to: email,
      subject: 'Pendaftaran ' + name + ' sudah tidak tersedia',
      htmlBody: html,
    })

    // @todo, menghapus baris pada response ini
  }
  updatePeriods();
}

function getIdByTitle(title) {
  const items = form.getItems();
  const titles = items.map((item) => { return item.getTitle(); });
  const pos = titles.indexOf(title);
  return items[pos].getId();
}

function updatePeriods() {
  const periods = getPeriodsData();
  const periodsLabel = periods.map((period) => { return period[0]; });
  updateDropdown(periodsLabel);
}

function getPeriodsData() {
  const rowStart = 2;
  const colStart = 1;
  const noRows = wsPeriod.getLastRow() - 1;
  const noCols = 4;
  return wsPeriod
    .getRange(rowStart, colStart, noRows, noCols)
    .getValues()
    .map((period) => { return period; })
    .filter((period) => { return period[0] != '' && period[3] > 0; });
}

function getCapacity(periodName) {
  return getPeriodDataByPeriodName(periodName)[3];
}

function getPeriodDataByPeriodName(periodName) {
  const rowStart = 2;
  const colStart = 1;
  const noRows = wsPeriod.getLastRow() - 1;
  const noCols = 4;
  return wsPeriod
    .getRange(rowStart, colStart, noRows, noCols)
    .getValues()
    .map((period) => { return period; })
    .filter((period) => { return period[0] == periodName; })[0];
}

function updateDropdown(values) {
  const item = form.getItemById(itemId);
  item.asListItem().setChoiceValues(values);
}
