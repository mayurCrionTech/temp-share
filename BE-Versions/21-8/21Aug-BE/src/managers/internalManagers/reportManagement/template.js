// const puppeteer = require("puppeteer");
const { generatePDFFromHTML } = require("../../../utils/browserPool");
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const { LogEntryModel } = require("../../../models/mongoDB/logManagement/logEntry_model");
const { LogModel } = require("../../../models/mongoDB/logManagement/log_model");
const user_model = require("../../../models/mongoDB/userManagement/user_model");
const businessUnit_model = require("../../../models/mongoDB/organizationManagement/businessUnit_model");
const { DateTime } = require("luxon");
const { constructPackingReportTemplateData, sendPackingReportEmail } = require("../../../utils/emailService/templates/logReportEmailTemplate");
const XLSX = require('xlsx');

const formulaForShiftAndCapacity = {
  "Line 1_ (1 Lit)": 0.0091,
  "Line 2_ (1Lit)": 0.0091,
  "Line 3_ (500 ml )": 0.0091,
  "Line 4_ (RFS 1 Lit)": 0.0091,
  "Line 4_ (RBD 850g)": 0.0085,
  "Line 4_ (RFS 500 ml)": 0.0091,
  "Line 5_( Rs 10)": 0.01056,
  "Line 5_( Rs 20)": 0.01128,
  "Line 5_ (200 ml)": 0.01092,
  "Line 6_ (5 Lit Jar)": 0.01365,
  "Line 7_ (Kg-Tin)": 0.015,
  "Line 7_ (Lit-Tin)": 0.01365,
};

const capacityPerShift = {
  "Line 1_ (1 Lit)": 8648* formulaForShiftAndCapacity["Line 1_ (1 Lit)"],
  "Line 2_ (1Lit)": 8648* formulaForShiftAndCapacity["Line 2_ (1Lit)"],
  "Line 3_ (500 ml )": 4320* formulaForShiftAndCapacity["Line 3_ (500 ml )"],
  "Line 4_ (RFS 1 Lit)": 8648* formulaForShiftAndCapacity["Line 4_ (RFS 1 Lit)"],
  "Line 4_ (RBD 850g)": 3840* formulaForShiftAndCapacity["Line 4_ (RBD 850g)"],
  "Line 4_ (RFS 500 ml)": 3840* formulaForShiftAndCapacity["Line 4_ (RFS 500 ml)"],
  "Line 5_( Rs 10)": 330* formulaForShiftAndCapacity["Line 5_( Rs 10)"],
  "Line 5_( Rs 20)": 660* formulaForShiftAndCapacity["Line 5_( Rs 20)"],
  "Line 5_ (200 ml)": 990* formulaForShiftAndCapacity["Line 5_ (200 ml)"],
  "Line 6_ (5 Lit Jar)": 1400* formulaForShiftAndCapacity["Line 6_ (5 Lit Jar)"],
  "Line 7_ (Kg-Tin)": 2200* formulaForShiftAndCapacity["Line 7_ (Kg-Tin)"],
  "Line 7_ (Lit-Tin)": 2200* formulaForShiftAndCapacity["Line 7_ (Lit-Tin)"],
};

function modifyData(arr) {
  const shiftViseData = [];
  let obj = {};
  let chunkCount = 0;
  arr.forEach((entry, index) => {
    const date = new Date(entry.dop);
    const month = (date.getMonth() + 1)?.toString()?.length == 2
    ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1);
    const hours =
      date.getHours()?.toString()?.length == 2
        ? date.getHours()
        : "0" + date.getHours();
    const minutes =
      date.getMinutes()?.toString()?.length == 2
        ? date.getMinutes()
        : "0" + date.getMinutes();
    const timeKey = `${date.getDate()}/${month} ${hours}:${minutes}`;
    entry.dataFields.forEach((a) => {
      obj[`${a.fieldName}_${timeKey}`] = a.fieldValue;
    });
    if (++chunkCount === 8 || index === arr.length - 1) {
      const fieldMap = { columns: [] };
      Object.keys(obj).forEach((key) => {
        const auxKeyArr = key?.split("_");
        const time = Array.isArray(auxKeyArr) && auxKeyArr.length > 0 ? auxKeyArr[auxKeyArr?.length - 1] : "";
        const fieldName = Array.isArray(auxKeyArr) && auxKeyArr.length > 0 ? auxKeyArr.slice(0, auxKeyArr.length - 1).join("_") : "";
        if (!fieldMap[fieldName]) {
          fieldMap[fieldName] = {
            field: fieldName,
            entries: {},
            newEntries: {},
          };
        }
        // fieldMap[fieldName].entries.push({ key: time, value: obj[key] });
        fieldMap[fieldName].entries[time] = obj[key];
        if (!fieldMap.columns.includes(time)) {
          fieldMap.columns.push(time);
        }
      });
      while (fieldMap?.columns?.length < 8) {
        fieldMap.columns.push("");
      }
      const auxShiftData = Object.keys(fieldMap)
        .filter((key) => key !== "columns")
        .map((key, index) => {
          // while(fieldMap[key]?.entries?.length < 8) {
          //   fieldMap[key]?.entries.push({key:index,value:""})
          // }
          fieldMap.columns?.map((column, index) => {
            if (!fieldMap[key]?.entries?.[column]) {
              fieldMap[key].newEntries[`${index}_${column}`] = "";
            } else {
              fieldMap[key].newEntries[`${index}_${column}`] =
                fieldMap[key]?.entries?.[column];
            }
          });
          return fieldMap[key];
        });
      shiftViseData.push({ columns: fieldMap.columns, data: auxShiftData });
      obj = {};
      chunkCount = 0;
    }
  });
  return shiftViseData;
}

function generateReportLayout(
  data,
  shiftViseData,
  userName,
  recurr,
  entityName,
  businessUnit,
  approvedByNames, 
  allEntriesCompleted //qid_074
) {
  return `
  <html>
    <head>
      <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .header-section {
        display: flex;
        justify-content: space-between;
        padding: 20px;
        background-color: #ffff;
      }
      .left-section {
        display: flex;
        width: 200px;
        justify-content: center;
        align-items: center;
        border-top: 2px solid #06337e;
        border-bottom: 2px solid #06337e;
        border-left: 2px solid #06337e;
      }

      .logo-wrapper {
        display: flex;
        flex-direction: column;
	grid-gap: 1rem;
      }

      .logo-1,
      .logo-2 {
        margin: auto;
      }

      .right-section {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 2px solid #06337e;
      }
      .right-section p {
        width: 100%;
        text-align: center;
        font-weight: bold;
        padding: 1rem 0rem;
      }
      .p-1,
      .p-2 {
        border-bottom: 2px solid #06337e;
      }
      .body-section {
        padding: 20px;
      }
      .checklist-table td {
        width: 50%;
      }
      .gen_det_left,
      .gen_det_right {
        width: 100%;
        display: flex;
        align-items: center;
        grid-gap: 16px;
      }
      .gen_det_left > h4,
      .gen_det_right > h4 {
        min-width: 30%;
      }
      .gen_det_left > p,
      .gen_det_right > p {
        text-align: justify;
        font-weight: 400;
        color: black;
        word-wrap: break-word;
        font-family: sans-serif;
      }
      .assignees_wrapper {
        margin-bottom: 20px;
      }
      .entries_table {
        padding: 20px;
      }
      .column_header {
        background: #b2c0d7;
        width: 10%;
      }
      .column_static_header {
        width: 20%;
      }
      .filled_cell {
        background: #e6ebf2;
      }
      .entry-section {
        display: flex;
        justify-content: space-between;
      }
      .field_wrapper {
        width: 50%;
        display: flex;
        align-items: center;
        border: 2px solid #06337e;
        padding: 0.8rem;
        border-top: none;
      }
      .field_wrapper_2 {
        border-left: none;
      }
      .entry-section span {
        display: inline-block;
        margin-right: 10px;
      }
      .field_key {
        min-width: 150px;
        font-size: 16px;
        font-weight: 600;
      }
      .field_val {
        text-align: justify;
        font-weight: 500;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border: 2px solid #06337e;
      }
      th,
      td {
        padding: 12px;
        text-align: left;
        word-wrap: break-word;
        /* min-width: 140px;
            max-width: 200px; */
        border: 2px solid #06337e;
      }
      .remarks {
        height: 100px;
        vertical-align: top;
      }
      .signature {
        text-align: center;
        padding-top: 20px;
      }
      .signature img {
        width: 100px;
        height: 50px;
      }
      .footer {
        width: 100%;
        padding: 20px;
      }
      .signature_wrapper {
        display: flex;
        width: 100%;
      }
      .signature {
        width: 50%;
        height: 100px;
        border: 2px solid #06337e;
      }
      .sign_2 {
        border-left: none;
      }
      .footer > div {
        display: flex;
      }
    </style>
    </head>
    <body>
      <div aria-label="parent-div" class="parent-div">
      <header class="header-section">
        <section aria-label="left-section" class="left-section">
          <div class="logo-wrapper">	
      <div class="logo-1">
          ${businessUnit.logo1}
            </div>
      <div class="logo-2">
      ${businessUnit.logo2}
            </div>
    </div>
        </section>
        <section aria-label="right-section"  class="right-section">
          <p class="p-1">CLONOS</p>
          <!-- <p class="p-2">${entityName} - ${recurr} - Report</p> --> <!--qid_074-->
         <p class="p-2">${entityName} - Report</p> <!--qid_074-->
          <p class="p-3">Business Unit - ${businessUnit.name}</p>
        </section>
      </header>
      <div aria-label="body" class="body-section">
        <div id="children-1" aria-label="children-1">
           <table class="checklist-table">
            <tbody>
              ${data
                ?.map((item) =>
                  Array.isArray(item.rightSide)
                    ? `
                <tr>
                  <td>
                    <div class="gen_det_left"><h4>${item.leftSide.key}:</h4> <p>${item.leftSide.value}</p></div>
                  </td>
                  <td>
                      <div>
                          <div class="gen_det_left assignees_wrapper"><h4>${item.rightSide[0].key
          }:</h4> <p>${item.rightSide[0]?.value
            ?.map((user) => `<span>${user.name}</span>`)
            .join(",")}</p></div>
                      </div>
                      <div>
                          <div class="gen_det_left approver_wrapper"><h4>${item.rightSide[1].key}:</h4> <p>${item.rightSide[1].value?.name
          }</p></div>
                      </div>
                  </td>
                </tr>
              `
          : `
                <tr>
                  <td>
                    <div class="gen_det_left"><h4>${item.leftSide.key}:</h4> <p>${item.leftSide.value}</p></div>
                  </td>
                  <td>
                    <div class="gen_det_left"><h4>${item.rightSide.key}:</h4> <p>${item.rightSide.value}</p></div>
                  </td>
                </tr>
              `
      )
      .join("")}
            </tbody>
          </table>
        </div>
        </div>
        ${shiftViseData
      ?.map(
        (shift, index) => `
          <div class="entries_table">
              <table>
                  <thead>
                      <tr>
                          <th class="column_header column_static_header">Description</th>
                          ${shift?.columns?.map((column) => `<th class="column_header">${column}</th>`).join("")}
                      </tr>
                  </thead>
                  <tbody>
                          ${shift?.data
            ?.map(
              (row) => `<tr>
                                  <td>${row?.field}</td>
                                  ${Object.keys(row?.newEntries)
                  ?.map(
                    (entry, index) =>
                      `<td class=${index % 2 === 0 ? "filled_cell" : ""}>${row?.newEntries?.[entry]?.toString() || "-"
                      }</td>`
                  )
                  .join("")}
                              </tr>`
            )
            .join("")}
                  </tbody>
              </table>
              </div>`
      )
      .join("")}
      <div class="footer">
              <div class="signature_wrapper">
                <div class="signature sign_1"></div>
                <div class="signature sign_2"></div>
              </div>
              <div >
                <!-- <div class="field_wrapper">
                    <span class="field_key">Validate By :</span>
                   ${approvedByNames.length > 0? approvedByNames.map((name) => `<span class="field_val">${name}</span>`).join(",") : "-"}
                </div>   -->
                <!--qid_074-->
                <div class="field_wrapper">
                <span class="field_key">Validate By :</span>
                <span class="field_val">${userName || "-"}</span>
                </div>  
                <!--qid_074-->  
               <!-- <div class="field_wrapper field_wrapper_2">
                    <span class="field_key">Approved By :</span>
                    ${approvedByNames.length > 0? approvedByNames.map((name) => `<span class="field_val">${name}</span>`).join(",") : "Pending for Approval"}
                </div> -->
                <!--qid_074-->
                <div class="field_wrapper field_wrapper_2">
                <span class="field_key">Approved By :</span>
                ${allEntriesCompleted ? approvedByNames.map((name) => `<span class="field_val">${name}</span>`).join(", "): `<span class="field_val">Pending for Approval</span>`}
                <!--qid_074-->
                </div>
              </div>
        </div>
    </div>
    </body>
  </html>`;
}

