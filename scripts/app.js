const errorMessage = document.querySelector('#errorMessage');

const previousPage = document.querySelector('#previousPage');
const nextPage = document.querySelector('#nextPage');

const pageInfo = document.querySelector('#pageInfo');
const pageCount = document.querySelector('#pageCount');
const currentPage = document.querySelector('#currentPage');


const url = './docs/document.pdf';

let pdfDocument = null;
let pageNumber = 1;
let pageIsRendering = false;
let pendingPageNumber = null;

const scale = 1.0;
const pdfCanvas = document.querySelector('#pdf-canvas');
let ctx = pdfCanvas.getContext('2d');

// render the page
async function renderPage(number) {
    pageIsRendering = true;

    let page = await pdfDocument.getPage(number);
    console.log(page);

    // set the scale
    let viewport = await page.getViewport({ scale: scale });
    pdfCanvas.height = viewport.height;
    pdfCanvas.width = viewport.width;

    const renderCtx = { canvasContext: ctx, viewport: viewport };

    page.render(renderCtx).promise.then(() => {
        pageIsRendering = false;

        if (pendingPageNumber !== null) {
            renderPage(pendingPageNumber);
            pendingPageNumber = null;
        }
    });

    // output current page
    currentPage.textContent = pageNumber;
}

// check for pages rendering
function queueRenderPage(number) {
    if (pageIsRendering) {
        pendingPageNumber = number;
    } else {
        renderPage(number);
    }
}

// go to previous page
previousPage.addEventListener('click', showPreviousPage);

function showPreviousPage() {
    if (pageNumber == 1) {
        return;
    }
    pageNumber--;
    queueRenderPage(pageNumber);
}

// got to next page
nextPage.addEventListener('click', showNextPage);

function showNextPage() {
    if (pageNumber == pdfDocument._pdfInfo.numPages) {
        return;
    }
    pageNumber++;
    queueRenderPage(pageNumber);
}

// get the pdf document
pdfjsLib.getDocument(url).promise.then(pdfDoc => {
        pdfDocument = pdfDoc;
        // console.log(pdfDocument);
        pageCount.textContent = pdfDocument._pdfInfo.numPages;

        renderPage(pageNumber);
}).catch (e => {
    pageInfo.style.display = 'none';
    errorMessage.textContent = e.message;
    errorMessage.style.display = 'block';
});