function generateReportLayoutForSingleEntry(
  data,
  shiftViseData,
  userName,
  recurr,
  entityName,
  businessUnit,
  approvedByNames,
  validatedBy //qid_074
) {
  return `
  <html>
    <head>
      <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .header-section {
        display: flex;
        justify-content: space-between;
        padding: 20px;
        background-color: #ffff;
      }
      .left-section {
        display: flex;
        width: 200px;
        justify-content: center;
        align-items: center;
        border-top: 2px solid #06337e;
        border-bottom: 2px solid #06337e;
        border-left: 2px solid #06337e;
      }

      .logo-wrapper {
        display: flex;
        flex-direction: column;
	grid-gap: 1rem;
      }

      .logo-1,
      .logo-2 {
        margin: auto;
      }

      .right-section {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 2px solid #06337e;
      }
      .right-section p {
        width: 100%;
        text-align: center;
        font-weight: bold;
        padding: 1rem 0rem;
      }
      .p-1,
      .p-2 {
        border-bottom: 2px solid #06337e;
      }
      .body-section {
        padding: 20px;
      }
      .checklist-table td {
        width: 50%;
      }
      .gen_det_left,
      .gen_det_right {
        width: 100%;
        display: flex;
        align-items: center;
        grid-gap: 16px;
      }
      .gen_det_left > h4,
      .gen_det_right > h4 {
        min-width: 30%;
      }
      .gen_det_left > p,
      .gen_det_right > p {
        text-align: justify;
        font-weight: 400;
        color: black;
        word-wrap: break-word;
        font-family: sans-serif;
      }
      .assignees_wrapper {
        margin-bottom: 20px;
      }
      .entries_table {
        padding: 20px;
      }
      .column_header {
        background: #b2c0d7;
        width: 70%;
      }
      .column_static_header {
        width: 30%; /* Reduced width for Description */
        word-break: break-word;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .filled_cell {
        background: #e6ebf2;
      }
      .entry-section {
        display: flex;
        justify-content: space-between;
      }
      .field_wrapper {
        width: 50%;
        display: flex;
        align-items: center;
        border: 2px solid #06337e;
        padding: 0.8rem;
        border-top: none;
      }
      .field_wrapper_2 {
        border-left: none;
      }
      .entry-section span {
        display: inline-block;
        margin-right: 10px;
      }
      .field_key {
        min-width: 150px;
        font-size: 16px;
        font-weight: 600;
      }
      .field_val {
        text-align: justify;
        font-weight: 500;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border: 2px solid #06337e;
      }
      th,
      td {
        padding: 12px;
        text-align: left;
        word-wrap: break-word;
        /* min-width: 140px;
            max-width: 200px; */
        border: 2px solid #06337e;
      }
      .remarks {
        height: 100px;
        vertical-align: top;
      }
      .signature {
        text-align: center;
        padding-top: 20px;
      }
      .signature img {
        width: 100px;
        height: 50px;
      }
      .footer {
        width: 100%;
        padding: 20px;
      }
      .signature_wrapper {
        display: flex;
        width: 100%;
      }
      .signature {
        width: 50%;
        height: 100px;
        border: 2px solid #06337e;
      }
      .sign_2 {
        border-left: none;
      }
      .footer > div {
        display: flex;
      }
    </style>
    </head>
    <body>
      <div aria-label="parent-div" class="parent-div">
      <header class="header-section">
        <section aria-label="left-section" class="left-section">
          <div class="logo-wrapper">	
      <div class="logo-1">
          ${businessUnit.logo1}
            </div>
      <div class="logo-2">
      ${businessUnit.logo2}
            </div>
    </div>
        </section>
        <section aria-label="right-section"  class="right-section">
          <!--<p class="p-1">KRPL - ${businessUnit.name}</p> --> <!--qid_074-->
         <!-- <p class="p-2">${entityName} - ${recurr} - Report</p> --> <!--qid_074-->
         <p class="p-1"> ${businessUnit.name}</p> <!--qid_074-->
          <p class="p-2">${entityName} - Report</p> <!--qid_074-->
          <!-- <p class="p-3">${businessUnit.name} - Business Unit Chennai</p> -->
          <p class="p-3">${businessUnit.name} - Business Unit</p> <!--qid_074-->
        </section>
      </header>
      <div aria-label="body" class="body-section">
        <div id="children-1" aria-label="children-1">
           <table class="checklist-table">
            <tbody>
              ${data
                ?.map((item) =>
                  Array.isArray(item.rightSide)
                    ? `
                <tr>
                  <td>
                    <div class="gen_det_left"><h4>${item.leftSide.key}:</h4> <p>${item.leftSide.value}</p></div>
                  </td>
                  <td>
                      <div>
                          <div class="gen_det_left assignees_wrapper"><h4>${item.rightSide[0].key
          }:</h4> <p>${item.rightSide[0]?.value
            ?.map((user) => `<span>${user.name}</span>`)
            .join(",")}</p></div>
                      </div>
                      <div>
                          <div class="gen_det_left approver_wrapper"><h4>${item.rightSide[1].key}:</h4> <p>${item.rightSide[1].value?.name
          }</p></div>
                      </div>
                  </td>
                </tr>
              `
          : `
                <tr>
                  <td>
                    <div class="gen_det_left"><h4>${item.leftSide.key}:</h4> <p>${item.leftSide.value}</p></div>
                  </td>
                  <td>
                    <div class="gen_det_left"><h4>${item.rightSide.key}:</h4> <p>${item.rightSide.value}</p></div>
                  </td>
                </tr>
              `
      )
      .join("")}
            </tbody>
          </table>
        </div>
        </div>
        ${shiftViseData
      ?.map(
        (shift, index) => `
          <div class="entries_table">
  <table>
    <thead>
      <tr>
        <th class="column_header column_static_header">Description</th>
        <th class="column_header">Value</th>
      </tr>
    </thead>
   <tbody>
  ${shiftViseData
    ?.map(
      (shift) =>
        shift?.data
          ?.map((row) => {
            // Extract values and filter out empty ones
            const values = Object.values(row?.newEntries || {}).filter((v) => v);

            return `
              <tr>
                <td>${row?.field}</td>
                <td>${values.length > 0 ? values.join(", ") : "-"}</td>
              </tr>
            `;
          })
          .join("")
    )
    .join("")}
</tbody>

  </table>
</div>`
      )
      .join("")}
      <div class="footer">
              <div class="signature_wrapper">
                <div class="signature sign_1"></div>
                <div class="signature sign_2"></div>
              </div>
              <div >
                <div class="field_wrapper">
                    <!-- <span class="field_key">Validate By :</span>
                    ${approvedByNames.length > 0? approvedByNames.map((name) => `<span class="field_val">${name}</span>`).join(",") : "-"} -->
                <span class="field_key">Validate By :</span> <!--qid_074-->
                <span class="field_val">${userName || "-"}</span> <!--qid_074-->
                </div>
                <div class="field_wrapper field_wrapper_2">
                    <span class="field_key">Approved By :</span>
                    ${approvedByNames.length > 0? approvedByNames.map((name) => `<span class="field_val">${name}</span>`).join(",") : "Pending for Approval"}
                </div>
              </div>
        </div>
    </div>
    </body>
  </html>`;
};

// //working code
// function generateWorkOrderPDFTemplate(
//   businessUnit,
//   entityName,
//   data ,
//   workOrderEntries,
//   validatedByNames,
//   status,
// ) {
//   return `
//   <html>
//     <head>
//       <style>
//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }
//         body {
//           font-family: Arial, sans-serif;
//         }
//         .header-section {
//           display: flex;
//           justify-content: space-between;
//           padding: 20px;
//           background-color: #fff;
//         }
//         .left-section {
//           display: flex;
//           width: 200px;
//           justify-content: center;
//           align-items: center;
//           border-top: 2px solid #06337e;
//           border-bottom: 2px solid #06337e;
//           border-left: 2px solid #06337e;
//         }
//         .logo-wrapper {
//           display: flex;
//           flex-direction: column;
//           grid-gap: 1rem;
//         }
//         .logo-1,
//         .logo-2 {
//           margin: auto;
//         }
//         .right-section {
//           width: 100%;
//           display: flex;
//           flex-direction: column;
//           justify-content: space-between;
//           border: 2px solid #06337e;
//         }
//         .right-section p {
//           width: 100%;
//           text-align: center;
//           font-weight: bold;
//           padding: 1rem 0rem;
//         }
//         .p-1,
//         .p-2 {
//           border-bottom: 2px solid #06337e;
//         }
//         .body-section {
//           padding: 20px;
//         }
//         .checklist-table td {
//           width: 50%;
//         }
//         .gen_det_left {
//           width: 100%;
//           display: flex;
//           align-items: center;
//           grid-gap: 16px;
//         }
//         .gen_det_left > h4 {
//           min-width: 30%;
//         }
//         .gen_det_left > p {
//           text-align: justify;
//           font-weight: 400;
//           color: black;
//           word-wrap: break-word;
//           font-family: sans-serif;
//         }
//         table {
//           width: 100%;
//           border-collapse: collapse;
//           border: 2px solid #06337e;
//           margin-top: 1rem;
//         }
//         th, td {
//           padding: 12px;
//           text-align: left;
//           border: 2px solid #06337e;
//           word-wrap: break-word;
//         }
//         th {
//           background: #b2c0d7;
//         }
//         td {
//           background: #e6ebf2;
//         }
//         .entries_table th,
//         .entries_table td {
//           width: 50%;
//         }        
//         .footer {
//           width: 100%;
//           padding: 20px;
//         }
//         .signature_wrapper {
//           display: flex;
//           width: 100%;
//         }
//         .signature {
//           width: 50%;
//           height: 100px;
//           border: 2px solid #06337e;
//         }
//         .sign_2 {
//           border-left: none;
//         }
//         .footer > div {
//           display: flex;
//         }
//         .field_wrapper {
//           width: 50%;
//           display: flex;
//           align-items: center;
//           border: 2px solid #06337e;
//           padding: 0.8rem;
//           border-top: none;
//         }
//         .field_wrapper_2 {
//           border-left: none;
//         }
//         .field_key {
//           min-width: 150px;
//           font-size: 16px;
//           font-weight: 600;
//         }
//         .field_val {
//           text-align: justify;
//           font-weight: 500;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="parent-div">
//         <header class="header-section">
//           <section class="left-section">
//             <div class="logo-wrapper">
//               <div class="logo-1">${businessUnit.logo1 || ""}</div>
//               <div class="logo-2">${businessUnit.logo2 || ""}</div>
//             </div>
//           </section>
//           <section class="right-section">
//             <p class="p-1">CLONOS</p>
//             <p class="p-2">${entityName} - Work Order Report</p>
//             <p class="p-3">Business Unit - ${businessUnit.name || ""}</p>
//           </section>
//         </header>

//         <div class="body-section">
//           <table class="checklist-table">
//             <tbody>
//               ${data
//                 ?.map(
//                   (item) => `
//                     <tr>
//                       <td>
//                         <div class="gen_det_left"><h4>${item.leftSide.key}:</h4> <p>${item.leftSide.value}</p></div>
//                       </td>
//                       <td>
//                         <div class="gen_det_left"><h4>${item.rightSide.key}:</h4> <p>${item.rightSide.value}</p></div>
//                       </td>
//                     </tr>
//                   `
//                 )
//                 .join("")}
//             </tbody>
//           </table>

//           <!-- Work Order Status Table -->
//           <div class="entries_table">
//             <table>
//               <thead>
//                 <tr>
//                 <th>Tasks</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${workOrderEntries
//                   ?.map(
//                     (entry) => `
//                       <tr>
//                       <td>${entry.description || "-"}</td>
//                         <td>${entry.status || "-"}</td>
//                       </tr>
//                     `
//                   )
//                   .join("")}
//               </tbody>
//             </table>
//           </div>
//         </div>
//         <div class="footer">
//           <div class="signature_wrapper">
//             <div class="signature sign_1"></div>
//             <div class="signature sign_2"></div>
//           </div>
//           <div>
//             <div class="field_wrapper">
//               <span class="field_key">Created By :</span>
//               <span class="field_val">${validatedByNames || "-"}</span>
//             </div>
//             <div class="field_wrapper field_wrapper_2">
//               <span class="field_key">Executed By :</span>
//               <span class="field_val">${status || "-"}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </body>
//   </html>`;
// }

//duplicated
function generateWorkOrderPDFTemplate(
  businessUnit,
  entityName,
  data,
  workOrderEntries,
  validatedByNames,
  status,
  spareUsed
) {
  return `
  <html>
    <head>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          padding: 10px 20px;
          background-color: #fff;
        }
        .left-section {
          display: flex;
          width: 200px;
          justify-content: center;
          align-items: center;
          border-top: 2px solid #06337e;
          border-bottom: 2px solid #06337e;
          border-left: 2px solid #06337e;
        }
        .logo-wrapper {
          display: flex;
          flex-direction: column;
          grid-gap: 1rem;
        }
        .logo-1,
        .logo-2 {
          margin: auto;
        }
        .right-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 2px solid #06337e;
        }
        .right-section p {
          width: 100%;
          text-align: center;
          font-weight: bold;
          padding: 1rem 0;
        }
        .p-1,
        .p-2 {
          border-bottom: 2px solid #06337e;
        }
        .body-section {
          padding: 10px 20px;
        }
        .gen_det_left {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .gen_det_left > h4 {
          min-width: 30%;
        }
        .gen_det_left > p {
          text-align: justify;
          font-weight: 400;
          color: black;
          word-wrap: break-word;
          font-family: sans-serif;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #06337e;
          margin-top: 1rem;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border: 2px solid #06337e;
          word-wrap: break-word;
        }
        th {
          background: #b2c0d7;
        }
        td {
          background: #e6ebf2;
        }
        .checklist-table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #06337e;
          table-layout: fixed; /* ensures consistent width with other tables */
          margin-top: 0.5rem;
        }
        .entries_table th,
        .entries_table td {
          width: 50%;
        }
        .entries_table {
          margin-top: 0;
          border-top: none;
        }         
        .footer {
          width: 100%;
          padding: 20px;
        }
        .signature_wrapper {
          display: flex;
          width: 100%;
        }
        .signature {
          width: 50%;
          height: 100px;
          border: 2px solid #06337e;
        }
        .sign_2 {
          border-left: none;
        }
        .footer > div {
          display: flex;
        }
        .field_wrapper {
          width: 50%;
          display: flex;
          align-items: center;
          border: 2px solid #06337e;
          padding: 0.8rem;
          border-top: none;
        }
        .field_wrapper_2 {
          border-left: none;
        }
        .field_key {
          min-width: 150px;
          font-size: 16px;
          font-weight: 600;
        }
        .field_val {
          text-align: justify;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="parent-div">
        <!-- Header Section -->
        <header class="header-section">
          <section class="left-section">
            <div class="logo-wrapper">
              <div class="logo-1">${businessUnit.logo1 || ""}</div>
              <div class="logo-2">${businessUnit.logo2 || ""}</div>
            </div>
          </section>
          <section class="right-section">
            <p class="p-1">CLONOS</p>
            <p class="p-2">${entityName} - Work Order Report</p>
            <p class="p-3">Business Unit - ${businessUnit.name || ""}</p>
          </section>
        </header>

        <div class="body-section">
          <!-- General Details Table -->
          <table class="checklist-table">
            <tbody>
              ${data
                ?.map(
                  (item) => `
                    <tr>
                      <td>
                        <div class="gen_det_left"><h4>${item.leftSide.key}:</h4> <p>${item.leftSide.value}</p></div>
                      </td>
                      <td>
                        <div class="gen_det_left"><h4>${item.rightSide.key}:</h4> <p>${item.rightSide.value}</p></div>
                      </td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
          <!-- Work Order Status Table -->
          <div class="entries_table">
            <table>
              <thead>
                <tr>
                  <th>Tasks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${workOrderEntries
                  ?.map(
                    (entry) => `
                      <tr>
                        <td>${entry.description || "-"}</td>
                        <td>${entry.status || "-"}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <!-- Spare Used Table -->
          <div class="entries_table">
          <table>
          <thead>
          <tr>
            <th style="width:25%">Spare Name</th>
          <th style="width:25%">Requested Quantity</th>
        <th style="width:25%">Replaced Quantity</th>
        <th style="width:25%">Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${
        spareUsed
          ?.map(
            (spare) => `
            <tr>
              <td style="width:25%">${spare.name || "-"}</td>
              <td style="width:25%">${spare.requestedQuantity || "-"}</td>
              <td style="width:25%">${spare.replacedQuantity || "-"}</td>
              <td style="width:25%">${spare.remarks || "-"}</td>
            </tr>
          `
          )
          .join("") ||
        `<tr><td colspan="4" style="text-align:center;">No spares used</td></tr>`
      }
    </tbody>
  </table>
</div>

        </div>

        <!-- Footer Section -->
        <div class="footer">
          <div class="signature_wrapper">
            <div class="signature sign_1"></div>
            <div class="signature sign_2"></div>
          </div>
          <div>
            <div class="field_wrapper">
              <span class="field_key">Created By :</span>
              <span class="field_val">${validatedByNames || "-"}</span>
            </div>
            <div class="field_wrapper field_wrapper_2">
              <span class="field_key">Status :</span>
              <span class="field_val">${status || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}




async function generateWorkOrderPDF(
  data,
  status,
  taskItem,
  workOrderName,
  userName,
  recurr,
  businessUnit,
  createdByName,
  spareUsed,
  frequency,
  timePeriod,
  reportNumber,
) {
  try {
    const randomN = Math.floor(Math.random() * 100);
    let reportN;
    let reportH;
    if (recurr === "Manual") {
      reportN = workOrderName ? `${workOrderName}-${randomN}` : `file-${randomN}`;
      reportH = "Manual";
    } else {
      reportN = workOrderName
        ? `${workOrderName}-${reportNumber}`
        : `file-${reportNumber}`;
      reportH = timePeriod ? timePeriod : "day";
    }
    const folderPath = "internalUploads/reports";
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(
      folderPath,
      `${reportN.replace(/\s+/g, "")}.pdf`
    );
    const htmlContent = generateWorkOrderPDFTemplate(
      businessUnit,
      workOrderName,
      data,
      taskItem,
      createdByName,
      status,
      spareUsed
    );
    // Commented below lines for CPU utilisation
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });
    // const page = await browser.newPage();
    // await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    // await page.pdf({
    //   path: filePath,
    //   format: "A3",
    //   timeout: 60000, // Increase timeout to 60 seconds
    //   margin: {
    //     top: "0.3in",
    //     right: "0.3in",
    //     bottom: "0.3in",
    //     left: "0.3in",
    //   },
    // });
    // await browser.close();
    // const pdfBytes = fs.readFileSync(filePath);
    // const pdfDoc = await PDFDocument.load(pdfBytes);
    const pdfBuffer = await generatePDFFromHTML(htmlContent, { path: filePath });
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle(reportN || "Default Title");
    pdfDoc.setAuthor(userName || "Default Author");
    pdfDoc.setSubject("Report");
    pdfDoc.setKeywords(["report", "pdf", "generated"]);
    const pdfBytesWithMetadata = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytesWithMetadata);
    return { filePath, reportN };
  } catch (err) {
    throw err;
  }
}


async function generatePDF(
  data,
  entriesItem,
  reportName,
  userName,
  recurr,
  businessUnit,
  approvedByNames,
  allEntriesCompleted, //qid_074
  frequency,
  timePeriod,
  reportNumber
) {
  try {
    const randomN = Math.floor(Math.random() * 100);
    let reportN;
    let reportH;
    if (recurr === "Manual") {
      reportN = reportName ? `${reportName}-${randomN}` : `file-${randomN}`;
      reportH = "Manual";
    } else {
      reportN = reportName
        ? `${reportName}-${reportNumber}`
        : `file-${reportNumber}`;
      reportH = timePeriod ? timePeriod : "day";
    }
    const folderPath = "internalUploads/reports";
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(
      folderPath,
      `${reportN.replace(/\s+/g, "")}.pdf`
    );
    const htmlContent = generateReportLayout(
      data,
      modifyData(entriesItem, frequency, timePeriod),
      userName,
      reportH,
      reportName,
      businessUnit,
      approvedByNames,
      allEntriesCompleted //qid_074
    );
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });
    // const page = await browser.newPage();
    // await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    // await page.pdf({
    //   path: filePath,
    //   format: "A3",
    //   timeout: 60000, // Increase timeout to 60 seconds
    //   margin: {
    //     top: "0.3in",
    //     right: "0.3in",
    //     bottom: "0.3in",
    //     left: "0.3in",
    //   },
    // });
    // await browser.close();
    // const pdfBytes = fs.readFileSync(filePath);
    // const pdfDoc = await PDFDocument.load(pdfBytes);
    const pdfBuffer = await generatePDFFromHTML(htmlContent, { path: filePath });
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle(reportN || "Default Title");
    pdfDoc.setAuthor(userName || "Default Author");
    pdfDoc.setSubject("Report");
    pdfDoc.setKeywords(["report", "pdf", "generated"]);
    const pdfBytesWithMetadata = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytesWithMetadata);
    return { filePath, reportN };
  } catch (err) {
    throw err;
  }
}

function modifyDataLandscape(arr) {
  const shiftViseData = [];
  let obj = {};
  let chunkCount = 0;
  arr.forEach((entry, index) => {
    const date = new Date(entry.dop);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const timeKey = `${day}/${month} ${hours}:${minutes}`;

    entry.dataFields.forEach((a) => {
      obj[`${a.fieldName}_${timeKey}`] = a.fieldValue;
    });
    if (++chunkCount === 8 || index === arr.length - 1) {
      const fieldMap = { columns: [] };
      Object.keys(obj).forEach((key) => {
        const auxKeyArr = key.split("_");
        const time = auxKeyArr.pop();
        const fieldName = auxKeyArr.join("_");

        if (!fieldMap[fieldName]) {
          fieldMap[fieldName] = {
            field: fieldName,
            entries: {},
            newEntries: {},
          };
        }

        fieldMap[fieldName].entries[time] = obj[key];
        if (!fieldMap.columns.includes(time)) {
          fieldMap.columns.push(time);
        }
      });

      while (fieldMap.columns.length < 8) {
        fieldMap.columns.push("");
      }

      const auxShiftData = Object.keys(fieldMap)
        .filter((key) => key !== "columns")
        .map((key) => {
          fieldMap.columns.forEach((column) => {
            fieldMap[key].newEntries[column] = fieldMap[key].entries[column] || "";
          });
          return fieldMap[key];
        });

      shiftViseData.push({ columns: fieldMap.columns, data: auxShiftData });
      obj = {};
      chunkCount = 0;
    }
  });

  return shiftViseData;
}

function generateReportLayoutLandscape(
  data,
  shiftViseData,
  userName,
  recurr,
  entityName,
  businessUnit,
  approvedByNames,
  allEntriesCompleted //qid_074
) {
  return `
  <html>
    <head>
        <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .header-section {
        display: flex;
        justify-content: space-between;
        padding: 20px;
        background-color: #ffff;
      }
      .left-section {
        display: flex;
        width: 200px;
        justify-content: center;
        align-items: center;
        border-top: 2px solid #06337e;
        border-bottom: 2px solid #06337e;
        border-left: 2px solid #06337e;
      }
      .logo-wrapper {
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .logo-1,
      .logo-2 {
        margin: auto;
      }
      .right-section {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border: 2px solid #06337e;
      }
      .right-section p {
        width: 100%;
        text-align: center;
        font-weight: bold;
        font-size: 23px;
        padding: 1rem 1rem;
      }
      .p-1,
      .p-2 {
        border-bottom: 2px solid #06337e;
      }
      .body-section {
        padding: 20px;
      }
      .checklist-table td {
        width: 50%;
      }
      .checklist-table {
        margin-top: -10px;
      }
      .gen_det_left,
      .gen_det_right {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .gen_det_left > h4,
      .gen_det_right > h4 {
        min-width: 30%;
      }
      .gen_det_left > p,
      .gen_det_right > p {
        text-align: justify;
        font-weight: 400;
        color: black;
        word-wrap: break-word;
        font-family: sans-serif;
      }
      .assignees_wrapper {
        margin-bottom: 20px;
      }
      .entries_table {
        margin-top: 10px;
      }
      .column_header {
        background: #b2c0d7;
        width: 10%;
      }
      .column_static_header {
        width: 20%;
      }
      .filled_cell {
        background: #e6ebf2;
      }
      .entry-section {
        display: flex;
        justify-content: space-between;
      }
      .field_wrapper {
        width: 50%;
        display: flex;
        align-items: center;
        border: 2px solid #06337e;
        padding: 0.8rem;
        border-top: none;
      }
      .field_wrapper_2 {
        border-left: none;
      }
      .field_key {
        min-width: 150px;
        font-size: 16px;
        font-weight: 600;
      }
      .field_val {
        text-align: justify;
        font-weight: 500;
      }
      table {
        width: 100%;
        table-layout: fixed;
        border-collapse: collapse;
        border: 2px solid #06337e;
      }
      th,
      td {
        padding: 12px;
        text-align: left;
        word-wrap: break-word;
        border: 2px solid #06337e;
      }
      .footer {
        width: 100%;
        padding: 20px;
      }
      .signature_wrapper {
        display: flex;
        width: 100%;
      }
      .signature {
        width: 50%;
        height: 100px;
        border: 2px solid #06337e;
      }
      .sign_2 {
        border-left: none;
      }
      .footer > div {
        display: flex;
      }
    </style>
    </head>
    <body>
      <div class="parent-div">
       <header class="header-section">
          <section class="left-section">
            <div class="logo-wrapper">
              <div class="logo-1">${businessUnit.logo1}</div>
              <div class="logo-2">${businessUnit.logo2}</div>
            </div>
          </section>
          <section class="right-section">
            <p class="p-1">CLONOS</p>
            <p class="p-3">Business Unit - ${businessUnit.name}</p>
          </section>
        </header>

        <div class="body-section">
          <!-- Checklist Section -->
          <div id="children-1">
            <table class="checklist-table">
              <tbody>
                ${data?.map((item) => {
                  if (Array.isArray(item.rightSide)) {
                    return `
                      <tr>
                        <td>
                          <div class="gen_det_left"><h4>${item.leftSide.key}:</h4><p>${item.leftSide.value}</p></div>
                        </td>
                        <td>
                          <div class="gen_det_left assignees_wrapper"><h4>${item.rightSide[0].key}:</h4> <p>${item.rightSide[0]?.value?.map((user) => `<span>${user.name}</span>`).join(",")}</p></div>
                          <!-- <div class="gen_det_left approver_wrapper"><h4>${item.rightSide[1].key}:</h4> <p>${item.rightSide[1].value?.name}</p></div> -->
                          <!--qid_074-->
                          <div class="gen_det_left approver_wrapper"><h4>${item.rightSide[1].key}:</h4> <p>${item.rightSide[1].value?.map((user) => user.name).join(", ")}</p></div>
                          <!--qid_074-->
                        </td>
                      </tr>`;
                  } else {
                    return `
                      <tr>
                        <td>
                          <div class="gen_det_left"><h4>${item.leftSide.key}:</h4><p>${item.leftSide.value}</p></div>
                        </td>
                        <td>
                          <div class="gen_det_left"><h4>${item.rightSide.key}:</h4><p>${item.rightSide.value}</p></div>
                        </td>
                      </tr>`;
                  }
                }).join("")}
              </tbody>
            </table>
          </div>

          ${(() => {
            const normalizeTime = (t) => {
              const [h, m = "00"] = t.split(":");
              return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            };

            const dateWiseMap = {};

            // Build the data map
            shiftViseData.forEach((shift) => {
              shift.data.forEach((row) => {
                Object.entries(row.newEntries || {}).forEach(([timestamp, value]) => {
                  if (!timestamp || typeof timestamp !== "string" || !timestamp.includes(" ")) return;
                  const [date, time] = timestamp.split(" ");
                  const normTime = normalizeTime(time);
                  const fullTimestamp = `${date} ${normTime}`;
                  if (!dateWiseMap[row.field]) dateWiseMap[row.field] = {};
                  dateWiseMap[row.field][fullTimestamp] = value;
                });
              });
            });

            const allTimeSlots = Array.from(
              new Set(Object.values(dateWiseMap).flatMap((entry) => Object.keys(entry)))
            ).sort((a, b) => new Date(a) - new Date(b));

            const MAX_COLUMNS = 12;
            const tables = [];

            for (let i = 0; i < allTimeSlots.length; i += MAX_COLUMNS) {
              const currentSlots = allTimeSlots.slice(i, i + MAX_COLUMNS);

              // Ensure the layout always has 12 columns
              while (currentSlots.length < MAX_COLUMNS) {
                currentSlots.push(""); // Empty column
              }

              const tableHTML = `
                <div class="entries_table">
                  <table>
                    <thead>
                      <tr>
                        <th class="column_header column_static_header">Description</th>
                        ${currentSlots.map((col) => `<th class="column_header">${col || "-"}</th>`).join("")}
                      </tr>
                    </thead>
                    <tbody>
                      ${Object.entries(dateWiseMap).map(([desc, timeData]) => {
                        return `
                          <tr>
                            <td>${desc}</td>
                            ${currentSlots.map((slot, idx) => {
                              const val = slot ? (timeData[slot] ?? "-") : "-";
                              return `<td class="${idx % 2 === 0 ? "filled_cell" : ""}">${val}</td>`;
                            }).join("")}
                          </tr>`;
                      }).join("")}
                    </tbody>
                  </table>
                </div>
              `;
              tables.push(tableHTML);
            }

            return tables.join("");
          })()}
        </div>

        <div class="footer">
          <div class="signature_wrapper">
            <div class="signature sign_1"></div>
            <div class="signature sign_2"></div>
          </div>
          <div>
            <!-- <div class="field_wrapper">
              <span class="field_key">Validate By :</span>
              ${approvedByNames.length > 0? approvedByNames.map((name) => `<span class="field_val">${name}</span>`).join(",") : "-"}
            </div> -->
            <!--qid_074-->
            <div class="field_wrapper">
            <span class="field_key">Validate By :</span>
            <span class="field_val">${userName || "-"}</span>
            <!--qid_074-->
            </div>
           <!-- <div class="field_wrapper field_wrapper_2">
              <span class="field_key">Approved By :</span>
              ${approvedByNames.length > 0? approvedByNames.map((name) => `<span class="field_val">${name}</span>`).join(",") : "Pending for Approval"}
            </div> -->
            <!--qid_074-->
            <div class="field_wrapper field_wrapper_2">
            <span class="field_key">Approved By :</span>
            ${allEntriesCompleted ? approvedByNames.map((name) => `<span class="field_val">${name}</span>`).join(", "): `<span class="field_val">Pending for Approval</span>`}
            <!--qid_074-->
          </div>
        </div>
        </div>
      </div>
    </body>
  </html>`;
}


async function generatePDFLandscape(
  data,
  entriesItem,
  reportName,
  userName,
  recurr,
  businessUnit,
  approvedByNames,
  allEntriesCompleted, // qid_074
  frequency,
  timePeriod,
  reportNumber
) {
  try {
    const randomN = Math.floor(Math.random() * 100);
    let reportN;
    let reportH;
    if (recurr === "Manual") {
      reportN = reportName ? `${reportName}-${randomN}` : `file-${randomN}`;
      reportH = "Manual";
    } else {
      reportN = reportName
        ? `${reportName}-${reportNumber}`
        : `file-${reportNumber}`;
      reportH = timePeriod ? timePeriod : "day";
    }
    const folderPath = "internalUploads/reports";
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(
      folderPath,
      `${reportN.replace(/\s+/g, "")}.pdf`
    );
    const htmlContent = generateReportLayoutLandscape(
      data,
      modifyDataLandscape(entriesItem, frequency, timePeriod),
      userName,
      reportH,
      reportName,
      businessUnit,
      approvedByNames,
      allEntriesCompleted // qid_074
    );
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });
    // const page = await browser.newPage();
    // await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    // await page.pdf({
    //   path: filePath,
    //   format: "A3",
    //   timeout: 60000, // Increase timeout to 60 seconds
    //   margin: {
    //     top: "0.3in",
    //     right: "0.3in",
    //     bottom: "0.3in",
    //     left: "0.3in",
    //   },
    //   landscape: true,
    // });
    // await browser.close();
    // const pdfBytes = fs.readFileSync(filePath);
    // const pdfDoc = await PDFDocument.load(pdfBytes);
    const pdfBuffer = await generatePDFFromHTML(htmlContent, { path: filePath, landscape: true });
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle(reportN || "Default Title");
    pdfDoc.setAuthor(userName || "Default Author");
    pdfDoc.setSubject("Report");
    pdfDoc.setKeywords(["report", "pdf", "generated"]);
    const pdfBytesWithMetadata = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytesWithMetadata);
    return { filePath, reportN };
  } catch (err) {
    throw err;
  }
}


async function generatePDFForSingleEntry(
  data,
  entriesItem,
  reportName,
  userName,
  recurr,
  businessUnit,
  approvedByNames,
  validatedBy, //qid_074
  frequency,
  timePeriod,
  reportNumber
) {
  try {
    const randomN = Math.floor(Math.random() * 100);
    let reportN;
    let reportH;
    if (recurr === "Manual") {
      reportN = reportName ? `${reportName}-${randomN}` : `file-${randomN}`;
      reportH = "Manual";
    } else {
      reportN = reportName
        ? `${reportName}-${reportNumber}`
        : `file-${reportNumber}`;
      reportH = timePeriod ? timePeriod : "day";
    }
    const folderPath = "internalUploads/reports";
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(
      folderPath,
      `${reportN.replace(/\s+/g, "")}.pdf`
    );
    const htmlContent = generateReportLayoutForSingleEntry(
      data,
      modifyData(entriesItem, frequency, timePeriod),
      userName,
      reportH,
      reportName,
      businessUnit,
      approvedByNames,
      validatedBy //qid_074
    );
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });
    // const page = await browser.newPage();
    // await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    // await page.pdf({
    //   path: filePath,
    //   format: "A3",
    //   timeout: 60000, // Increase timeout to 60 seconds
    //   margin: {
    //     top: "0.3in",
    //     right: "0.3in",
    //     bottom: "0.3in",
    //     left: "0.3in",
    //   },
    // });
    // await browser.close();
    // const pdfBytes = fs.readFileSync(filePath);
    // const pdfDoc = await PDFDocument.load(pdfBytes);
    const pdfBuffer = await generatePDFFromHTML(htmlContent, { path: filePath });
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle(reportN || "Default Title");
    pdfDoc.setAuthor(userName || "Default Author");
    pdfDoc.setSubject("Report");
    pdfDoc.setKeywords(["report", "pdf", "generated"]);
    const pdfBytesWithMetadata = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytesWithMetadata);
    return { filePath, reportN };
  } catch (err) {
    throw err;
  }
}

// --- Packing Performance Report Template (Landscape) ---
function generatePackingPerformanceReportLayout({
  header,
  oeeTrend,
  tableRows,
  summary,
  skuTable,
  userName,
  businessUnit
}) {
  function generateOeeTrendSVG(trend, width = 600, height = 180) {
    if (!Array.isArray(trend) || trend.length === 0) return '';
    // Take last 7 days
    const data = trend.slice(-7);
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const minVal = 0;
    const maxVal = 100;
    const xStep = data.length > 1 ? chartWidth / (data.length - 1) : 0;

    // Calculate points
    const points = data.map((t, i) => {
      const x = padding + i * xStep;
      const y = height - padding - ((t.value - minVal) * chartHeight) / (maxVal - minVal);
      return { ...t, x, y };
    });

    // Polyline points string
    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return `
      <svg width="${width}" height="${height}">
        <rect x="0" y="0" width="${width}" height="${height}" fill="#f9fbfd" rx="6" ry="6" />
        <!-- Axes -->
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#888" stroke-width="1.5" />
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#888" stroke-width="1.5" />
        <!-- Grid lines and Y labels -->
        ${[0, 20, 40, 60, 80, 100].map(val => {
          const y = height - padding - ((val - minVal) * chartHeight) / (maxVal - minVal);
          return `
            <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#ddd" stroke-dasharray="3,3" />
            <text x="${padding - 8}" y="${y + 4}" font-size="12" text-anchor="end" fill="#555">${val}%</text>
          `;
        }).join('')}
        <!-- Polyline for trend -->
        <polyline fill="none" stroke="#06337e" stroke-width="2.5" points="${polylinePoints}" />
        <!-- Data points and labels -->
        ${points.map((p, index) => {
          const isLastPoint = index === points.length - 1;
          return `
            <circle cx="${p.x}" cy="${p.y}" r="5" fill="#06337e" stroke="#fff" stroke-width="2" />
            <text x="${p.x}" y="${isLastPoint ? p.y - 15 : p.y - 7}" font-size="13" text-anchor="${isLastPoint ? 'middle' : 'start'}" fill="#06337e" font-weight="bold">${p.value}%</text>
          `;
        }).join('')}
        <!-- X labels -->
        ${points.map(p => `
          <text x="${p.x}" y="${height - padding + 18}" font-size="12" text-anchor="middle" fill="#555">${p.date}</text>
        `).join('')}
      </svg>
    `;
  }

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 16px;
          font-size: 13px;
          background: #fff;
        }
        .main-table, .header-table, .footer-table {
          width: 100%;
          border-collapse: collapse;
        }
        .header-table td, .header-table th, .footer-table td {
          border: 2px solid #06337e;
          padding: 8px 10px;
          font-size: 14px;
        }
        .header-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          color: #06337e;
        }
        .header-subtitle {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          color: #06337e;
        }
        .header-label {
          font-weight: bold;
          color: #06337e;
          font-size: 14px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #06337e;
          margin: 14px 0 8px 0;
          text-align: left;
        }
        .oee-trend-area {
          border: 2px solid #06337e;
          background: #f9fbfd;
          padding: 16px 0 0 0;
          margin-bottom: 16px;
          text-align: center;
        }
        .summary-table, .sku-table, .main-table {
          border-collapse: collapse;
          width: 100%;
        }
        .main-table th, .main-table td, .summary-table td, .sku-table th, .sku-table td {
          border: 2px solid #06337e;
          padding: 8px 10px;
        }
        .main-table th, .sku-table th {
          background: #b2c0d7;
          color: #06337e;
          font-weight: bold;
          text-align: center;
          font-size: 16px;
        }
        .main-table td, .sku-table td, .summary-table td {
          font-size: 14px;
        }
        .main-table td.num, .sku-table td.num, .summary-table td.num {
          text-align: right;
        }
        .main-table tr:nth-child(even), .sku-table tr:nth-child(even) {
          background: #f4f7fa;
        }
        .main-table tr.total-row {
          font-weight: bold;
          background: #e6ebf2;
        }
        .summary-table td:first-child {
          font-weight: bold;
          color: #06337e;
          width: 70%;
        }
        .footer-table td {
          font-weight: bold;
          padding: 8px 10px;
          font-size: 16px;
        }
        .footer-table span {
          font-weight: normal;
        }
        .sku-table tr.total-row {
          font-weight: bold;
          background: #e6ebf2;
        }
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          height: 200px;
          flex: 1;
        }
        .summary-table tr {
          height: 25%;
        }
        .summary-table td {
          vertical-align: middle;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td rowspan="3" style="width:110px; text-align:center; vertical-align:middle;">
            <div style="margin-bottom:8px;">${businessUnit.logo1 || 'LOGO 1'}</div>
            <div>${businessUnit.logo2 || 'LOGO 2'}</div>
          </td>
          <td colspan="4" class="header-title">CLONOS</td>
        </tr>
        <tr>
          <td colspan="4" class="header-subtitle">PACKING PERFORMANCE REPORT</td>
        </tr>
        <tr>
          <td colspan="4" style="text-align:center;">Business Unit - ${header.businessUnitName || 'Tuticorin - Business Unit'}</td>
        </tr>
        <tr>
          <td class="header-label">LOG NAME:</td>
          <td>${header.logName || 'PACKING PERFORMANCE REPORT'}</td>
          <td class="header-label">LOG NUMBER:</td>
          <td>${header.logNumber || 'KAIPL - PACKING - 01'}</td>
        </tr>
        <tr>
          <td class="header-label">DATE:</td>
          <td>${header.date || ''}</td>
          <td class="header-label">DESCRIPTION:</td>
          <td colspan="2">${header.description || 'Overview of packing line efficiency with SKU-wise output, shift performance, and identified loss metrics.'}</td>
        </tr>
      </table>

      <!-- OEE Trend and Summary -->
      <div style="display: flex; flex-direction: row; align-items: flex-start; margin-bottom: 8px; gap: 16px;">
        <div style="width: 66.7%; min-width: 600px;">
          <div class="section-title" style="font-size:18px; margin-bottom: 4px;">OEE TREND</div>
          <div class="oee-trend-area" style="height: 180px;">
            ${typeof generateOeeTrendSVG === 'function' ? generateOeeTrendSVG(oeeTrend, 950, 170) : ''}
          </div>
        </div>
        <div style="width: 33.3%; min-width: 340px;">
          <div class="section-title" style="font-size:18px; margin-bottom: 4px;">OEE SUMMARY</div>
          <table class="summary-table">
            <tr><td>OEE</td><td class="num">${summary.oee !== undefined && summary.oee !== null ? summary.oee + '%' : '-'}</td></tr>
            <tr><td>MANAGEMENT LOSS</td><td class="num">${summary.managementLoss !== undefined && summary.managementLoss !== null ? summary.managementLoss + '%' : '-'}</td></tr>
            <tr><td>BREAKDOWN LOSS</td><td class="num">${summary.breakdownLoss !== undefined && summary.breakdownLoss !== null ? summary.breakdownLoss + '%' : '-'}</td></tr>
            <tr><td>QUALITY LOSS</td><td class="num">${summary.qualityLoss !== undefined && summary.qualityLoss !== null ? summary.qualityLoss + '%' : '-'}</td></tr>
          </table>
        </div>
      </div>

      <!-- Packing Performance Table and SKU Table -->
      <div style="display:flex; gap:16px;">
        <div style="width:66.7%;">
          <div class="section-title" style="margin-top: 6px; margin-bottom: 4px;">PACKING PERFORMANCE</div>
          <table class="main-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Capacity</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>Total</th>
                <th>Achieved</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.map(row => {
                const isTotal = row.description === 'TOTAL';
                const totalVal = row.total !== undefined ? Number(row.total).toFixed(2) : '';
                const achievedVal = row.achieved !== undefined && row.achieved !== '' ? Number(row.achieved).toFixed(2) : '';
                return `<tr class="${isTotal ? 'total-row' : ''}">
                  <td>${row.description}</td>
                  <td class="num">${isTotal ? Number(row.capacity).toFixed(2) : row.capacity}</td>
                  <td class="num">${row.a ?? ''}</td>
                  <td class="num">${row.b}</td>
                  <td class="num">${row.c}</td>
                  <td class="num">${totalVal}</td>
                  <td class="num">${achievedVal}${achievedVal !== '' ? '%' : ''}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div style="width:33.3%;">
          <div class="section-title" style="margin-top: 6px; margin-bottom: 4px;">SKU SUMMARY</div>
          <table class="sku-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>SKU in MT</th>
                <th>SKU in Boxes</th>
              </tr>
            </thead>
            <tbody>
              ${skuTable.map((row, idx) => {
                if (row.description === 'TOTAL') {
                  return `<tr class="total-row"><td>${row.description}</td><td class="num">${row.skuInMT}</td><td class="num">${row.skuInBoxes}</td></tr>`;
                }
                if (!row.description && !row.skuInMT && !row.skuInBoxes) {
                  return `<tr><td>&nbsp;</td><td class="num"></td><td class="num"></td></tr>`;
                }
                return `<tr><td>${row.description}</td><td class="num">${row.skuInMT}</td><td class="num">${row.skuInBoxes}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <table class="footer-table" style="margin-top:18px;">
        <tr>
          <td width="50%">Validated By: <span>${userName || '-'}</span></td>
          <td width="50%">Approved By: <span>${userName || '-'}</span></td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

/**
 * Transform line descriptions to match database format
 * @param {Array} tableRows - The table rows with original descriptions
 * @returns {Array} Table rows with transformed descriptions
 */
function transformLineDescriptions(tableRows) {
  const descriptionMap = {
    'Line 1_ (1 Lit)': 'Line 1 (1 lit)',
    'Line 2_ (1Lit)': 'Line 2 (1 lit)',
    'Line 3_ (500 ml )': 'Line 3 (1/2 lit)',
    'Line 4_ (RFS 1 Lit)': 'Line 4 (RSF 1LT)',
    'Line 4_ (RBD 850g)': 'Line 4 (RBD 850G)',
    'Line 4_ (RFS 500 ml)': 'Line 4 (RFS 500 ml)',
    'Line 5_( Rs 10)': 'Line 5 ( Rs 10)',
    'Line 5_( Rs 20)': 'Line 5 (Rs 20)',
    'Line 5_ (200 ml)': 'Line 5 (200 ml)',
    'Line 6_ (5 Lit Jar)': 'Line 6 (5 lit JAR)',
    'Line 7_ (Kg-Tin)': 'Line 7 (Kg/Tin)',
    'Line 7_ (Lit-Tin)': 'Line 7 (Ltr/Tin)'
  };

  return tableRows.map(row => {
    if (row.description === 'TOTAL') {
      return row;
    }
    return {
      ...row,
      description: descriptionMap[row.description] || row.description
    };
  });
}

async function generatePackingPerformancePDF({
  header,
  oeeTrend,
  tableRows,
  summary,
  skuTable,
  userName,
  businessUnit
}) {
  // const puppeteer = require("puppeteer");
  // const fs = require("fs");
  // const path = require("path");
  // const { PDFDocument } = require("pdf-lib");
  try {
    const randomN = Math.floor(Math.random() * 10000);
    const folderPath = "internalUploads/reports";
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(folderPath, `PackingPerformanceReport-${randomN}.pdf`);

    // Transform line descriptions before generating PDF
    const transformedTableRows = transformLineDescriptions(tableRows);

    const htmlContent = generatePackingPerformanceReportLayout({
      header,
      oeeTrend,
      tableRows: transformedTableRows,
      summary,
      skuTable,
      userName,
      businessUnit
    });
    // Commented below lines for CPU utilisation
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });
    // const page = await browser.newPage();
    // await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    // await page.pdf({
    //   path: filePath,
    //   format: "A3",
    //   landscape: true,
    //   timeout: 60000,
    //   margin: {
    //     top: "0.3in",
    //     right: "0.3in",
    //     bottom: "0.3in",
    //     left: "0.3in",
    //   },
    // });
    // await browser.close();
    // const pdfBytes = fs.readFileSync(filePath);
    // const pdfDoc = await PDFDocument.load(pdfBytes);
    const pdfBuffer = await generatePDFFromHTML(htmlContent, { path: filePath, landscape: true });
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle("Packing Performance Report");
    pdfDoc.setAuthor(userName || "Default Author");
    pdfDoc.setSubject("Packing Performance Report");
    pdfDoc.setKeywords(["packing", "performance", "report"]);
    const pdfBytesWithMetadata = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytesWithMetadata);
    return { filePath, reportN: `PackingPerformanceReport-${randomN}` };
  } catch (err) {
    throw err;
  }
}

/**
 * Normalize a field name for matching config and DB fields.
 */
function normalizeFieldName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Fetch log entries for a given logId and date, and build tableRows for the Packing Performance Report.
 * Maps SHIFT 1 to C, SHIFT 2 to D, SHIFT 3 to E.
 * @param {string} logId
 * @param {string} dateStr - e.g., '2025-05-15'
 * @returns {Promise<Array>} tableRows
 */
async function buildPackingPerformanceTableRows(logId, dateStr) {
  // Calculate UTC range for the IST day
  // const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istOffsetMs = 0;
  const istOffsetPs = 0.42 * 60 * 60 * 1000;
  const start = new Date(new Date(dateStr).getTime() - istOffsetMs + istOffsetPs);
  const end = new Date(new Date(dateStr).getTime() + (24 * 60 * 60 * 1000 - 1) - istOffsetMs + istOffsetPs);
  const entries = await LogEntryModel.find({
    logId,
    entryCreatedAt: { $gte: start, $lte: end },
    status:{$in:["completed", "pendingForApproval"]}
  }).lean();
 
  let shiftCounter = 0
  // Map entries by active shift
  const shiftMap = {};

  for (const entry of entries) {
    const shiftField = entry.data.find(f => normalizeFieldName(f.fieldName) === 'shift');
    if (shiftField && Array.isArray(shiftField.fieldValue)) {
      const activeShift = shiftField.fieldValue.find(opt => opt.isActive);
      if (activeShift) {
        if (activeShift.optionValue === 'SHIFT 1') {
          shiftMap.C = entry
          shiftCounter++
        };
        if (activeShift.optionValue === 'SHIFT 2') {
          shiftMap.D = entry
          shiftCounter++
        };
        if (activeShift.optionValue === 'SHIFT 3') {
          shiftMap.E = entry
          shiftCounter++
        };
      }
    }
  }
 

  // Build tableRows using config and log entry data
  let tableRows = Object.keys(capacityPerShift).map(line => {
    // Normalize for DB field matching
    const normLine = normalizeFieldName(line);
    const getVal = (entry) => {
      if (!entry) return 0;
      const f = entry.data.find(f => normalizeFieldName(f.fieldName) === normLine);
      return f ? Number(f.fieldValue) : 0;
    };
    const b = capacityPerShift[line] || 0;
    const c = getVal(shiftMap.C) * formulaForShiftAndCapacity[line];
    const d = getVal(shiftMap.D) * formulaForShiftAndCapacity[line];
    const e = getVal(shiftMap.E) * formulaForShiftAndCapacity[line];
    const total = c + d + e;
    const achieved = b ? shiftCounter? Number((((total / b)/shiftCounter) * 100).toFixed(2)) : 0 : 0;

    // Store raw shift values for SKU boxes calculation
    const rawShiftValues = {
      a: getVal(shiftMap.C),
      b: getVal(shiftMap.D),
      c: getVal(shiftMap.E)
    };

    return {
      description: line,
      capacity: b.toFixed(2),
      a: c.toFixed(2),
      b: d.toFixed(2),
      c: e.toFixed(2),
      total,
      achieved,
      rawShiftValues // Add raw shift values for SKU boxes calculation
    };
  });

  // Fix: Only sum data rows (not TOTAL row) for each column, and round to 2 decimals
  const sum = (key) => tableRows.reduce((acc, row) => {
    if (row.description !== 'TOTAL' && !isNaN(Number(row[key]))) {
      return acc + Number(row[key]);
    }
    return acc;
  }, 0);

  const totalRow = {
    description: 'TOTAL',
    capacity: sum('capacity').toFixed(2),
    a: sum('a').toFixed(2),
    b: sum('b').toFixed(2),
    c: sum('c').toFixed(2),
    total: sum('total').toFixed(2),
    achieved: (((sum('total')/sum('capacity'))/3)*100).toFixed(2),
  }
  tableRows.push(totalRow);
 
  return tableRows;
}

/**
 * Build the SKU table for the Packing Performance Report.
 * @param {Array} tableRows - The main table rows (with totals)
 * @returns {Array} skuTable
 */
function buildSkuTable(tableRows) {
  // Updated mapping with new requirements
  const skuMap = [
    { 
      description: 'RSF 1 Lit', 
      mainRows: ['Line 1_ (1 Lit)', 'Line 2_ (1Lit)', 'Line 4_ (RFS 1 Lit)'] 
    },
    { 
      description: 'RSF 1/2 Lit', 
      mainRows: ['Line 3_ (500 ml )', 'Line 4_ (RFS 500 ml)'] 
    },
    { 
      description: 'RSF Rs.10', 
      mainRows: ['Line 5_( Rs 10)'] 
    },
    { 
      description: 'RSF Rs.20', 
      mainRows: ['Line 5_( Rs 20)'] 
    },
    { 
      description: 'RSF 200ml', 
      mainRows: ['Line 5_ (200 ml)'] 
    },
    { 
      description: 'RSF 5 Lit JAR', 
      mainRows: ['Line 6_ (5 Lit Jar)'] 
    },
    { 
      description: 'RBD 850G', 
      mainRows: ['Line 4_ (RBD 850g)'] 
    },
    { 
      description: 'RSF 15L Tin', 
      mainRows: ['Line 7_ (Lit-Tin)'] 
    },
    { 
      description: 'RSF 15KG Tin', 
      mainRows: ['Line 7_ (Lit-Tin)'] 
    }
  ];

  const skuRows = skuMap.map(({ description, mainRows }) => {
    // Calculate SKU in MT (using total values)
    const totalMT = mainRows.reduce((acc, mainRow) => {
    const row = tableRows.find(r => r.description === mainRow) || {};
      return acc + (Number(row.total) || 0);
    }, 0);

    // Calculate SKU in Boxes (using raw shift values)
    const totalBoxes = mainRows.reduce((acc, mainRow) => {
      const row = tableRows.find(r => r.description === mainRow) || {};
      if (row.rawShiftValues) {
        return acc + (Number(row.rawShiftValues.a) || 0) + 
                     (Number(row.rawShiftValues.b) || 0) + 
                     (Number(row.rawShiftValues.c) || 0);
      }
      return acc;
    }, 0);

    return {
      description,
      skuInMT: totalMT.toFixed(2),
      skuInBoxes: totalBoxes.toFixed(2)
    };
  });

  // Add blank rows
  skuRows.push({ description: '', skuInMT: '', skuInBoxes: '' });
  skuRows.push({ description: '', skuInMT: '', skuInBoxes: '' });
  skuRows.push({ description: '', skuInMT: '', skuInBoxes: '' });


  // Add TOTAL row (sum of all values)
  const totalMT = skuRows.reduce((acc, row) => {
    return acc + (Number(row.skuInMT) || 0);
  }, 0).toFixed(2);

  const totalBoxes = skuRows.reduce((acc, row) => {
    return acc + (Number(row.skuInBoxes) || 0);
  }, 0).toFixed(2);

  skuRows.push({ 
    description: 'TOTAL', 
    skuInMT: totalMT,
    skuInBoxes: totalBoxes
  });
  while (skuRows.length < tableRows.length) {
    skuRows.push({ description: '', skuInMT: '', skuInBoxes: '' });
  }

  return skuRows;
}

/**
 * Build the summary box (OEE, Management Loss, Breakdown Loss, Quality Loss)
 * @param {Array} tableRows - The main table rows (with totals)
 * @returns {Object} summary
 */
function buildSummary(tableRows) {
  // Example: OEE = ((Total Achieved) / (Total B)) * 100
  const totalRow = tableRows.find(r => r.description === 'TOTAL') || {};
  const oee = totalRow.capacity ? Number((((totalRow.total / totalRow.capacity)/3) * 100).toFixed(2)) : 0;
  // Placeholder values for losses; replace with your actual logic if needed
  return {
    oee,
    managementLoss: undefined,
    breakdownLoss: undefined,
    qualityLoss: undefined,
  };
}

/**
 * Calculate OEE trend for the last 5 days
 * @param {string} logId - The log ID
 * @param {string} currentDate - The current date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of OEE values for the last 5 days
 */
async function calculateOeeTrend(logId, currentDate) {
  const oeeTrend = [];
  const currentDateObj = new Date(currentDate);
  
  // Calculate for last 6 days
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDateObj);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Get table rows for this date
    const tableRows = await buildPackingPerformanceTableRows(logId, dateStr);
    
    // Calculate OEE for this date
    const totalRow = tableRows.find(r => r.description === 'TOTAL');
    const oee = totalRow ? Number(totalRow.achieved) : 0;
    
    oeeTrend.push({
      date: dateStr,
      value: oee
    });
  }
  
  return oeeTrend;
}

async function generatePackingPerformanceReport() {
  const logId = '681dbfb02f258c0749cf56d3'; // Use your test logId
//   const dateStr = new Date().toISOString().split('T')[0]; // Use a date with data in your DB
// const currentDate = DateTime.now();
  const currentDate = DateTime.now();
  const yesterday = currentDate.minus({ days: 1 });
   dateStr = yesterday.toISODate(); 


    const istOffsetMs = (24 * 60 * 60 * 1000 );
  const istOffsetPs = 0.42 * 60 * 60 * 1000;
  let start = new Date(new Date(dateStr).getTime() - istOffsetMs + istOffsetPs);
  let end = new Date(new Date(dateStr).getTime() + (24 * 60 * 60 * 1000 - 1) - istOffsetMs + istOffsetPs);

  //convert it to json time object

  start = start.toJSON();
  end = end.toJSON();

  //check logid is valid and present in database else break the function

  const log = await LogModel.findById(logId);
  const businessUnitData = await businessUnit_model.findById(log.businessUnit);
  const createdUser = await user_model.findById(log.createdBy);
  if (!log) {
    return;
  }

  // Build main table
  const tableRows = await buildPackingPerformanceTableRows(logId, dateStr);


  // Build SKU table and summary
  const skuTable = buildSkuTable(tableRows);
  const summary = buildSummary(tableRows);

  // Calculate OEE trend for last 5 days
  const oeeTrend = await calculateOeeTrend(logId, dateStr);

  // Example header
  const header = {
    logName: 'PACKING PERFORMANCE REPORT',
    logNumber: 'KAIPL - PACKING - 01',
    description: 'Overview of packing line efficiency with SKU-wise output, shift performance, and identified loss metrics.',
    date: dateStr,
    businessUnitName: 'Tuticorin'
  };
  const userName = createdUser.name;
  const businessUnit = { 
    logo1: businessUnitData.logo1, 
    logo2: businessUnitData.logo2
  }; // Add logo HTML or URLs if needed
  
  // Generate PDF

  const result = await generatePackingPerformancePDF({
    header,
    oeeTrend,
    tableRows,
    summary,
    skuTable,
    userName,
    businessUnit
  });
 if(process.env.SEND_EMAIL_ON_SCHEDULE_REPORT == "true" && process.env.SEND_EMAIL == "true"){
    const fileContent = fs.readFileSync(result.filePath);
    const fileName = `${header.logName}_${currentDate.toString().split('T')[0]}${currentDate.toString().split('T')[1].split('.')[0]}.pdf`;
    const attachments = [{ content: fileContent, filename: fileName }];
    // Simplified constructor - only essential data
    const constructedData = await constructPackingReportTemplateData(
        userName,
        "Scheduled", 
        log.name, 
        { start: start, end: end }, 
        currentDate.toString(),
        attachments
    );
          const emailNotificationRecipients = log.emailNotificationRecipients;
          const ccEmailNotificationRecipients = [];
          if (emailNotificationRecipients && emailNotificationRecipients.length > 0) {
            for (let i = 0; i < emailNotificationRecipients.length; i++) {
              let emailNotificationRecipientsUserObj = await user_model.findOne( { _id: emailNotificationRecipients[i] }, { _id: 0, name: 1, email: 1 }); 
              if (emailNotificationRecipientsUserObj) {
                ccEmailNotificationRecipients.push(emailNotificationRecipientsUserObj.email);
              }
            }
          }
    constructedData.cc = ccEmailNotificationRecipients;
    await sendPackingReportEmail([createdUser.email], `Packing Performance - ${log.name}`, constructedData);
}

  console.log('PDF generated at:', result.filePath);
}

function generateExcelLayoutLandscape(
  data,
  shiftViseData,
  userName,
  recurr,
  entityName,
  businessUnit,
  approvedByNames,
  options = {}
) {
  const {
    output = 'buffer',
    compression = true,
    fastThreshold = 50000,
    forceFast = false
  } = options;

  const wb = XLSX.utils.book_new();

  // -- Summary title rows --
  const summaryTitleRows = [
    ["CLONOS"],
    ["Business Unit", businessUnit?.name || ""],
    ["Log Name", entityName || ""],
    ["Recurrence", recurr || ""],
    []
  ];

  // -- Checklist rows --
  const checklistAoA = (Array.isArray(data) ? data : []).map(item => {
    const leftKey = item?.leftSide?.key ?? "";
    const leftVal = item?.leftSide?.value ?? "";
    let rightKey = "";
    let rightVal = "";

    if (Array.isArray(item?.rightSide)) {
      rightKey = item.rightSide?.[0]?.key ?? "Assignees";
      const assignees = (item.rightSide?.[0]?.value || [])
        .map(u => u?.name || "").filter(Boolean).join(", ");
      const approverKey = item.rightSide?.[1]?.key ?? "Approver";
      const approverName = item.rightSide?.[1]?.value?.name || "";
      rightVal = assignees || "";
      if (approverName) rightVal = rightVal
        ? `${rightVal} | ${approverKey}: ${approverName}`
        : `${approverKey}: ${approverName}`;
    } else {
      rightKey = item?.rightSide?.key ?? "";
      rightVal = item?.rightSide?.value ?? "";
    }

    return [leftKey, leftVal, "", rightKey, rightVal];
  });

  // Start building AoA for the Summary sheet
  let finalSummaryAoA = [...summaryTitleRows, ...checklistAoA];

  const transformShiftData = (shiftDataArray) => {
    const groupedData = {};
    (shiftDataArray || []).forEach(shift => {
      if (!shift || !Array.isArray(shift.dataFields)) return;
      shift.dataFields.forEach(fieldEntry => {
        const field = fieldEntry?.fieldName;
        const dop = shift.dop;
        const value = fieldEntry?.fieldValue;
        if (!field || !dop) return;
        if (!groupedData[field]) groupedData[field] = {};
        groupedData[field][dop] = value;
      });
    });
    return [{
      data: Object.entries(groupedData).map(([field, newEntries]) => ({ field, newEntries }))
    }];
  };

  const shiftedExcelData = transformShiftData(shiftViseData);

  const dateWiseMap = {};
  const fieldOrder = [];
  (shiftedExcelData || []).forEach(shift => {
    (shift?.data || []).forEach(row => {
      const field = row?.field;
      if (!field) return;
      if (!dateWiseMap[field]) { dateWiseMap[field] = {}; fieldOrder.push(field); }
      Object.entries(row?.newEntries || {}).forEach(([timestamp, value]) => {
        if (!timestamp || typeof timestamp !== "string") return;
        const t = timestamp.includes(" ") ? timestamp : timestamp.replace("T", " ");
        const full = normalizeTimestamp(t);
        dateWiseMap[field][full] = value;
      });
    });
  });

  const allTimeSlots = Array.from(
    new Set(Object.values(dateWiseMap).flatMap(entry => Object.keys(entry)))
  ).sort((a, b) => a.localeCompare(b));

  const headerRow = ["Description", ...allTimeSlots.map(s => s || "-")];
  const rowsAoA = fieldOrder.map(desc => {
    const timeData = dateWiseMap[desc] || {};
    const vals = allTimeSlots.map(slot => {
      if (!slot) return "-";
      const v = timeData[slot];
      return v == null || v === "" ? "-" : v;
    });
    return [desc, ...vals];
  });

  // Add a gap before LogData
  finalSummaryAoA.push([]);
  finalSummaryAoA.push(["Log Data Entries"]);

  const logHeaderRowIndex = finalSummaryAoA.length;

  finalSummaryAoA.push(headerRow, ...rowsAoA);
  finalSummaryAoA.push([]);
  finalSummaryAoA.push([
    "Validated By", 
    (Array.isArray(approvedByNames) && approvedByNames.length > 0) 
      ? approvedByNames.join(", ") 
      : "N/A"
  ]);
  finalSummaryAoA.push([
    "Approved By", 
    (Array.isArray(approvedByNames) && approvedByNames.length > 0) 
      ? approvedByNames.join(", ") 
      : "N/A"
  ]);

 
  const wsSummary = XLSX.utils.aoa_to_sheet(finalSummaryAoA);
  removeMerges(wsSummary);

  // Title styles
  const titleAddr = XLSX.utils.encode_cell({ r: 0, c: 0 });
  wsSummary[titleAddr].s = {
    font: { bold: true, sz: 26 },
    alignment: { horizontal: "centerContinuous", vertical: "center" }
  };

  // Borders and formatting
  const endRow = finalSummaryAoA.length - 1;
  const endCol = finalSummaryAoA[0] ? finalSummaryAoA[0].length - 1 : 0;
  const cellsCount = finalSummaryAoA.length * (finalSummaryAoA[0] ? finalSummaryAoA[0].length : 0);
  const fast = forceFast || cellsCount > fastThreshold;
  (fast ? applyOuterBorder : applyBorders)(wsSummary, 0, 0, endRow, endCol);

  if (logHeaderRowIndex >= 0) {
    const lastCol = finalSummaryAoA[logHeaderRowIndex].length - 1;
    wsSummary['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: logHeaderRowIndex, c: 0 },
        e: { r: logHeaderRowIndex, c: lastCol }
      })
    };
    wsSummary['!freeze'] = { xSplit: 1, ySplit: logHeaderRowIndex + 1 };
  }

  autoWidthAoA(wsSummary, finalSummaryAoA, 0, { padding: 2, min: 10, max: 80 });
  if (!wsSummary['!cols']) wsSummary['!cols'] = [];
  wsSummary['!cols'][0] = { wch: Math.max(wsSummary['!cols'][0]?.wch || 0, 24) };
  wsSummary['!pageSetup'] = {
    orientation: "landscape",
    fitToWidth: 1, fitToHeight: 0,
    margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
  };

  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

 
  const writeOpts = { bookType: 'xlsx', compression };
  if (output === 'buffer') {
    const buffer = XLSX.write(wb, { ...writeOpts, type: 'buffer' });

    const folderPath = "internalUploads/reports";
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileName = `${entityName || "Report"}_${Date.now()}`;
    const filePath = path.join(folderPath, `${fileName}.xlsx`);

    fs.writeFileSync(filePath, buffer);

    return { buffer, filePath };
  }
}

function normalizeTimestamp(ts) {
  if (!ts) return "";
  let t = String(ts).replace("T", " ");
  const [date = "", timeRaw = ""] = t.split(" ");
  let [h = "00", m = "00"] = timeRaw.split(":");
  h = String(h).padStart(2, "0");
  m = String(m).padStart(2, "0");
  return `${date} ${h}:${m}`;
}

/**
 * Remove all merges from a SheetJS worksheet.
 */
function removeMerges(ws) {
  if (ws && ws['!merges']) delete ws['!merges'];
}

/**
 * Automatically size columns based on array-of-arrays cell lengths.
 */
function autoWidthAoA(ws, aoa, originCol = 0, opts = {}) {
  const { padding = 2, min = 6, max = 80 } = opts;
  if (!Array.isArray(aoa) || aoa.length === 0) return;
  const maxCols = aoa.reduce((m, r) => Math.max(m, r.length), 0);
  if (!ws['!cols']) ws['!cols'] = [];
  for (let c = 0; c < maxCols; c++) {
    let maxLen = 0;
    for (let r = 0; r < aoa.length; r++) {
      const v = aoa[r][c];
      if (v == null) continue;
      const s = String(v);
      if (s.length > maxLen) maxLen = s.length;
    }
    const wch = Math.min(Math.max(maxLen + padding, min), max);
    const colIdx = originCol + c;
    if (!ws['!cols'][colIdx] || (ws['!cols'][colIdx].wch || 0) < wch) {
      ws['!cols'][colIdx] = { wch };
    }
  }
}

/**
 * Apply thin borders to a rectangle region on worksheet.
 */
function applyBorders(ws, r0, c0, r1, c1) {
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;
      cell.s = cell.s || {};
      cell.s.border = {
        top:    { style: "thin", color: { auto: 1 } },
        bottom: { style: "thin", color: { auto: 1 } },
        left:   { style: "thin", color: { auto: 1 } },
        right:  { style: "thin", color: { auto: 1 } }
      };
    }
  }
}

/**
 * Apply thin border just to perimeter (outer edge) of given region.
 */
function applyOuterBorder(ws, r0, c0, r1, c1) {
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const edge = (r === r0 || r === r1 || c === c0 || c === c1);
      if (!edge) continue;
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;
      cell.s = cell.s || {};
      const b = {};
      if (r === r0) b.top = { style: "thin", color: { auto: 1 } };
      if (r === r1) b.bottom = { style: "thin", color: { auto: 1 } };
      if (c === c0) b.left = { style: "thin", color: { auto: 1 } };
      if (c === c1) b.right = { style: "thin", color: { auto: 1 } };
      cell.s.border = { ...cell.s.border, ...b };
    }
  }
}




module.exports = {
  generatePDF,
  generatePDFForSingleEntry,
  generatePackingPerformanceReport,
  generatePDFLandscape,
  generateExcelLayoutLandscape,
  generateWorkOrderPDF
};
